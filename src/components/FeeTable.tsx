import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Receipt, 
  Search, 
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Info,
  TableProperties
} from 'lucide-react';
import { MonthFeeGroup, FeeItem, PaymentReceipt, StudentInfo } from '../types';
import { formatCurrency, formatNumber } from '../utils/defaultData';
import { CustomReportView } from './CustomReportView';

interface FeeTableProps {
  student?: StudentInfo;
  months: MonthFeeGroup[];
  allFeeItems: FeeItem[];
  allReceipts: PaymentReceipt[];
  totals: {
    totalPayable: number;
    totalConcession: number;
    totalWaiver: number;
    totalPaid: number;
    totalBalance: number;
    totalLateFee: number;
    grandTotalWithLateFee: number;
  };
  onSelectReceipt?: (receipt: PaymentReceipt, monthGroup?: MonthFeeGroup) => void;
}

export const FeeTable: React.FC<FeeTableProps> = ({
  student = {
    schoolName: 'Shemford School, Natwa Road, Mirzapur',
    statementTitle: 'Student Fee Ledger',
    studentName: 'AASHVI MISHRA',
    admissionNo: 'N-2026026',
    studentClass: 'NURSERY-A',
    fatherName: 'PANKAJ MISHRA',
    fatherContact: '9473937649',
  },
  months,
  allFeeItems,
  allReceipts,
  totals,
}) => {
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'DETAILED' | 'RECEIPTS' | 'CUSTOM'>('CUSTOM');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const toggleMonth = (monthName: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthName]: !prev[monthName],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    months.forEach(m => { next[m.monthName] = true; });
    setExpandedMonths(next);
  };

  const collapseAll = () => {
    setExpandedMonths({});
  };

  // Filter months
  const filteredMonths = months.filter(m => {
    const matchesSearch = 
      m.monthName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.items.some(i => i.feeHead.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.receipts.some(r => r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) || r.chequeOrDocNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'PAID' ? m.status === 'PAID' :
      m.status !== 'PAID';

    return matchesSearch && matchesStatus;
  });

  // Filtered detailed items
  const filteredDetailedItems = allFeeItems.filter(item => {
    const matchesSearch = 
      item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.feeHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.period.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'PAID' ? item.balanceAmount === 0 :
      item.balanceAmount > 0;

    return matchesSearch && matchesStatus;
  });

  // Filtered receipts
  const filteredReceipts = allReceipts.filter(r => {
    return (
      r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chequeOrDocNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.associatedMonth && r.associatedMonth.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.paymentMode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
      {/* Table Toolbar Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded">
          <button
            id="tab-custom-report-view"
            onClick={() => setViewMode('CUSTOM')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'CUSTOM'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 text-amber-300" />
            <span>Custom Tabular Report</span>
            <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
              Custom
            </span>
          </button>
          <button
            id="tab-summary-view"
            onClick={() => setViewMode('SUMMARY')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
              viewMode === 'SUMMARY'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            Monthly Summary
          </button>
          <button
            id="tab-detailed-view"
            onClick={() => setViewMode('DETAILED')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
              viewMode === 'DETAILED'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            Itemized Ledger
          </button>
          <button
            id="tab-receipts-view"
            onClick={() => setViewMode('RECEIPTS')}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'RECEIPTS'
                ? 'bg-indigo-900 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Receipt Register ({allReceipts.length})</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          {/* Quick Search */}
          <div className="relative w-full max-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search month / head..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 font-sans"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-hidden focus:border-indigo-600 font-sans cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid Only</option>
            <option value="UNPAID">Pending Due Only</option>
          </select>

          {/* Expand / Collapse for Summary view */}
          {viewMode === 'SUMMARY' && (
            <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
              <button
                onClick={expandAll}
                className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[10px] font-semibold transition cursor-pointer"
                title="Expand all month sub-heads"
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[10px] font-semibold transition cursor-pointer"
                title="Collapse all"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table View Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px] bg-white text-xs">
        
        {/* 1. MONTHLY SUMMARY VIEW */}
        {viewMode === 'SUMMARY' && (
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase font-bold sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-800">
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5 min-w-[130px]">Month</th>
                <th className="p-2.5 min-w-[90px] text-center">Due Date</th>
                <th className="p-2.5 min-w-[95px] text-center">Deposited Date</th>
                <th className="p-2.5 min-w-[100px] text-right">Payable (₹)</th>
                <th className="p-2.5 min-w-[95px] text-right">Concession (₹)</th>
                <th className="p-2.5 min-w-[95px] text-right">Paid (₹)</th>
                <th className="p-2.5 min-w-[95px] text-right font-bold">Balance (₹)</th>
                <th className="p-2.5 min-w-[110px] text-right bg-amber-950/60 text-amber-200">Late Fee (₹3/d)</th>
                <th className="p-2.5 min-w-[125px] text-right font-bold bg-slate-950 text-indigo-200">Net Due Amount (₹)</th>
                <th className="p-2.5 min-w-[90px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredMonths.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 font-medium">
                    No fee records matched your search query.
                  </td>
                </tr>
              ) : (
                filteredMonths.map((m, idx) => {
                  const isExpanded = !!expandedMonths[m.monthName];
                  const isPaid = m.status === 'PAID' || m.totalBalance === 0;
                  const isPartiallyPaid = !isPaid && m.status === 'PARTIALLY_PAID';
                  const isPending = !isPaid && m.status === 'UNPAID';
                  const effectiveLateFee = isPaid ? 0 : (m.totalLateFee || 0);
                  const netDueWithLateFee = isPaid ? 0 : (m.totalBalance + effectiveLateFee);

                  return (
                    <React.Fragment key={m.monthName}>
                      <tr 
                        className={`transition-colors duration-100 hover:bg-slate-50 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                        } ${isExpanded ? 'bg-indigo-50/40' : ''}`}
                      >
                        {/* Toggle button */}
                        <td className="p-2 text-center">
                          {m.items.length > 0 ? (
                            <button
                              onClick={() => toggleMonth(m.monthName)}
                              className="p-1 text-slate-500 hover:text-indigo-900 rounded hover:bg-slate-200 transition cursor-pointer inline-flex items-center justify-center"
                              title={isExpanded ? "Collapse heads" : "Expand fee heads"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-indigo-700" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Month Name */}
                        <td className="p-2 font-bold text-slate-900 font-sans">
                          <button 
                            onClick={() => toggleMonth(m.monthName)}
                            className="text-left font-bold hover:text-indigo-700 cursor-pointer flex items-center gap-1"
                          >
                            <span>{m.monthName}</span>
                            {m.items.length > 1 && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded font-normal print:hidden">
                                {m.items.length} heads
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Due Date */}
                        <td className="p-2 text-center text-slate-600 font-mono text-[11px]">
                          {m.dueDate}
                        </td>

                        {/* Paid / Deposited Date */}
                        <td className="p-2 text-center text-slate-700 font-mono text-[11px]">
                          {m.paidDate !== '-' ? (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {m.paidDate}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Payable */}
                        <td className="p-2 text-right font-mono text-slate-900 font-semibold">
                          {formatNumber(m.totalPayable)}
                        </td>

                        {/* Concession */}
                        <td className="p-2 text-right font-mono text-emerald-700 font-semibold">
                          {formatNumber(m.totalConcession + m.totalWaiver)}
                        </td>

                        {/* Paid */}
                        <td className="p-2 text-right font-mono text-blue-700 font-semibold">
                          {formatNumber(m.totalPaid)}
                        </td>

                        {/* Balance */}
                        <td className={`p-2 text-right font-mono font-bold ${
                          m.totalBalance > 0 ? 'text-rose-700' : 'text-slate-800'
                        }`}>
                          {formatNumber(m.totalBalance)}
                        </td>

                        {/* Late Fee (₹3/day on Composite) */}
                        <td className="p-2 text-right font-mono font-semibold bg-amber-50/50">
                          {effectiveLateFee > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="text-amber-800 font-bold">
                                {formatNumber(effectiveLateFee)}
                              </span>
                              <span className="text-[9px] text-amber-700 font-sans">
                                {m.lateDays}d @ ₹3
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">0.00</span>
                          )}
                        </td>

                        {/* Net Due Total */}
                        <td className={`p-2 text-right font-mono font-bold ${
                          netDueWithLateFee > 0 ? 'text-rose-800 bg-rose-50/40' : 'text-slate-800'
                        }`}>
                          {formatNumber(netDueWithLateFee)}
                        </td>

                        {/* Status badge */}
                        <td className="p-2 text-center">
                          {isPaid && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5 border border-emerald-300">
                              PAID
                            </span>
                          )}
                          {isPartiallyPaid && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5 border border-amber-300">
                              PARTIAL
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5 border border-rose-300">
                              DUE
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Sub-items row */}
                      {isExpanded && m.items.length > 0 && (
                        <tr className="bg-slate-100/90 border-y border-slate-300">
                          <td colSpan={11} className="p-2.5 pl-6">
                            <div className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden">
                              <table className="w-full text-left text-[11px] border-collapse">
                                <thead className="bg-slate-200/90 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                                  <tr>
                                    <th className="p-2 pl-3">Fee Head</th>
                                    <th className="p-2">Period</th>
                                    <th className="p-2 text-right">Payable (₹)</th>
                                    <th className="p-2 text-right">Concession (₹)</th>
                                    <th className="p-2 text-right">Paid (₹)</th>
                                    <th className="p-2 text-right">Balance (₹)</th>
                                    <th className="p-2 text-center">Due Date</th>
                                    <th className="p-2 text-center">Paid Date</th>
                                    <th className="p-2 text-right text-amber-900">Late Fee (₹3/d)</th>
                                    <th className="p-2 text-right font-bold">Net Due Amount (₹)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {m.items.map((it) => {
                                    const isPaidIt = it.balanceAmount === 0;
                                    const itLateFee = isPaidIt ? 0 : (it.lateFeeAmount || 0);
                                    const itTotalDue = isPaidIt ? 0 : (it.balanceAmount + itLateFee);

                                    return (
                                      <tr key={it.id} className="hover:bg-slate-50">
                                        <td className="p-2 pl-3 font-semibold text-slate-800">
                                          {it.feeHead}
                                        </td>
                                        <td className="p-2 text-slate-600">{it.period}</td>
                                        <td className="p-2 text-right font-mono text-slate-800">{formatNumber(it.payableAmount)}</td>
                                        <td className="p-2 text-right font-mono text-emerald-700">{formatNumber(it.concessionAmount)}</td>
                                        <td className="p-2 text-right font-mono text-blue-700">{formatNumber(it.paidAmount)}</td>
                                        <td className="p-2 text-right font-mono font-bold text-rose-700">{formatNumber(it.balanceAmount)}</td>
                                        <td className="p-2 text-center font-mono text-slate-600">{it.dueDate}</td>
                                        <td className="p-2 text-center font-mono text-slate-600">{it.paidDate}</td>
                                        <td className="p-2 text-right font-mono text-amber-800 font-semibold">
                                          {itLateFee > 0 ? (
                                            <span>{formatNumber(itLateFee)} ({it.lateDays}d)</span>
                                          ) : (
                                            <span className="text-slate-400">0.00</span>
                                          )}
                                        </td>
                                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                                          {formatNumber(itTotalDue)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {/* Cumulative Totals Footer */}
            <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-20 shadow-md">
              <tr className="text-xs divide-x divide-slate-800">
                <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-slate-200">
                  Cumulative Academic Year Totals:
                </td>
                <td className="p-2.5 text-right font-mono text-white font-bold">
                  {formatNumber(totals.totalPayable)}
                </td>
                <td className="p-2.5 text-right font-mono text-emerald-300 font-bold">
                  {formatNumber(totals.totalConcession + totals.totalWaiver)}
                </td>
                <td className="p-2.5 text-right font-mono text-blue-300 font-bold">
                  {formatNumber(totals.totalPaid)}
                </td>
                <td className="p-2.5 text-right font-mono text-rose-300 font-bold">
                  {formatNumber(totals.totalBalance)}
                </td>
                <td className="p-2.5 text-right font-mono text-amber-300 font-bold">
                  {formatNumber(totals.totalLateFee)}
                </td>
                <td className="p-2.5 text-right font-mono text-yellow-300 font-bold text-sm">
                  {formatNumber(totals.grandTotalWithLateFee)}
                </td>
                <td className="p-2.5 text-center text-[10px] text-slate-300">
                  {totals.totalBalance === 0 ? 'CLEARED' : 'PENDING'}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* 2. ITEMIZED LEDGER VIEW - CLEAN COLUMN HEADERS */}
        {viewMode === 'DETAILED' && (
          <table className="w-full border-collapse text-left min-w-[1050px]">
            <thead className="bg-slate-900 text-white text-[11px] uppercase font-bold sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-800">
                <th className="p-2.5 px-3 min-w-[110px] whitespace-nowrap">Month</th>
                <th className="p-2.5 px-3 min-w-[180px] whitespace-nowrap">Fee Head</th>
                <th className="p-2.5 px-3 min-w-[100px] whitespace-nowrap">Period</th>
                <th className="p-2.5 px-3 min-w-[95px] text-right whitespace-nowrap">Payable (₹)</th>
                <th className="p-2.5 px-3 min-w-[95px] text-right whitespace-nowrap">Concession (₹)</th>
                <th className="p-2.5 px-3 min-w-[85px] text-right whitespace-nowrap">Waiver (₹)</th>
                <th className="p-2.5 px-3 min-w-[95px] text-center whitespace-nowrap">Due Date</th>
                <th className="p-2.5 px-3 min-w-[95px] text-right whitespace-nowrap">Paid (₹)</th>
                <th className="p-2.5 px-3 min-w-[95px] text-center whitespace-nowrap">Paid Date</th>
                <th className="p-2.5 px-3 min-w-[95px] text-right whitespace-nowrap font-bold">Balance (₹)</th>
                <th className="p-2.5 px-3 min-w-[80px] text-center whitespace-nowrap bg-amber-950/60 text-amber-200">Late Days</th>
                <th className="p-2.5 px-3 min-w-[105px] text-right whitespace-nowrap bg-amber-950/60 text-amber-200">Late Fee (₹3/d)</th>
                <th className="p-2.5 px-3 min-w-[130px] text-right whitespace-nowrap font-bold bg-slate-950 text-indigo-200">
                  <div className="flex flex-col items-end">
                    <span>Net Due Amount (₹)</span>
                    <span className="text-[8.5px] text-slate-300 font-normal lowercase tracking-normal">(balance + late fee)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-200">
              {filteredDetailedItems.map((item, idx) => {
                const isPaidItem = item.balanceAmount === 0;
                const lateFee = isPaidItem ? 0 : (item.lateFeeAmount || 0);
                const totalItemDue = isPaidItem ? 0 : (item.balanceAmount + lateFee);

                return (
                  <tr 
                    key={item.id} 
                    className={`divide-x divide-slate-100 hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    <td className="p-2 px-3 font-bold text-slate-900 whitespace-nowrap">{item.month}</td>
                    <td className="p-2 px-3 font-semibold text-slate-800">
                      {item.feeHead}
                    </td>
                    <td className="p-2 px-3 text-slate-600 whitespace-nowrap">{item.period}</td>
                    <td className="p-2 px-3 text-right font-mono text-slate-900">{formatNumber(item.payableAmount)}</td>
                    <td className="p-2 px-3 text-right font-mono text-emerald-700">{formatNumber(item.concessionAmount)}</td>
                    <td className="p-2 px-3 text-right font-mono text-emerald-700">{formatNumber(item.waiverAmount)}</td>
                    <td className="p-2 px-3 text-center font-mono text-slate-700 whitespace-nowrap">{item.dueDate}</td>
                    <td className="p-2 px-3 text-right font-mono text-blue-700 font-semibold">{formatNumber(item.paidAmount)}</td>
                    <td className="p-2 px-3 text-center font-mono text-slate-700 whitespace-nowrap">
                      {item.paidDate !== '-' ? (
                        <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {item.paidDate}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className={`p-2 px-3 text-right font-mono font-bold ${
                      item.balanceAmount > 0 ? 'text-rose-700' : 'text-slate-800'
                    }`}>
                      {formatNumber(item.balanceAmount)}
                    </td>
                    <td className="p-2 px-3 text-center font-mono text-amber-900 bg-amber-50/40">
                      {item.isLateFeeApplicable && item.lateDays ? (
                        <span className="font-bold">{item.lateDays}d</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2 px-3 text-right font-mono font-semibold text-amber-800 bg-amber-50/40">
                      {lateFee > 0 ? formatNumber(lateFee) : <span className="text-slate-400">0.00</span>}
                    </td>
                    <td className={`p-2 px-3 text-right font-mono font-bold ${
                      totalItemDue > 0 ? 'text-rose-800 bg-rose-50/40' : 'text-slate-800'
                    }`}>
                      {formatNumber(totalItemDue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Cumulative Footer for Itemized View */}
            <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-20 shadow-md">
              <tr className="text-xs divide-x divide-slate-800">
                <td colSpan={3} className="p-2.5 px-3 text-right uppercase tracking-wider text-slate-200">
                  Total of All Itemized Heads:
                </td>
                <td className="p-2.5 px-3 text-right font-mono text-white">
                  {formatNumber(totals.totalPayable)}
                </td>
                <td className="p-2.5 px-3 text-right font-mono text-emerald-300">
                  {formatNumber(totals.totalConcession)}
                </td>
                <td className="p-2.5 px-3 text-right font-mono text-emerald-300">
                  {formatNumber(totals.totalWaiver)}
                </td>
                <td className="p-2.5 px-3 text-center text-slate-400">-</td>
                <td className="p-2.5 px-3 text-right font-mono text-blue-300">
                  {formatNumber(totals.totalPaid)}
                </td>
                <td className="p-2.5 px-3 text-center text-slate-400">-</td>
                <td className="p-2.5 px-3 text-right font-mono text-rose-300">
                  {formatNumber(totals.totalBalance)}
                </td>
                <td className="p-2.5 px-3 text-center text-slate-400">-</td>
                <td className="p-2.5 px-3 text-right font-mono text-amber-300">
                  {formatNumber(totals.totalLateFee)}
                </td>
                <td className="p-2.5 px-3 text-right font-mono text-yellow-300 font-bold text-sm">
                  {formatNumber(totals.grandTotalWithLateFee)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* 3. RECEIPTS VIEW */}
        {viewMode === 'RECEIPTS' && (
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-900 text-white text-[11px] uppercase font-bold sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-800">
                <th className="p-2.5 min-w-[120px]">Receipt No</th>
                <th className="p-2.5 min-w-[100px]">Payment Date</th>
                <th className="p-2.5 min-w-[120px] text-right">Amount Deposited</th>
                <th className="p-2.5 min-w-[180px]">Txn Ref / Doc No</th>
                <th className="p-2.5 min-w-[120px]">Payment Mode</th>
                <th className="p-2.5 min-w-[120px]">Associated Month</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-200">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No payment receipt records found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcpt, idx) => (
                  <tr 
                    key={rcpt.id} 
                    className={`divide-x divide-slate-100 hover:bg-slate-50 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    <td className="p-2 font-bold text-indigo-900 font-mono">{rcpt.receiptNo}</td>
                    <td className="p-2 font-mono text-slate-700">{rcpt.date}</td>
                    <td className="p-2 text-right font-mono font-bold text-blue-700">
                      {formatCurrency(rcpt.amount)}
                    </td>
                    <td className="p-2 font-mono text-[11px] text-slate-600 truncate" title={rcpt.chequeOrDocNo}>
                      {rcpt.chequeOrDocNo}
                    </td>
                    <td className="p-2">
                      <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {rcpt.paymentMode}
                      </span>
                    </td>
                    <td className="p-2 font-medium text-slate-700">{rcpt.associatedMonth || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {/* 4. CUSTOM TABULAR VIEW */}
        {viewMode === 'CUSTOM' && (
          <CustomReportView
            student={student}
            months={filteredMonths}
            allFeeItems={allFeeItems}
          />
        )}
      </div>
    </div>
  );
};
