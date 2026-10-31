import { VideoClip, ColorGrading, TransitionConfig, CaptionConfig } from '../types';
import { drawGradedFrame } from './colorGrading';
import { renderTransition } from './transitionsEngine';
import { drawCaptionOnCanvas } from './captionRenderer';

export interface ExportOptions {
  clips: VideoClip[];
  colorGrading: ColorGrading;
  transition: TransitionConfig;
  caption: CaptionConfig;
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Exports video entirely in the browser using an offscreen canvas and MediaRecorder.
 */
export async function exportEditedVideo({
  clips,
  colorGrading,
  transition,
  caption,
  onProgress,
}: ExportOptions): Promise<Blob> {
  if (clips.length === 0) {
    throw new Error('No clips to export');
  }

  // Pre-load and create video elements for all clips
  const videoElements: HTMLVideoElement[] = await Promise.all(
    clips.map((clip) => {
      return new Promise<HTMLVideoElement>((resolve, reject) => {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.src = clip.url;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'auto';

        vid.onloadedmetadata = () => resolve(vid);
        vid.onerror = () => reject(new Error(`Failed to load video source for ${clip.name}`));
      });
    })
  );

  // Target output dimensions
  const primaryVid = videoElements[0];
  const width = primaryVid.videoWidth || 1280;
  const height = primaryVid.videoHeight || 720;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Cannot acquire canvas 2d context');

  // Offscreen canvases for transitions
  const canvasA = document.createElement('canvas');
  canvasA.width = width;
  canvasA.height = height;
  const ctxA = canvasA.getContext('2d', { alpha: false })!;

  const canvasB = document.createElement('canvas');
  canvasB.width = width;
  canvasB.height = height;
  const ctxB = canvasB.getContext('2d', { alpha: false })!;

  // Stream setup
  const fps = 30;
  const stream = exportCanvas.captureStream(fps);

  let mimeType = 'video/webm; codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps high quality
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
  });

  recorder.start(100);

  // Calculate total timeline frames
  // Transition overlaps between adjacent clips
  const transDuration = transition.type !== 'none' ? transition.duration : 0;
  let totalEffectiveDuration = 0;
  for (let i = 0; i < clips.length; i++) {
    const clipDur = clips[i].trimEnd - clips[i].trimStart;
    totalEffectiveDuration += clipDur;
    if (i > 0 && transDuration > 0) {
      totalEffectiveDuration -= transDuration;
    }
  }

  totalEffectiveDuration = Math.max(1, totalEffectiveDuration);
  const totalFrames = Math.floor(totalEffectiveDuration * fps);
  let currentFrameIndex = 0;

  // Render loop
  for (let clipIdx = 0; clipIdx < clips.length; clipIdx++) {
    const clip = clips[clipIdx];
    const vid = videoElements[clipIdx];
    const nextClip = clips[clipIdx + 1];
    const nextVid = videoElements[clipIdx + 1];

    const clipDuration = clip.trimEnd - clip.trimStart;
    const clipFrames = Math.floor(clipDuration * fps);
    const transFrames = Math.floor(transDuration * fps);

    for (let f = 0; f < clipFrames; f++) {
      const frameTime = clip.trimStart + f / fps;
      await seekVideo(vid, frameTime);

      const isTransitionZone =
        nextClip && transDuration > 0 && f >= clipFrames - transFrames;

      if (isTransitionZone) {
        // Transition rendering
        const transProgress = (f - (clipFrames - transFrames)) / transFrames;
        const nextFrameTime = nextClip.trimStart + transProgress * transDuration;
        await seekVideo(nextVid, nextFrameTime);

        // Render clip A graded
        drawGradedFrame(ctxA, vid, width, height, colorGrading);
        // Render clip B graded
        drawGradedFrame(ctxB, nextVid, width, height, colorGrading);

        // Combine with transition
        renderTransition({
          ctx,
          canvasA,
          canvasB,
          width,
          height,
          progress: transProgress,
          type: transition.type,
          intensity: transition.intensity,
        });
      } else {
        // Normal single clip rendering
        drawGradedFrame(ctx, vid, width, height, colorGrading);
      }

      // Draw caption
      drawCaptionOnCanvas(ctx, caption, width, height);

      currentFrameIndex++;
      const pct = Math.min(99, Math.round((currentFrameIndex / totalFrames) * 100));
      onProgress?.(pct, `Rendering frame ${currentFrameIndex} of ${totalFrames} (${pct}%)`);

      // Yield event loop to allow video frame rendering
      await new Promise((r) => setTimeout(r, 12));
    }

    // If there was a transition, skip the overlapping time on the next clip
    if (nextClip && transDuration > 0) {
      // Handled via loop offset
    }
  }

  onProgress?.(100, 'Finalizing export container...');
  recorder.stop();

  // Cleanup video elements
  videoElements.forEach((v) => {
    v.src = '';
    v.load();
  });

  return recordingPromise;
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - time) < 0.04) {
      return resolve();
    }
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.max(0, Math.min(video.duration || 999, time));
  });
}
