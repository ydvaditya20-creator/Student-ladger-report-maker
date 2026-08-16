import React from 'react';
import { 
  CreditCard, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  CalendarClock, 
  ReceiptIndianRupee 
} from 'lucide-react';
import { ParsedFeeStatement } from '../types';
import { formatCurrency } from '../utils/defaultData';

interface FeeSummaryCardsProps {
  statement: ParsedFeeStatement;
}

export const FeeSummaryCards: React.FC<FeeSummaryCardsProps> = ({ statement }) => {
  const { totals } = statement;
  const netPayable = totals.totalPayable - totals.totalConcession - totals.totalWaiver;
  const paidPercent = netPayable > 0 ? Math.min(100, Math.round((totals.totalPaid / netPayable) * 100)) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Fee Payable */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Fee Payable</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <ReceiptIndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totals.totalPayable)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center text-xs text-slate-500">
          <CalendarClock className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Across {totals.monthsCount} monthly billing cycles</span>
        </div>
      </div>

      {/* 2. Concessions & Waivers */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Concession</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-700 tracking-tight">
            {formatCurrency(totals.totalConcession + totals.totalWaiver)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center text-xs text-amber-700 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          <span>Includes ₹10k One-Time & Monthly Discounts</span>
        </div>
      </div>

      {/* 3. Total Paid Amount */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid Amount</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-700 tracking-tight">
            {formatCurrency(totals.totalPaid)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-emerald-700 font-semibold">{paidPercent}% Cleared</span>
          <span className="text-slate-500">{statement.allReceipts.length} Receipts Generated</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Balance Due */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-rose-700 tracking-tight">
            {formatCurrency(totals.totalBalance)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center text-xs text-rose-600 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
          <span>{totals.pendingMonthsCount} Months due / upcoming</span>
        </div>
      </div>

    </div>
  );
};
