import React, { useState } from 'react';
import {
  Wand2,
  Sliders,
  Sparkles,
  RotateCcw,
  Sun,
  Contrast as ContrastIcon,
  Palette,
  Thermometer,
  Eye,
  Check,
} from 'lucide-react';
import { ColorGrading, ColorPresetId, AiGradeResponse } from '../types';
import { COLOR_PRESETS } from '../utils/colorGrading';

interface ColorGradingPanelProps {
  grading: ColorGrading;
  onChange: (updated: ColorGrading) => void;
  onAutoGrade: (targetMood: string) => void;
  isLoading: boolean;
  aiDiagnosis: AiGradeResponse | null;
}

export const ColorGradingPanel: React.FC<ColorGradingPanelProps> = ({
  grading,
  onChange,
  onAutoGrade,
  isLoading,
  aiDiagnosis,
}) => {
  const [selectedMood, setSelectedMood] = useState('cinematic');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const moods = [
    { id: 'cinematic', label: 'Cinematic 35mm', badge: 'Hollywood' },
    { id: 'teal_orange', label: 'Teal & Orange', badge: 'Blockbuster' },
    { id: 'golden_hour', label: 'Golden Hour', badge: 'Warm Glow' },
    { id: 'warm_vintage', label: '70s Vintage', badge: 'Retro Film' },
    { id: 'moody_noir', label: 'Moody Noir', badge: 'Dramatic B&W' },
    { id: 'cyberpunk', label: 'Cyberpunk', badge: 'Vibrant Neon' },
    { id: 'clean_pastel', label: 'Clean Natural', badge: 'Modern' },
  ];

  const handlePresetSelect = (presetKey: ColorPresetId) => {
    const p = COLOR_PRESETS[presetKey];
    onChange({
      ...p.grading,
      preset: presetKey,
    });
  };

  const handleSliderChange = (key: keyof ColorGrading, val: number) => {
    onChange({
      ...grading,
      [key]: val,
      preset: 'original', // customized
    });
  };

  const handleReset = () => {
    handlePresetSelect('original');
  };

  // Format percentage display e.g. 100% or +15%
  const formatPct = (val: number, isOffset = true) => {
    if (isOffset) {
      // Maps -100..100 to 0%..200% with 100% as baseline
      return `${Math.round(100 + val)}%`;
    }
    return `${Math.round(val)}%`;
  };

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-5">
      {/* Look Header & AI Grade Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Look</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Color Grading
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Tone, contrast, atmospheric mood, and intelligent automatic correction
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          title="Reset to original flat footage"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Look</span>
        </button>
      </div>

      {/* AI Automatic Color Grading Hero Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/30 shadow-lg shadow-indigo-950/40 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/40">
              <Wand2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Automatic Color Grading
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Gemini analyzes scene lighting, color casts, skin tones & dynamic range
              </p>
            </div>
          </div>

          <button
            onClick={() => onAutoGrade(selectedMood)}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 border border-indigo-400/40 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Grading Frame...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Grade Now</span>
              </>
            )}
          </button>
        </div>

        {/* Target Mood Chips for AI Grading */}
        <div>
          <div className="text-[11px] font-medium text-zinc-400 mb-1.5">
            Select Desired AI Mood Target:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  selectedMood === m.id
                    ? 'bg-indigo-600/25 border-indigo-500/70 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Diagnosis Result Callout if available */}
        {aiDiagnosis && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs">
            <div className="flex items-start gap-2 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-200">
                  Visual Diagnosis:{' '}
                </span>
                <span className="text-zinc-300">
                  {aiDiagnosis.analysisSummary}
                </span>
                {aiDiagnosis.sceneDescription && (
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Detected scene: {aiDiagnosis.sceneDescription}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Dropdown & Quick Presets (as seen in PDF Page 1 & 2) */}
      <div>
        <label className="text-xs font-medium text-zinc-300 block mb-1.5">
          Style Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(COLOR_PRESETS) as ColorPresetId[]).map((key) => {
            const p = COLOR_PRESETS[key];
            const isSelected = grading.preset === key;
            return (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-zinc-800 border-indigo-500 text-white shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-0.5">
                  <span>{p.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-1">
                  {p.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Look Sliders matching PDF (Brightness, Contrast, Saturation) */}
      <div className="space-y-4 pt-1">
        {/* Brightness */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-zinc-400" />
              Brightness
            </span>
            <span className="font-mono text-zinc-400">
              {formatPct(grading.brightness)}
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={grading.brightness}
            onChange={(e) => handleSliderChange('brightness', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <ContrastIcon className="w-3.5 h-3.5 text-zinc-400" />
              Contrast
            </span>
            <span className="font-mono text-zinc-400">
              {formatPct(grading.contrast)}
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={grading.contrast}
            onChange={(e) => handleSliderChange('contrast', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              Saturation
            </span>
            <span className="font-mono text-zinc-400">
              {formatPct(grading.saturation)}
            </span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={grading.saturation}
            onChange={(e) => handleSliderChange('saturation', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Advanced Hollywood Grading Toggle */}
      <div className="pt-2 border-t border-zinc-800/80">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold text-zinc-300 hover:text-white py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Pro Colorist Controls (Temperature, Shadows, Vignette)
          </span>
          <span className="text-[11px] text-indigo-400 font-medium">
            {showAdvanced ? 'Hide' : 'Expand'}
          </span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {/* Color Temperature */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  Warmth / Cool
                </span>
                <span className="font-mono text-zinc-400">
                  {grading.temperature > 0
                    ? `+${grading.temperature}`
                    : grading.temperature}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={grading.temperature}
                onChange={(e) =>
                  handleSliderChange('temperature', parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Tint */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Tint (Green/Magenta)</span>
                <span className="font-mono text-zinc-400">
                  {grading.tint > 0 ? `+${grading.tint}` : grading.tint}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={grading.tint}
                onChange={(e) => handleSliderChange('tint', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Shadows */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Shadows (Lift / Crush)</span>
                <span className="font-mono text-zinc-400">
                  {grading.shadows > 0 ? `+${grading.shadows}` : grading.shadows}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={grading.shadows}
                onChange={(e) =>
                  handleSliderChange('shadows', parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Highlights */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Highlights (Recover)</span>
                <span className="font-mono text-zinc-400">
                  {grading.highlights > 0
                    ? `+${grading.highlights}`
                    : grading.highlights}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={grading.highlights}
                onChange={(e) =>
                  handleSliderChange('highlights', parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Vignette */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Vignette</span>
                <span className="font-mono text-zinc-400">
                  {Math.round(grading.vignette)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={grading.vignette}
                onChange={(e) =>
                  handleSliderChange('vignette', parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Film Grain */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Film Grain</span>
                <span className="font-mono text-zinc-400">
                  {Math.round(grading.filmGrain)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={grading.filmGrain}
                onChange={(e) =>
                  handleSliderChange('filmGrain', parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
