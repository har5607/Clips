import React from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  Flame,
  Layers,
  ZoomIn,
  MoveRight,
  Tv,
} from 'lucide-react';
import { TransitionConfig, TransitionType, AiTransitionResponse } from '../types';

interface TransitionsPanelProps {
  transition: TransitionConfig;
  onChange: (updated: TransitionConfig) => void;
  onAiRecommend: () => void;
  isLoading: boolean;
  aiTransitionData: AiTransitionResponse | null;
  onPreviewTransition: () => void;
  hasMultipleClips: boolean;
}

export const TransitionsPanel: React.FC<TransitionsPanelProps> = ({
  transition,
  onChange,
  onAiRecommend,
  isLoading,
  aiTransitionData,
  onPreviewTransition,
  hasMultipleClips,
}) => {
  const transitionOptions: {
    type: TransitionType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'crossfade',
      label: 'Cross Dissolve',
      description: 'Luminous optical dissolve between scenes',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
    {
      type: 'whip_pan',
      label: 'Dynamic Whip Pan',
      description: 'Rapid kinetic camera blur matching velocity',
      icon: <ArrowRightLeft className="w-4 h-4 text-cyan-400" />,
    },
    {
      type: 'zoom_blur',
      label: 'Zoom Blur Punch',
      description: 'Dynamic scale push-in with optical dispersion',
      icon: <ZoomIn className="w-4 h-4 text-emerald-400" />,
    },
    {
      type: 'light_leak',
      label: 'Light Leak Film Burn',
      description: 'Organic 35mm golden flare bloom & analog warmth',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    },
    {
      type: 'glitch',
      label: 'Cyber Glitch',
      description: 'Digital chromatic RGB slice and scanline jitter',
      icon: <Tv className="w-4 h-4 text-pink-400" />,
    },
    {
      type: 'slide_left',
      label: 'Fluid Slide Push',
      description: 'Smooth directional wipe with subtle drop shadow',
      icon: <MoveRight className="w-4 h-4 text-violet-400" />,
    },
    {
      type: 'film_roll',
      label: 'Film Roll & Strobe',
      description: 'Vintage projector shutter roll and white flash',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
    },
    {
      type: 'none',
      label: 'Hard Cut',
      description: 'Standard instantaneous scene transition',
      icon: <div className="w-4 h-4 rounded bg-zinc-700" />,
    },
  ];

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              AI-Powered Transitions
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Smart Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Procedural canvas transition effects and contextual AI recommendation
          </p>
        </div>

        <button
          onClick={onPreviewTransition}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          title="Preview the transition effect in player"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Preview Cut</span>
        </button>
      </div>

      {/* AI Transition Recommender Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/30 shadow-lg shadow-indigo-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/40">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Scene Cut & Transition Matcher
              </div>
              <p className="text-[11px] text-zinc-400">
                Analyzes camera momentum, luminance delta & visual flow between scenes
              </p>
            </div>
          </div>

          <button
            onClick={onAiRecommend}
            disabled={isLoading || !hasMultipleClips}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Analyzing Scenes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Recommend Transition</span>
              </>
            )}
          </button>
        </div>

        {!hasMultipleClips && (
          <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2">
            Tip: Click <strong>"Split at Playhead"</strong> in the Trim panel to split your video into 2 scenes and test AI transitions!
          </p>
        )}

        {aiTransitionData && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs">
            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 space-y-1">
              <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Recommended: {aiTransitionData.transitionTitle} ({aiTransitionData.duration}s)
              </div>
              <div className="text-zinc-300 text-[11px]">
                {aiTransitionData.rationale}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transition Style Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {transitionOptions.map((opt) => {
          const isSelected = transition.type === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() =>
                onChange({
                  ...transition,
                  type: opt.type,
                  title: opt.label,
                  isAiGenerated: false,
                })
              }
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {opt.icon}
                <span className="text-xs font-semibold text-zinc-200">
                  {opt.label}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Transition Parameters Sliders */}
      {transition.type !== 'none' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
          {/* Duration Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Transition Duration</span>
              <span className="font-mono text-zinc-400">{transition.duration}s</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.5}
              step={0.05}
              value={transition.duration}
              onChange={(e) =>
                onChange({
                  ...transition,
                  duration: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Intensity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300">Effect Intensity</span>
              <span className="font-mono text-zinc-400">{transition.intensity}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={transition.intensity}
              onChange={(e) =>
                onChange({
                  ...transition,
                  intensity: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
