import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  IdCard, 
  GraduationCap, 
  Phone, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  FileText,
  Calendar,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { StudentInfo } from '../types';

interface HighDensityHeaderProps {
  student: StudentInfo;
  onOpenParser: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onClearData?: () => void;
  academicYear?: string;
}

export const HighDensityHeader: React.FC<HighDensityHeaderProps> = ({
  student,
  onOpenParser,
  onExportCSV,
  onPrint,
  onClearData,
  academicYear = 'Session 2026-2027',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full">
      {/* Top School Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-indigo-900 pb-3 mb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-900 leading-tight tracking-tight uppercase">
              {student.schoolName || 'SHEMFORD SCHOOL'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Natwa Road, Mirzapur, Uttar Pradesh
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:text-right">
          <div className="hidden sm:block mr-2 text-right">
            <span className="bg-indigo-900 text-white px-2.5 py-1 rounded-xs text-[10px] font-bold tracking-widest uppercase inline-block">
              {student.statementTitle || 'Student Ledger Report'}
            </span>
            <p className="text-[11px] text-slate-500 uppercase font-semibold mt-0.5">
              {academicYear}
            </p>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            {onClearData && (
              <button
                id="btn-clear-data"
                onClick={onClearData}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-2xs transition cursor-pointer"
                title="Clear current data and import new student statement"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New / Paste</span>
              </button>
            )}

            <button
              id="btn-paste-parser"
              onClick={onOpenParser}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Paste or extract another fee text"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Update Data</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition cursor-pointer"
              title="Export statement as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              id="btn-print-action"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-indigo-900 hover:bg-indigo-800 text-white shadow-2xs transition cursor-pointer"
              title="Print Ledger"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </button>
          </div>
        </div>
      </header>

      {/* Student Meta Card Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border border-slate-200 p-3 rounded shadow-2xs mb-3">
        {/* Student Name */}
        <div className="relative group">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5 flex items-center justify-between">
            <span>Student Name</span>
            <button 
              onClick={() => copyToClipboard(student.studentName, 'name')}
              className="text-slate-400 hover:text-indigo-600 transition p-0.5"
              title="Copy student name"
            >
              {copiedField === 'name' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </p>
          <p className="text-sm font-bold text-indigo-900 truncate" title={student.studentName}>
            {student.studentName || 'AASHVI MISHRA'}
          </p>
        </div>

        {/* Admission / Class */}
        <div className="relative group">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5 flex items-center justify-between">
            <span>Admission / Class</span>
            <button 
              onClick={() => copyToClipboard(`${student.admissionNo} / ${student.studentClass}`, 'adm')}
              className="text-slate-400 hover:text-indigo-600 transition p-0.5"
              title="Copy admission & class"
            >
              {copiedField === 'adm' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </p>
          <p className="text-sm font-semibold text-slate-800 font-mono">
            {student.admissionNo || 'N-2026026'} / <span className="font-sans font-bold text-indigo-800">{student.studentClass || 'NURSERY-A'}</span>
          </p>
        </div>

        {/* Father's Name */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">
            Father's Name
          </p>
          <p className="text-sm font-semibold text-slate-800 truncate" title={student.fatherName}>
            {student.fatherName || 'PANKAJ MISHRA'}
          </p>
        </div>

        {/* Contact Details */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5 flex items-center justify-between">
            <span>Contact Details</span>
            <button 
              onClick={() => copyToClipboard(student.fatherContact, 'contact')}
              className="text-slate-400 hover:text-indigo-600 transition p-0.5"
              title="Copy phone"
            >
              {copiedField === 'contact' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </p>
          <a 
            href={`tel:${student.fatherContact}`}
            className="text-sm font-semibold text-indigo-900 hover:underline font-mono"
          >
            +91 {student.fatherContact ? student.fatherContact.replace(/(\d{5})(\d{5})/, '$1 $2') : '94739 37649'}
          </a>
        </div>
      </section>
    </div>
  );
};
