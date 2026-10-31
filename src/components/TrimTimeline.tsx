import React from 'react';
import { Scissors, Plus, Sparkles, Film, ArrowRightLeft } from 'lucide-react';
import { VideoClip, TransitionConfig, TransitionType } from '../types';

interface TrimTimelineProps {
  clips: VideoClip[];
  activeClipIndex: number;
  onSelectClipIndex: (idx: number) => void;
  onUpdateClipTrim: (clipId: string, start: number, end: number) => void;
  onSplitClip: (clipIndex: number, splitTime: number) => void;
  onAddClipClick: () => void;
  currentTime: number;
  transition: TransitionConfig;
  onOpenTransitionSettings: () => void;
  onAiAutoTransition: () => void;
  isAiTransitionLoading: boolean;
}

export const TrimTimeline: React.FC<TrimTimelineProps> = ({
  clips,
  activeClipIndex,
  onSelectClipIndex,
  onUpdateClipTrim,
  onSplitClip,
  onAddClipClick,
  currentTime,
  transition,
  onOpenTransitionSettings,
  onAiAutoTransition,
  isAiTransitionLoading,
}) => {
  const activeClip = clips[activeClipIndex] || null;

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  const getTransitionLabel = (type: TransitionType) => {
    switch (type) {
      case 'crossfade':
        return 'Crossfade';
      case 'whip_pan':
        return 'Whip Pan';
      case 'zoom_blur':
        return 'Zoom Blur';
      case 'light_leak':
        return 'Light Leak';
      case 'glitch':
        return 'Cyber Glitch';
      case 'slide_left':
        return 'Slide';
      case 'film_roll':
        return 'Film Roll';
      default:
        return 'Cut';
    }
  };

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Trim & Clips</h2>
          <p className="text-xs text-zinc-400">
            Set in/out points or split into multiple scenes with AI transitions
          </p>
        </div>

        {activeClip && (
          <div className="flex items-center gap-2">
            {/* Split Clip Button */}
            <button
              onClick={() => onSplitClip(activeClipIndex, currentTime)}
              disabled={
                currentTime <= activeClip.trimStart + 0.5 ||
                currentTime >= activeClip.trimEnd - 0.5
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 disabled:opacity-40 transition-colors"
              title="Split clip at playhead position to create two scenes"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Split at Playhead</span>
            </button>

            {/* Add Clip Button */}
            <button
              onClick={onAddClipClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Clip</span>
            </button>
          </div>
        )}
      </div>

      {/* Multi-Clip Track & Visual Timeline */}
      {clips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {clips.map((clip, idx) => {
              const isActive = idx === activeClipIndex;
              const hasNext = idx < clips.length - 1;

              return (
                <React.Fragment key={clip.id}>
                  {/* Clip Block */}
                  <div
                    onClick={() => onSelectClipIndex(idx)}
                    className={`flex-shrink-0 cursor-pointer rounded-xl p-3 border transition-all ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={{ minWidth: '170px' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-zinc-200 truncate max-w-[110px]">
                        {clip.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formatTimecode(clip.trimEnd - clip.trimStart)}
                      </span>
                    </div>

                    {/* Mini Visual Duration Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isActive ? 'bg-indigo-500' : 'bg-zinc-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((clip.trimEnd - clip.trimStart) / (clip.duration || 10)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Transition connector between clips */}
                  {hasNext && (
                    <div className="flex flex-col items-center justify-center shrink-0 px-1">
                      <button
                        onClick={onOpenTransitionSettings}
                        className={`group relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          transition.isAiGenerated
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300'
                        }`}
                        title="Configure AI Transition between these clips"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                        <span>{getTransitionLabel(transition.type)}</span>
                        {transition.isAiGenerated && (
                          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                        )}
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* AI Transition Callout if multiple clips present */}
          {clips.length > 1 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-zinc-900 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    AI Transition Director
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {transition.rationale ||
                      'Analyze adjacent frames to auto-recommend optimal pacing & cinematic cut'}
                  </div>
                </div>
              </div>

              <button
                onClick={onAiAutoTransition}
                disabled={isAiTransitionLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isAiTransitionLoading ? 'Analyzing...' : 'AI Auto-Detect Transition'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Start and End Sliders matching PDF specification exactly */}
      {activeClip && (
        <div className="space-y-4 pt-1 border-t border-zinc-800/80">
          {/* Start Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Start</span>
              <span className="font-mono text-zinc-400">
                {formatTimecode(activeClip.trimStart)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, activeClip.trimEnd - 0.2)}
              step={0.05}
              value={activeClip.trimStart}
              onChange={(e) => {
                const newStart = parseFloat(e.target.value);
                onUpdateClipTrim(activeClip.id, newStart, activeClip.trimEnd);
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* End Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300">End</span>
              <span className="font-mono text-zinc-400">
                {formatTimecode(activeClip.trimEnd)}
              </span>
            </div>
            <input
              type="range"
              min={activeClip.trimStart + 0.2}
              max={activeClip.duration || 10}
              step={0.05}
              value={activeClip.trimEnd}
              onChange={(e) => {
                const newEnd = parseFloat(e.target.value);
                onUpdateClipTrim(activeClip.id, activeClip.trimStart, newEnd);
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
