import React, { useState } from 'react';
import { X, Sparkles, RotateCcw, Check, ClipboardPaste, Trash2 } from 'lucide-react';
import { DEFAULT_RAW_TEXT } from '../utils/defaultData';

interface PasteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParseText: (text: string) => void;
  currentText: string;
}

export const PasteDataModal: React.FC<PasteDataModalProps> = ({
  isOpen,
  onClose,
  onParseText,
  currentText,
}) => {
  const [text, setText] = useState(currentText || DEFAULT_RAW_TEXT);

  if (!isOpen) return null;

  const handleApply = () => {
    onParseText(text);
    onClose();
  };

  const handleResetSample = () => {
    setText(DEFAULT_RAW_TEXT);
  };

  const handleClearText = () => {
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4 text-indigo-300" />
            <h2 className="text-sm font-bold tracking-wide uppercase">
              Raw Fee Text Extractor & Parser
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col min-h-0 text-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600">
              Paste raw text copied from the Edunext / School fee portal. The parser will automatically process it.
            </p>
            {text.trim() && (
              <button
                type="button"
                onClick={handleClearText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Text</span>
              </button>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded border border-slate-700 focus:outline-hidden focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
            placeholder="Paste raw fee ledger statement text here..."
          />

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Sample</span>
              </button>

              {text.trim() && (
                <button
                  type="button"
                  onClick={handleClearText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!text.trim()}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded transition shadow-xs cursor-pointer ${
                  text.trim()
                    ? 'bg-indigo-950 hover:bg-indigo-900 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Parse & Update Ledger</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
