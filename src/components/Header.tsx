import React from 'react';
import { Film, Sparkles, Wand2, Upload, Video, RefreshCw, SplitSquareVertical, HelpCircle } from 'lucide-react';
import { SAMPLE_VIDEOS, SampleVideoOption } from '../utils/sampleVideos';

interface HeaderProps {
  onSelectSample: (sample: SampleVideoOption) => void;
  onUploadClick: () => void;
  onReset: () => void;
  hasVideo: boolean;
  isCompareMode: boolean;
  onToggleCompare: () => void;
  onAutoGradeClick: () => void;
  isGradingLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onUploadClick,
  onReset,
  hasVideo,
  isCompareMode,
  onToggleCompare,
  onAutoGradeClick,
  isGradingLoading,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                KromaFlow
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-amber-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Neural color grading, intelligent transitions, and in-browser video editing.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasVideo && (
            <>
              {/* Split-screen Compare button */}
              <button
                onClick={onToggleCompare}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  isCompareMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750 hover:text-white'
                }`}
                title="Wipe to compare Original vs Graded footage"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Compare Split</span>
              </button>

              {/* Instant AI Auto-Grade in header */}
              <button
                onClick={onAutoGradeClick}
                disabled={isGradingLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all disabled:opacity-50"
              >
                {isGradingLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>AI Auto Grade</span>
              </button>
            </>
          )}

          {/* Sample Videos Selector */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 transition-all"
            >
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sample Videos</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-40">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
                Load Demo Footage
              </p>
              <div className="space-y-1">
                {SAMPLE_VIDEOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSample(s)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 group/item"
                  >
                    <div
                      className={`w-7 h-7 rounded-md bg-gradient-to-br ${s.thumbnailColor} shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                    >
                      {s.duration}s
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-200 group-hover/item:text-indigo-400">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">{s.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ & Guide Link */}
          <a
            href="#seo-knowledge-hub"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all"
            title="Read Feature Guide, Comparison, and FAQs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Guide & FAQ</span>
          </a>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {hasVideo && (
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Reset Video"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
