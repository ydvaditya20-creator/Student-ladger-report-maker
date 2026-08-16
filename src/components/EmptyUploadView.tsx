import React, { useState } from 'react';
import { ClipboardPaste, FileUp, Sparkles, School, FileText, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react';
import { DEFAULT_RAW_TEXT } from '../utils/defaultData';

interface EmptyUploadViewProps {
  onParseText: (text: string) => void;
}

export const EmptyUploadView: React.FC<EmptyUploadViewProps> = ({ onParseText }) => {
  const [inputText, setInputText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onParseText(inputText);
    }
  };

  const handleLoadSample = () => {
    onParseText(DEFAULT_RAW_TEXT);
  };

  const handleClearText = () => {
    setInputText('');
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
        onParseText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-950 text-white px-6 py-5 border-b border-indigo-900">
          <div className="flex items-center gap-2.5">
            <School className="w-6 h-6 text-indigo-300" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Student Fee Ledger & Statement Portal</h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                Paste or upload your raw fee statement text to generate instant ledgers, custom reports, and official receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
              dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <FileUp className="w-8 h-8 text-indigo-900" />
              <div className="text-xs font-semibold text-slate-800">
                Drag and drop your fee statement text file (.txt, .csv, .log) here
              </div>
              <div className="text-[11px] text-slate-500">or</div>
              <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded cursor-pointer transition shadow-2xs">
                <span>Browse File from Device</span>
                <input
                  type="file"
                  accept=".txt,.csv,.log,.text"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Paste Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <ClipboardPaste className="w-3.5 h-3.5 text-indigo-900" />
                <span>Or Paste Raw Fee Statement Text Below:</span>
              </label>
              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={handleClearText}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer"
                    title="Clear pasted text"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                )}
                <span className="text-[10px] font-normal text-slate-500 hidden sm:inline">
                  Copy-pasted from ERP, Portal, PDF or Excel
                </span>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              placeholder="Paste student name, admission number, fee heads, monthly breakdown, concession, receipts here..."
              className="w-full p-3 font-mono text-[11px] bg-slate-900 text-slate-100 rounded border border-slate-700 focus:outline-hidden focus:border-indigo-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Load Sample Demo</span>
              </button>

              {inputText.trim() && (
                <button
                  type="button"
                  onClick={handleClearText}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded border border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded font-bold transition shadow-xs cursor-pointer ${
                inputText.trim()
                  ? 'bg-indigo-950 hover:bg-indigo-900 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Parse & Generate Ledger Statement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Zero Server Uploads &mdash; All Parsing is Done Privately & Locally in your Browser
          </span>
          <span className="font-semibold text-slate-700">Shemford School Portal Engine</span>
        </div>
      </div>
    </div>
  );
};
