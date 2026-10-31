import React from 'react';
import {
  Download,
  Film,
  Camera,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: () => void;
  onSnapshotFrame: () => void;
  isExporting: boolean;
  exportProgress: number;
  exportStage: string;
  downloadUrl: string | null;
  durationSeconds: number;
  clipsCount: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onStartExport,
  onSnapshotFrame,
  isExporting,
  exportProgress,
  exportStage,
  downloadUrl,
  durationSeconds,
  clipsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        {!isExporting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Video</h3>
            <p className="text-xs text-zinc-400">
              High definition in-browser rendering with zero cloud uploads
            </p>
          </div>
        </div>

        {/* Summary Info Card */}
        <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 mb-5 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Total Duration:</span>
            <span className="font-mono text-zinc-200 font-semibold">
              {durationSeconds.toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Timeline Clips:</span>
            <span className="text-zinc-200 font-semibold">{clipsCount} clip(s)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Color Grading:</span>
            <span className="text-indigo-400 font-semibold">Applied</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Privacy:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side
            </span>
          </div>
        </div>

        {/* Progress or Actions */}
        {isExporting ? (
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{exportStage}</span>
              <span className="font-mono text-indigo-400 font-bold">
                {exportProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-full transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              Processing frames with transitions and color grading... Please do not close this tab.
            </p>
          </div>
        ) : downloadUrl ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">Export Complete!</div>
              <p className="text-xs text-zinc-400">
                Your video has been rendered and is ready to download.
              </p>
            </div>

            <a
              href={downloadUrl}
              download={`kromaflow-video-${Date.now()}.webm`}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-center block"
            >
              <Download className="w-4 h-4" />
              <span>Download Video File</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Done & Return to Studio
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Primary Export Button */}
            <button
              onClick={onStartExport}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Render & Export Video</span>
            </button>

            {/* Quick Snapshot Button */}
            <button
              onClick={onSnapshotFrame}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Graded Frame Snapshot (PNG)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
