import React, { useState } from 'react';
import { X, Sparkles, RotateCcw, Check, ClipboardPaste } from 'lucide-react';
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
          <p className="text-slate-600 mb-2">
            Paste raw text copied from the Edunext / School fee portal (or spreadsheet table). The intelligent parser will automatically identify student details, fee heads, concession amounts, payment receipts, and calculate due balances.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full flex-1 p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded border border-slate-700 focus:outline-hidden focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
            placeholder="Paste raw fee ledger statement text here..."
          />

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handleResetSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs transition cursor-pointer"
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
