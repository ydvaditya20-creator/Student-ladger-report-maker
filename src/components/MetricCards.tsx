import React from 'react';
import { formatCurrency, formatNumber } from '../utils/defaultData';
import { Clock, ShieldAlert } from 'lucide-react';

interface MetricCardsProps {
  totalPayable: number;
  totalConcession: number;
  totalWaiver: number;
  totalPaid: number;
  totalBalance: number;
  totalLateFee?: number;
  grandTotalWithLateFee?: number;
  paidMonthsCount?: number;
  totalMonthsCount?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalPayable,
  totalConcession,
  totalWaiver,
  totalPaid,
  totalBalance,
  totalLateFee = 0,
  grandTotalWithLateFee = totalBalance,
  paidMonthsCount = 0,
  totalMonthsCount = 0,
}) => {
  const combinedConcession = totalConcession + totalWaiver;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 print:grid-cols-5 gap-2.5 print:gap-1.5 mb-3 print:mb-1.5 text-center">
      {/* 1. Total Gross Fee */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 print:border-slate-700 p-2 print:p-1.5 rounded print:rounded-none shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-indigo-700 uppercase font-bold">Total Gross Fee</p>
          <span className="text-[9px] font-bold text-indigo-800 bg-indigo-100 px-1 py-0.2 rounded-xs">
            {totalMonthsCount} Mos
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-indigo-950 font-mono mt-0.5">
          {formatCurrency(totalPayable)}
        </p>
      </div>

      {/* 2. Concession / Waiver */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 print:border-slate-700 p-2 print:p-1.5 rounded print:rounded-none shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-emerald-700 uppercase font-bold">Concession</p>
          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded-xs">
            Benefit
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-emerald-800 font-mono mt-0.5">
          {formatCurrency(combinedConcession)}
        </p>
      </div>

      {/* 3. Paid to Date */}
      <div className="bg-blue-50/80 border border-blue-200/80 print:border-slate-700 p-2 print:p-1.5 rounded print:rounded-none shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-blue-700 uppercase font-bold">Deposited</p>
          <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1 py-0.2 rounded-xs">
            {paidMonthsCount} Paid
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-blue-800 font-mono mt-0.5">
          {formatCurrency(totalPaid)}
        </p>
      </div>

      {/* 4. Late Fee (₹3/day on Composite) */}
      <div className="bg-amber-50/80 border border-amber-200/80 print:border-slate-700 p-2 print:p-1.5 rounded print:rounded-none shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-amber-800 uppercase font-bold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>Late Fee</span>
          </p>
          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded-xs">
            ₹3/day
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-amber-900 font-mono mt-0.5">
          {formatCurrency(totalLateFee)}
        </p>
      </div>

      {/* 5. Net Total Due (Balance + Late Fee) */}
      <div className="col-span-2 sm:col-span-1 print:col-span-1 bg-rose-50 border border-rose-200 print:border-slate-700 p-2 print:p-1.5 rounded print:rounded-none shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-rose-700 uppercase font-bold">Net Total Due</p>
          <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1 py-0.2 rounded-xs">
            {totalBalance === 0 ? 'Clear' : 'Pending'}
          </span>
        </div>
        <p className="text-sm sm:text-base font-bold text-rose-700 font-mono mt-0.5">
          {formatCurrency(grandTotalWithLateFee || totalBalance + totalLateFee)}
        </p>
      </div>
    </div>
  );
};
