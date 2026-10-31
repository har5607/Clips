/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  VideoClip,
  ColorGrading,
  TransitionConfig,
  CaptionConfig,
  AiGradeResponse,
  AiTransitionResponse,
} from './types';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { TrimTimeline } from './components/TrimTimeline';
import { ColorGradingPanel } from './components/ColorGradingPanel';
import { TransitionsPanel } from './components/TransitionsPanel';
import { CaptionPanel } from './components/CaptionPanel';
import { ExportModal } from './components/ExportModal';
import { COLOR_PRESETS, drawGradedFrame } from './utils/colorGrading';
import { SAMPLE_VIDEOS, SampleVideoOption } from './utils/sampleVideos';
import { exportEditedVideo } from './utils/videoExporter';
import { drawCaptionOnCanvas } from './utils/captionRenderer';
import { SeoContentSection } from './components/SeoContentSection';
import { Download, Film, Sparkles, Layers, Sliders, Type, Scissors } from 'lucide-react';

export default function App() {
  // Video Clips timeline
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Active Tab for Sidebar Controls: 'look' (Color Grading), 'transitions', 'trim', 'caption'
  const [activeTab, setActiveTab] = useState<'look' | 'transitions' | 'trim' | 'caption'>('look');

  // Color Grading State (defaults matching PDF 100% / neutral)
  const [colorGrading, setColorGrading] = useState<ColorGrading>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
    sharpness: 0,
    filmGrain: 0,
    preset: 'original',
  });

  // AI Diagnostic info
  const [aiDiagnosis, setAiDiagnosis] = useState<AiGradeResponse | null>(null);
  const [isGradingLoading, setIsGradingLoading] = useState<boolean>(false);

  // Transitions State
  const [transition, setTransition] = useState<TransitionConfig>({
    type: 'crossfade',
    duration: 0.6,
    intensity: 75,
    title: 'Cross Dissolve',
  });
  const [aiTransitionData, setAiTransitionData] = useState<AiTransitionResponse | null>(null);
  const [isAiTransitionLoading, setIsAiTransitionLoading] = useState<boolean>(false);

  // Caption State (matching PDF defaults: bottom position, 6% size, white text)
  const [caption, setCaption] = useState<CaptionConfig>({
    text: '',
    position: 'bottom',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.75)',
    hasBackground: false,
    fontSize: 6,
    style: 'impact',
  });
  const [isCaptionLoading, setIsCaptionLoading] = useState<boolean>(false);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStage, setExportStage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const activeClip = clips[activeClipIndex] || null;

  // Pre-load default sample video on initial mount so user has immediate preview!
  useEffect(() => {
    const defaultSample = SAMPLE_VIDEOS[0];
    const initialClip: VideoClip = {
      id: 'clip-' + Date.now(),
      name: defaultSample.name,
      url: defaultSample.url,
      duration: defaultSample.duration,
      trimStart: 0,
      trimEnd: defaultSample.duration,
    };
    setClips([initialClip]);
    setActiveClipIndex(0);
  }, []);

  // Keyboard shortcuts (Space = Play/Pause, C = Compare)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setIsCompareMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to capture a frame from a video URL at a specific timestamp as base64 JPEG
  const captureFrameBase64 = async (videoUrl: string, time: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.src = videoUrl;
      vid.currentTime = time;
      vid.muted = true;
      vid.playsInline = true;

      const handleSeeked = () => {
        vid.removeEventListener('seeked', handleSeeked);
        const canvas = document.createElement('canvas');
        canvas.width = 640; // resized for fast AI processing
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Cannot get canvas context'));
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };

      vid.addEventListener('seeked', handleSeeked);
      vid.addEventListener('error', () => {
        // Fallback placeholder image if video fails to seek
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 640, 360);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      });
    });
  };

  // 1. AI Automatic Color Grading Handler
  const handleAutoGrade = async (targetMood = 'cinematic') => {
    if (!activeClip) return;
    try {
      setIsGradingLoading(true);
      const frameBase64 = await captureFrameBase64(activeClip.url, currentTime);

      const res = await fetch('/api/ai/auto-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64,
          targetMood,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: AiGradeResponse = await res.json();
      setAiDiagnosis(data);

      // Smoothly apply graded parameters
      setColorGrading({
        brightness: data.brightness ?? 5,
        contrast: data.contrast ?? 20,
        saturation: data.saturation ?? 15,
        temperature: data.temperature ?? 10,
        tint: data.tint ?? 0,
        highlights: data.highlights ?? -10,
        shadows: data.shadows ?? 15,
        vignette: data.vignette ?? 20,
        sharpness: data.sharpness ?? 20,
        filmGrain: data.filmGrain ?? 10,
        preset: 'original',
      });

      // Switch tab to look to see the result
      setActiveTab('look');
    } catch (err: any) {
      console.error('Failed to auto-grade:', err);
      // Fallback sensible cinematic grade
      setColorGrading({
        brightness: 6,
        contrast: 22,
        saturation: 14,
        temperature: 12,
        tint: -4,
        highlights: -12,
        shadows: 16,
        vignette: 24,
        sharpness: 20,
        filmGrain: 14,
        preset: 'original',
      });
    } finally {
      setIsGradingLoading(false);
    }
  };

  // 2. AI Transition Recommendation Handler
  const handleAiAutoTransition = async () => {
    if (clips.length < 2) return;
    try {
      setIsAiTransitionLoading(true);
      const clipA = clips[0];
      const clipB = clips[1];

      // End frame of clip A and start frame of clip B
      const [frameA, frameB] = await Promise.all([
        captureFrameBase64(clipA.url, clipA.trimEnd - 0.2),
        captureFrameBase64(clipB.url, clipB.trimStart + 0.2),
      ]);

      const res = await fetch('/api/ai/recommend-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipAFrame: frameA,
          clipBFrame: frameB,
          videoStyle: 'cinematic',
        }),
      });

      if (!res.ok) throw new Error('Transition analysis failed');
      const data: AiTransitionResponse = await res.json();
      setAiTransitionData(data);

      setTransition({
        type: data.transitionType,
        duration: data.duration || 0.6,
        intensity: data.recommendedIntensity || 75,
        title: data.transitionTitle,
        rationale: data.rationale,
        isAiGenerated: true,
      });

      setActiveTab('transitions');
    } catch (err) {
      console.error('Failed to recommend transition:', err);
      setTransition({
        type: 'whip_pan',
        duration: 0.6,
        intensity: 80,
        title: 'Dynamic Whip Pan',
        rationale: 'Kinetic camera blur connects high action segments smoothly.',
        isAiGenerated: true,
      });
    } finally {
      setIsAiTransitionLoading(false);
    }
  };

  // 3. AI Caption Hook Generator
  const handleGenerateAiCaption = async () => {
    if (!activeClip) return;
    try {
      setIsCaptionLoading(true);
      const frame = await captureFrameBase64(activeClip.url, currentTime);

      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frame,
          style: 'viral_hook',
        }),
      });

      if (!res.ok) throw new Error('Caption generation failed');
      const data = await res.json();

      setCaption((prev) => ({
        ...prev,
        text: data.caption || 'GOLDEN CINEMATIC MOMENTS',
        color: data.suggestedColor || '#FFFFFF',
        position: (data.suggestedPosition as any) || 'bottom',
        hasBackground: true,
      }));
    } catch (err) {
      console.error(err);
      setCaption((prev) => ({
        ...prev,
        text: 'CINEMATIC HORIZONS ✨',
        color: '#FFFFFF',
        hasBackground: true,
      }));
    } finally {
      setIsCaptionLoading(false);
    }
  };

  // Handle Video File Upload
  const handleFileSelected = (file: File) => {
    const url = URL.createObjectURL(file);
    const tempVid = document.createElement('video');
    tempVid.src = url;
    tempVid.onloadedmetadata = () => {
      const dur = tempVid.duration || 10;
      const newClip: VideoClip = {
        id: 'clip-' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: dur,
        trimStart: 0,
        trimEnd: dur,
      };
      setClips([newClip]);
      setActiveClipIndex(0);
      setCurrentTime(0);
    };
  };

  // Handle Sample Video Select
  const handleSampleSelected = (sample: SampleVideoOption) => {
    const newClip: VideoClip = {
      id: 'clip-' + Date.now(),
      name: sample.name,
      url: sample.url,
      duration: sample.duration,
      trimStart: 0,
      trimEnd: sample.duration,
    };
    setClips([newClip]);
    setActiveClipIndex(0);
    setCurrentTime(0);
  };

  // Handle Procedural video creation
  const handleProceduralCreate = (url: string, duration: number, title: string) => {
    const newClip: VideoClip = {
      id: 'clip-' + Date.now(),
      name: title,
      url,
      duration,
      trimStart: 0,
      trimEnd: duration,
    };
    setClips([newClip]);
    setActiveClipIndex(0);
    setCurrentTime(0);
  };

  // Update Trim points
  const handleUpdateClipTrim = (clipId: string, start: number, end: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, trimStart: start, trimEnd: end } : c))
    );
  };

  // Split clip into two at splitTime
  const handleSplitClip = (clipIdx: number, splitTime: number) => {
    const target = clips[clipIdx];
    if (!target) return;

    const clipPart1: VideoClip = {
      ...target,
      id: 'clip-' + Date.now() + '-1',
      name: `${target.name} (Part 1)`,
      trimEnd: splitTime,
    };

    const clipPart2: VideoClip = {
      ...target,
      id: 'clip-' + Date.now() + '-2',
      name: `${target.name} (Part 2)`,
      trimStart: splitTime,
    };

    const newClips = [...clips];
    newClips.splice(clipIdx, 1, clipPart1, clipPart2);
    setClips(newClips);
    setActiveClipIndex(clipIdx);

    // Switch to transitions tab and prompt user
    setActiveTab('transitions');
  };

  // Add another clip to timeline
  const handleAddClipClick = () => {
    // Pick another sample video to append
    const nextSample = SAMPLE_VIDEOS.find((s) => !clips.some((c) => c.name === s.name)) || SAMPLE_VIDEOS[1];
    const newClip: VideoClip = {
      id: 'clip-' + Date.now(),
      name: nextSample.name,
      url: nextSample.url,
      duration: nextSample.duration,
      trimStart: 0,
      trimEnd: nextSample.duration,
    };
    setClips((prev) => [...prev, newClip]);
  };

  // Preview the transition cut in player
  const handlePreviewTransition = () => {
    if (!activeClip) return;
    // Set time to near the end of active clip
    setCurrentTime(Math.max(activeClip.trimStart, activeClip.trimEnd - 1.2));
    setIsPlaying(true);
  };

  // Reset video & controls
  const handleReset = () => {
    setColorGrading(COLOR_PRESETS.original.grading as ColorGrading);
    setCaption({
      text: '',
      position: 'bottom',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.75)',
      hasBackground: false,
      fontSize: 6,
      style: 'impact',
    });
    setTransition({
      type: 'crossfade',
      duration: 0.6,
      intensity: 75,
      title: 'Cross Dissolve',
    });
    if (activeClip) {
      setCurrentTime(activeClip.trimStart);
    }
  };

  // Start Full Video Export
  const handleStartExport = async () => {
    if (clips.length === 0) return;
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportStage('Initializing video frames and neural color pipeline...');

      const blob = await exportEditedVideo({
        clips,
        colorGrading,
        transition,
        caption,
        onProgress: (pct, stage) => {
          setExportProgress(pct);
          setExportStage(stage);
        },
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.message || 'Error rendering video'));
    } finally {
      setIsExporting(false);
    }
  };

  // Snapshot Current Graded Frame as PNG
  const handleSnapshotFrame = () => {
    if (!activeClip) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.src = activeClip.url;
    vid.currentTime = currentTime;
    vid.onseeked = () => {
      drawGradedFrame(ctx, vid, 1920, 1080, colorGrading);
      drawCaptionOnCanvas(ctx, caption, 1920, 1080);
      const link = document.createElement('a');
      link.download = `kromaflow-frame-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  // Calculate total duration across all clips
  const totalTimelineDuration = clips.reduce(
    (acc, c) => acc + (c.trimEnd - c.trimStart),
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Studio Top Navigation Bar */}
      <Header
        onSelectSample={handleSampleSelected}
        onUploadClick={() => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          input?.click();
        }}
        onReset={handleReset}
        hasVideo={clips.length > 0}
        isCompareMode={isCompareMode}
        onToggleCompare={() => setIsCompareMode(!isCompareMode)}
        onAutoGradeClick={() => handleAutoGrade('cinematic')}
        isGradingLoading={isGradingLoading}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player Viewport & Timeline (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col">
          {/* Main Video Viewport */}
          <VideoPlayer
            currentClip={activeClip}
            clips={clips}
            colorGrading={colorGrading}
            caption={caption}
            transition={transition}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={(dur) => {
              if (activeClip && activeClip.duration === 0) {
                setClips((prev) =>
                  prev.map((c, i) =>
                    i === activeClipIndex ? { ...c, duration: dur, trimEnd: dur } : c
                  )
                );
              }
            }}
            isPlaying={isPlaying}
            onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
            onFileSelected={handleFileSelected}
            onSampleSelected={handleSampleSelected}
            onProceduralCreate={handleProceduralCreate}
            isCompareMode={isCompareMode}
            onToggleCompare={() => setIsCompareMode(!isCompareMode)}
          />

          {/* Timeline & Trimming Controller matching PDF */}
          <TrimTimeline
            clips={clips}
            activeClipIndex={activeClipIndex}
            onSelectClipIndex={(idx) => {
              setActiveClipIndex(idx);
              if (clips[idx]) setCurrentTime(clips[idx].trimStart);
            }}
            onUpdateClipTrim={handleUpdateClipTrim}
            onSplitClip={handleSplitClip}
            onAddClipClick={handleAddClipClick}
            currentTime={currentTime}
            transition={transition}
            onOpenTransitionSettings={() => setActiveTab('transitions')}
            onAiAutoTransition={handleAiAutoTransition}
            isAiTransitionLoading={isAiTransitionLoading}
          />
        </div>

        {/* Right Column: Studio Controls Sidebar (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Controls Tab Switcher */}
          <div className="grid grid-cols-4 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('look')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'look'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Look</span>
            </button>

            <button
              onClick={() => setActiveTab('transitions')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
                activeTab === 'transitions'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transitions</span>
              {clips.length > 1 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2 right-2 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('caption')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'caption'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>Caption</span>
            </button>

            <button
              onClick={() => setActiveTab('trim')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'trim'
                  ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-rose-400" />
              <span>Scenes</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1">
            {activeTab === 'look' && (
              <ColorGradingPanel
                grading={colorGrading}
                onChange={setColorGrading}
                onAutoGrade={handleAutoGrade}
                isLoading={isGradingLoading}
                aiDiagnosis={aiDiagnosis}
              />
            )}

            {activeTab === 'transitions' && (
              <TransitionsPanel
                transition={transition}
                onChange={setTransition}
                onAiRecommend={handleAiAutoTransition}
                isLoading={isAiTransitionLoading}
                aiTransitionData={aiTransitionData}
                onPreviewTransition={handlePreviewTransition}
                hasMultipleClips={clips.length > 1}
              />
            )}

            {activeTab === 'caption' && (
              <CaptionPanel
                caption={caption}
                onChange={setCaption}
                onGenerateAiCaption={handleGenerateAiCaption}
                isLoading={isCaptionLoading}
              />
            )}

            {activeTab === 'trim' && (
              <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Scene Management</h3>
                <p className="text-xs text-zinc-400">
                  Manage multiple clips on the timeline and arrange their sequence.
                </p>
                <div className="space-y-2">
                  {clips.map((c, i) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        i === activeClipIndex
                          ? 'bg-indigo-950/40 border-indigo-500'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{c.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          Trim: {c.trimStart.toFixed(1)}s - {c.trimEnd.toFixed(1)}s (
                          {(c.trimEnd - c.trimStart).toFixed(1)}s)
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveClipIndex(i)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                      >
                        {i === activeClipIndex ? 'Active' : 'Select'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Video Button matching PDF Page 2 ("Export video") */}
          <div className="pt-2">
            <button
              onClick={() => {
                setDownloadUrl(null);
                setIsExportModalOpen(true);
              }}
              disabled={clips.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 border border-white/10 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-40"
            >
              <Film className="w-5 h-5 text-white" />
              <span>Export video</span>
            </button>
          </div>
        </div>
      </main>

      {/* SEO & Features Knowledge Hub for Google Ranking and User Guide */}
      <SeoContentSection />

      {/* Export Modal with progress indicator and download trigger */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onStartExport={handleStartExport}
        onSnapshotFrame={handleSnapshotFrame}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportStage={exportStage}
        downloadUrl={downloadUrl}
        durationSeconds={totalTimelineDuration}
        clipsCount={clips.length}
      />
    </div>
  );
}
