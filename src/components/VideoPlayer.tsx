import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Upload,
  Sparkles,
  SplitSquareVertical,
  Film,
} from 'lucide-react';
import { VideoClip, ColorGrading, CaptionConfig, TransitionConfig } from '../types';
import { getCssFilterString } from '../utils/colorGrading';
import { SAMPLE_VIDEOS, SampleVideoOption, createProceduralVideoBlob } from '../utils/sampleVideos';

interface VideoPlayerProps {
  currentClip: VideoClip | null;
  clips: VideoClip[];
  colorGrading: ColorGrading;
  caption: CaptionConfig;
  transition: TransitionConfig;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  onFileSelected: (file: File) => void;
  onSampleSelected: (sample: SampleVideoOption) => void;
  onProceduralCreate: (url: string, duration: number, title: string) => void;
  isCompareMode: boolean;
  onToggleCompare: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentClip,
  clips,
  colorGrading,
  caption,
  transition,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  isPlaying,
  onPlayPauseToggle,
  onFileSelected,
  onSampleSelected,
  onProceduralCreate,
  isCompareMode,
  onToggleCompare,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const compareVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage (0 to 100)
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isGeneratingProcedural, setIsGeneratingProcedural] = useState(false);

  // Sync video play/pause with prop
  useEffect(() => {
    if (isPlaying) {
      videoRef.current?.play().catch(() => {});
      compareVideoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      compareVideoRef.current?.pause();
    }
  }, [isPlaying]);

  // Sync video current time when scrubber changes externally
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.25) {
      videoRef.current.currentTime = currentTime;
    }
    if (compareVideoRef.current && Math.abs(compareVideoRef.current.currentTime - currentTime) > 0.25) {
      compareVideoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handle trim loop boundary
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentClip) return;
    const time = videoRef.current.currentTime;
    onTimeUpdate(time);

    // If past trimEnd, loop back to trimStart
    if (time >= currentClip.trimEnd) {
      videoRef.current.currentTime = currentClip.trimStart;
      onTimeUpdate(currentClip.trimStart);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    onDurationChange(dur);
    if (currentClip && videoRef.current.currentTime < currentClip.trimStart) {
      videoRef.current.currentTime = currentClip.trimStart;
    }
  };

  // Drag and drop video file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelected(file);
      }
    }
  };

  // Compare split drag
  const handleSplitMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(pct);
    },
    [isDraggingSplit]
  );

  const handleSplitMouseUp = useCallback(() => {
    setIsDraggingSplit(false);
  }, []);

  useEffect(() => {
    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleSplitMouseMove);
      window.addEventListener('mouseup', handleSplitMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSplitMouseMove);
        window.removeEventListener('mouseup', handleSplitMouseUp);
      };
    }
  }, [isDraggingSplit, handleSplitMouseMove, handleSplitMouseUp]);

  // Format timecode 0:00.0
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  // Compute CSS filter for graded layer
  const cssFilter = getCssFilterString(colorGrading);

  // Generate procedural sample if user clicks quick start
  const handleQuickSynthwave = async () => {
    try {
      setIsGeneratingProcedural(true);
      const res = await createProceduralVideoBlob('synthwave', 'Neon Synthwave 80s');
      onProceduralCreate(res.url, res.duration, 'Neon Synthwave 80s');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingProcedural(false);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900/60 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelected(e.target.files[0]);
          }
        }}
      />

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden select-none"
      >
        {!currentClip ? (
          // Empty State matching the PDF Screenshot: "Drop a video here or tap to choose a file"
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
              isDraggingFile
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/80'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:scale-105 transition-transform shadow-lg shadow-black/40">
              <Upload className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-200 mb-1">
              Drop a video here
            </h3>
            <p className="text-sm text-zinc-400 mb-6">or tap to choose a file</p>

            {/* Quick Demo Options */}
            <div className="max-w-md w-full pt-4 border-t border-zinc-800/80" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">
                Or try instant demo clips
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_VIDEOS.slice(0, 2).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSampleSelected(s)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${s.thumbnailColor} shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
                      <Film className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium text-zinc-200 truncate group-hover:text-indigo-400">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">{s.duration}s clip</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleQuickSynthwave}
                disabled={isGeneratingProcedural}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-900/40 via-violet-900/40 to-pink-900/40 hover:from-indigo-900/60 hover:to-pink-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isGeneratingProcedural
                    ? 'Synthesizing 60fps video...'
                    : 'Generate Instant 80s Synthwave Demo (Offline)'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Active Video Player Layer
          <>
            {/* Base HTML5 Video Element (Graded) */}
            <video
              ref={videoRef}
              src={currentClip.url}
              crossOrigin="anonymous"
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={onPlayPauseToggle}
              style={{
                filter: cssFilter,
              }}
              className="w-full h-full object-contain cursor-pointer transition-all duration-75"
            />

            {/* Vignette Overlay */}
            {colorGrading.vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${
                    (colorGrading.vignette / 100) * 0.8
                  }) 100%)`,
                }}
              />
            )}

            {/* Split Comparison Mode (Original on Left vs Graded on Right) */}
            {isCompareMode && (
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)` }}
              >
                {/* Clean unadjusted video under the clip mask */}
                <video
                  ref={compareVideoRef}
                  src={currentClip.url}
                  crossOrigin="anonymous"
                  playsInline
                  muted
                  className="w-full h-full object-contain filter-none"
                  style={{ filter: 'none' }}
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold tracking-wider text-zinc-300 border border-white/10 uppercase">
                  Raw Original
                </div>
              </div>
            )}

            {/* Graded badge on comparison right */}
            {isCompareMode && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-600/80 backdrop-blur-md text-[10px] font-semibold tracking-wider text-white border border-indigo-400/30 uppercase pointer-events-none">
                AI Graded
              </div>
            )}

            {/* Split Drag Divider Line */}
            {isCompareMode && (
              <div
                onMouseDown={() => setIsDraggingSplit(true)}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-2xl flex items-center justify-center"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-lg text-[10px] font-bold">
                  ↔
                </div>
              </div>
            )}

            {/* Caption Overlay */}
            {caption.text.trim() && (
              <div
                className={`absolute left-0 right-0 px-6 flex justify-center pointer-events-none z-10 transition-all ${
                  caption.position === 'top'
                    ? 'top-8'
                    : caption.position === 'middle'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-8'
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 transition-all ${
                    caption.hasBackground ? 'rounded-lg' : ''
                  }`}
                  style={{
                    backgroundColor: caption.hasBackground
                      ? caption.backgroundColor || 'rgba(0,0,0,0.75)'
                      : 'transparent',
                    color: caption.color,
                    fontSize: `clamp(18px, ${caption.fontSize * 0.4}vw, 48px)`,
                    fontFamily:
                      caption.style === 'cinematic'
                        ? 'Cinzel, Georgia, serif'
                        : caption.style === 'impact'
                        ? 'Montserrat, Impact, sans-serif'
                        : caption.style === 'neon'
                        ? '"JetBrains Mono", monospace'
                        : 'Inter, sans-serif',
                    textTransform:
                      caption.style === 'impact' || caption.style === 'cinematic'
                        ? 'uppercase'
                        : 'none',
                    fontWeight: caption.style === 'impact' ? 900 : 700,
                    textShadow:
                      caption.style === 'impact'
                        ? '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                        : caption.style === 'neon'
                        ? `0 0 15px ${caption.color}, 0 0 30px ${caption.color}`
                        : '0 2px 6px rgba(0,0,0,0.8)',
                  }}
                >
                  {caption.text}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Control Bar below viewport matching the PDF design */}
      <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={onPlayPauseToggle}
          disabled={!currentClip}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center shrink-0"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        </button>

        {/* Scrubber slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={currentClip ? currentClip.trimStart : 0}
            max={currentClip ? currentClip.trimEnd : 10}
            step={0.05}
            value={currentTime}
            disabled={!currentClip}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onTimeUpdate(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
          />
        </div>

        {/* Timecode Readout in format 0:00.0 from PDF */}
        <div className="font-mono text-xs text-zinc-300 font-medium px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800 shrink-0">
          {formatTimecode(currentTime)}
          <span className="text-zinc-400 mx-1">/</span>
          <span className="text-zinc-400">
            {formatTimecode(currentClip ? currentClip.trimEnd : 0)}
          </span>
        </div>

        {/* Mute toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          disabled={!currentClip}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Loop back to start */}
        <button
          onClick={() => {
            if (!videoRef.current || !currentClip) return;
            videoRef.current.currentTime = currentClip.trimStart;
            onTimeUpdate(currentClip.trimStart);
          }}
          disabled={!currentClip}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          title="Restart from Trim Start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
