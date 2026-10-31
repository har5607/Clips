import React from 'react';
import { Type, Sparkles, AlignCenter, AlignJustify, Palette } from 'lucide-react';
import { CaptionConfig, CaptionPosition, CaptionStyle } from '../types';

interface CaptionPanelProps {
  caption: CaptionConfig;
  onChange: (updated: CaptionConfig) => void;
  onGenerateAiCaption: () => void;
  isLoading: boolean;
}

export const CaptionPanel: React.FC<CaptionPanelProps> = ({
  caption,
  onChange,
  onGenerateAiCaption,
  isLoading,
}) => {
  const styles: { id: CaptionStyle; label: string }[] = [
    { id: 'impact', label: 'Bold Impact' },
    { id: 'modern', label: 'Modern Sans' },
    { id: 'cinematic', label: 'Cinematic Serif' },
    { id: 'neon', label: 'Neon Glow' },
    { id: 'subtitle', label: 'Clean Subtitle' },
  ];

  const colorPresets = [
    '#FFFFFF',
    '#FACC15', // Gold / Yellow
    '#38BDF8', // Cyan
    '#F43F5E', // Rose
    '#A855F7', // Purple
    '#4ADE80', // Emerald
  ];

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Caption</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Overlay & Subtitles
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Add kinetic text, title cards, or generate viral video hooks with AI
          </p>
        </div>

        {/* AI Generate Caption Hook */}
        <button
          onClick={onGenerateAiCaption}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>AI Suggest Hook</span>
        </button>
      </div>

      {/* Input: "Type a caption" matching PDF */}
      <div>
        <label className="text-xs font-medium text-zinc-300 block mb-1.5">
          Type a caption
        </label>
        <input
          type="text"
          value={caption.text}
          onChange={(e) => onChange({ ...caption, text: e.target.value })}
          placeholder="e.g. GOLDEN HOUR IN TOKYO ✨"
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Grid: Position, Color, and Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Position matching PDF */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">
            Position
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['top', 'middle', 'bottom'] as CaptionPosition[]).map((pos) => (
              <button
                key={pos}
                onClick={() => onChange({ ...caption, position: pos })}
                className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  caption.position === pos
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Color matching PDF */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">
            Color
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex-1">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ ...caption, color: c })}
                  className={`w-6 h-6 rounded-lg transition-transform ${
                    caption.color.toLowerCase() === c.toLowerCase()
                      ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={caption.color}
              onChange={(e) => onChange({ ...caption, color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      {/* Font Size slider matching PDF "Size 6%" */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-zinc-300">Size</span>
          <span className="font-mono text-zinc-400">{caption.fontSize}%</span>
        </div>
        <input
          type="range"
          min={3}
          max={14}
          step={0.5}
          value={caption.fontSize}
          onChange={(e) =>
            onChange({ ...caption, fontSize: parseFloat(e.target.value) })
          }
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Typography Style & Background Box Toggle */}
      <div className="space-y-3 pt-2 border-t border-zinc-800/80">
        <div>
          <label className="text-xs font-medium text-zinc-400 block mb-1.5">
            Caption Typography Style
          </label>
          <div className="flex flex-wrap gap-1.5">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ ...caption, style: s.id })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  caption.style === s.id
                    ? 'bg-zinc-800 border-indigo-500 text-white font-semibold'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background pill toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-400">
            Semi-transparent background pill
          </span>
          <button
            onClick={() =>
              onChange({ ...caption, hasBackground: !caption.hasBackground })
            }
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              caption.hasBackground ? 'bg-indigo-600 justify-end' : 'bg-zinc-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
