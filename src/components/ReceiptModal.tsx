import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PaymentReceipt, StudentInfo, MonthFeeGroup } from '../types';
import { formatCurrency, formatNumber, numberToWordsINR } from '../utils/defaultData';
import { triggerPrint } from '../utils/printHelper';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  student: StudentInfo;
  monthGroup?: MonthFeeGroup | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  student,
  monthGroup,
  onClose,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-950 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-300" />
            <h2 className="text-sm font-bold tracking-wide uppercase">
              Fee Payment Receipt — {receipt.receiptNo}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 bg-indigo-800 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto print:p-0 bg-white font-sans text-slate-900 text-xs leading-relaxed" id="printable-receipt-area">
          {/* Top Receipt Watermark & School Header */}
          <div className="border-2 border-indigo-950 p-5 rounded-xs relative">
            {/* Header */}
            <div className="text-center border-b-2 border-indigo-950 pb-3 mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 bg-indigo-950 text-white rounded-xs flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <h1 className="text-xl font-black text-indigo-950 tracking-wider uppercase">
                  {student.schoolName || 'SHEMFORD SCHOOL'}
                </h1>
              </div>
              <p className="text-slate-600 font-semibold text-[11px]">
                Natwa Road, Mirzapur, Uttar Pradesh — 231001
              </p>
              <div className="inline-block bg-indigo-950 text-white px-3 py-0.5 mt-2 rounded-xs text-[10px] font-bold uppercase tracking-widest">
                Official Fee Payment Receipt
              </div>
            </div>

            {/* Receipt & Student Details 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4 pb-3 mb-3 border-b border-slate-300 text-[11px]">
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5 w-24">Receipt No:</td>
                      <td className="font-bold text-indigo-950 font-mono">{receipt.receiptNo}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Receipt Date:</td>
                      <td className="font-bold font-mono">{receipt.date}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Payment Mode:</td>
                      <td className="font-bold">{receipt.paymentMode || 'Online Fee'}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Txn / Doc Ref:</td>
                      <td className="font-mono text-[10px] break-all">{receipt.chequeOrDocNo}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5 w-24">Student Name:</td>
                      <td className="font-bold text-slate-900">{student.studentName}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Admission No:</td>
                      <td className="font-bold font-mono">{student.admissionNo}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Class / Sec:</td>
                      <td className="font-bold">{student.studentClass}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-semibold py-0.5">Father's Name:</td>
                      <td className="font-semibold">{student.fatherName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Itemized Table Breakdown */}
            <div className="mb-4">
              <table className="w-full text-left border border-slate-300 border-collapse">
                <thead className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-2 border-r border-slate-300">Fee Description / Account Head</th>
                    <th className="p-2 border-r border-slate-300 text-center w-24">Period</th>
                    <th className="p-2 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {monthGroup && monthGroup.items.length > 0 ? (
                    monthGroup.items.map((it, i) => (
                      <tr key={it.id}>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{i + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{it.feeHead}</td>
                        <td className="p-2 border-r border-slate-200 text-center text-slate-600">{it.period}</td>
                        <td className="p-2 text-right font-mono font-semibold">{formatNumber(it.paidAmount > 0 ? it.paidAmount : it.payableAmount - it.concessionAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">1</td>
                      <td className="p-2 border-r border-slate-200 font-semibold">Composite School & Tuition Fee Payment</td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-600">{receipt.associatedMonth || 'Current Term'}</td>
                      <td className="p-2 text-right font-mono font-semibold">{formatNumber(receipt.amount)}</td>
                    </tr>
                  )}
                  {receipt.lateFee > 0 && (
                    <tr>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">-</td>
                      <td className="p-2 border-r border-slate-200 text-rose-700">Late Fee Fine</td>
                      <td className="p-2 border-r border-slate-200 text-center">-</td>
                      <td className="p-2 text-right font-mono text-rose-700">{formatNumber(receipt.lateFee)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-[11px]">
                  <tr>
                    <td colSpan={3} className="p-2 border-r border-slate-300 text-right uppercase text-slate-600">
                      Total Amount Received:
                    </td>
                    <td className="p-2 text-right font-mono text-indigo-950 font-black text-xs">
                      {formatCurrency(receipt.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Amount In Words */}
            <div className="bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-xs mb-4">
              <span className="text-[10px] uppercase font-bold text-indigo-900 block">Amount in Words:</span>
              <p className="font-bold text-slate-900 italic text-xs">
                {numberToWordsINR(receipt.amount)}
              </p>
            </div>

            {/* Signature & Seal Section */}
            <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-slate-300">
              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Digitally Verified by EDUNEXT ERP Portal</span>
              </div>
              <div className="text-right">
                <div className="w-40 ml-auto border-b border-slate-400 pb-1 mb-1 text-center font-serif text-slate-400 italic">
                  Accounts Dept
                </div>
                <p className="text-[10px] text-slate-600 font-bold uppercase">
                  Authorized School Signatory
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-3 print:mt-1">
            * This is a computer generated fee receipt and does not require physical signature.
          </div>
        </div>
      </div>
    </div>
  );
};
