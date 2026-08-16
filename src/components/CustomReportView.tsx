import React from 'react';
import { MonthFeeGroup, StudentInfo, FeeItem } from '../types';
import { formatNumber, formatCurrency } from '../utils/defaultData';
import { triggerPrint } from '../utils/printHelper';
import { User, School, Calendar, Phone, Hash, BookOpen, CheckCircle2, Clock, AlertCircle, FileSpreadsheet, Printer, Sparkles } from 'lucide-react';

interface CustomReportViewProps {
  student: StudentInfo;
  months: MonthFeeGroup[];
  allFeeItems?: FeeItem[];
}

export interface CustomReportRow {
  monthDetails: string;
  monthlyProcessingFeesWithoutConcession: number;
  monthlyCompositeFeesWithoutConcession: number;
  monthlyTransportFeesWithoutConcession: number;
  otherFeesBoardExamFees: number;
  lateFine: number;
  totalFees: number;
  monthlyConcessionOnComposite: number;
  monthlyConcessionOnTransport: number;
  concessionOnProcessingFee: number;
  otherConcession: number;
  feesPayableAmountWithConcession: number;
  feePaymentDate: string;
  feesPaidAmount: number;
  feesBalanceAmount: number;
  remarks: string;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
}

export function computeCustomReportRows(months: MonthFeeGroup[]): CustomReportRow[] {
  return months.map(m => {
    // 1. Processing Fees (e.g. Admission/Registration processing fee)
    const processingItems = m.items.filter(i => i.feeHead.toLowerCase().includes('processing'));
    const monthlyProcessingFeesWithoutConcession = processingItems.reduce((sum, i) => sum + i.payableAmount, 0);
    const concessionOnProcessingFee = processingItems.reduce((sum, i) => sum + i.concessionAmount + i.waiverAmount, 0);

    // 2. Monthly Composite Fees without concession
    const compositeItems = m.items.filter(i => i.feeHead.toLowerCase().includes('composite'));
    const monthlyCompositeFeesWithoutConcession = compositeItems.reduce((sum, i) => sum + i.payableAmount, 0);
    const monthlyConcessionOnComposite = compositeItems.reduce((sum, i) => sum + i.concessionAmount + i.waiverAmount, 0);

    // 3. Monthly Transport Fees without concession
    const transportItems = m.items.filter(i => i.feeHead.toLowerCase().includes('transport'));
    const monthlyTransportFeesWithoutConcession = transportItems.reduce((sum, i) => sum + i.payableAmount, 0);
    const monthlyConcessionOnTransport = transportItems.reduce((sum, i) => sum + i.concessionAmount + i.waiverAmount, 0);

    // 4. Other Fees / Board Exam Fees (non-processing, non-composite, non-transport)
    const otherItems = m.items.filter(
      i =>
        !i.feeHead.toLowerCase().includes('processing') &&
        !i.feeHead.toLowerCase().includes('composite') &&
        !i.feeHead.toLowerCase().includes('transport')
    );
    const otherFeesBoardExamFees = otherItems.reduce((sum, i) => sum + i.payableAmount, 0);
    const otherConcession = otherItems.reduce((sum, i) => sum + i.concessionAmount + i.waiverAmount, 0);

    // 5. Late Fine (₹0 if paid or not overdue)
    const isPaid = m.status === 'PAID' || m.totalBalance === 0;
    const lateFine = isPaid ? 0 : (m.totalLateFee || 0);

    // 6. Total Fees without concession (Processing + Composite + Transport + Other + Late Fine)
    const totalFees =
      monthlyProcessingFeesWithoutConcession +
      monthlyCompositeFeesWithoutConcession +
      monthlyTransportFeesWithoutConcession +
      otherFeesBoardExamFees +
      lateFine;

    // 7. Fees Payable Amount with concession
    const totalConcessions =
      concessionOnProcessingFee +
      monthlyConcessionOnComposite +
      monthlyConcessionOnTransport +
      otherConcession;

    const feesPayableAmountWithConcession = Math.max(0, totalFees - lateFine - totalConcessions) + lateFine;

    // 8. Fee Payment Date
    let feePaymentDate = m.paidDate && m.paidDate !== '-' ? m.paidDate : '';
    if (!feePaymentDate && m.receipts && m.receipts.length > 0) {
      feePaymentDate = m.receipts.map(r => r.date).filter(Boolean).join(', ');
    }
    if (!feePaymentDate) feePaymentDate = '-';

    // 9. Fees Paid Amount
    const feesPaidAmount = m.totalPaid;

    // 10. Fees Balance Amount
    const feesBalanceAmount = isPaid ? 0 : m.totalBalance + lateFine;

    // 11. Remarks
    let remarks = '';
    if (isPaid) {
      if (m.receipts && m.receipts.length > 0) {
        remarks = `Paid (Receipt: ${m.receipts.map(r => r.receiptNo).join(', ')})`;
      } else {
        remarks = `Paid in Full${feePaymentDate !== '-' ? ' on ' + feePaymentDate : ''}`;
      }
    } else if (m.status === 'PARTIALLY_PAID') {
      remarks = `Partially Paid (Paid: ₹${formatNumber(feesPaidAmount)}, Bal: ₹${formatNumber(feesBalanceAmount)})`;
    } else {
      remarks = `Pending Due (Due: ${m.dueDate && m.dueDate !== '-' ? m.dueDate : '10th of Month'})`;
    }

    return {
      monthDetails: m.monthName,
      monthlyProcessingFeesWithoutConcession,
      monthlyCompositeFeesWithoutConcession,
      monthlyTransportFeesWithoutConcession,
      otherFeesBoardExamFees,
      lateFine,
      totalFees,
      monthlyConcessionOnComposite,
      monthlyConcessionOnTransport,
      concessionOnProcessingFee,
      otherConcession,
      feesPayableAmountWithConcession,
      feePaymentDate,
      feesPaidAmount,
      feesBalanceAmount,
      remarks,
      status: isPaid ? 'PAID' : m.status === 'PARTIALLY_PAID' ? 'PARTIALLY_PAID' : 'UNPAID',
    };
  });
}

export const CustomReportView: React.FC<CustomReportViewProps> = ({
  student,
  months,
}) => {
  const rows = computeCustomReportRows(months);

  // Dynamic Check: Does any month have Processing Fee or Concession on Processing Fee?
  const hasProcessingFee = rows.some(
    r => r.monthlyProcessingFeesWithoutConcession > 0 || r.concessionOnProcessingFee > 0
  );

  // Totals calculations
  const totalProcessingWithoutConcession = rows.reduce((s, r) => s + r.monthlyProcessingFeesWithoutConcession, 0);
  const totalConcessionProcessing = rows.reduce((s, r) => s + r.concessionOnProcessingFee, 0);
  const totalCompositeWithoutConcession = rows.reduce((s, r) => s + r.monthlyCompositeFeesWithoutConcession, 0);
  const totalTransportWithoutConcession = rows.reduce((s, r) => s + r.monthlyTransportFeesWithoutConcession, 0);
  const totalOtherFees = rows.reduce((s, r) => s + r.otherFeesBoardExamFees, 0);
  const totalLateFine = rows.reduce((s, r) => s + r.lateFine, 0);
  const grandTotalFees = rows.reduce((s, r) => s + r.totalFees, 0);
  const totalConcessionComposite = rows.reduce((s, r) => s + r.monthlyConcessionOnComposite, 0);
  const totalConcessionTransport = rows.reduce((s, r) => s + r.monthlyConcessionOnTransport, 0);
  const grandPayableWithConcession = rows.reduce((s, r) => s + r.feesPayableAmountWithConcession, 0);
  const grandPaidAmount = rows.reduce((s, r) => s + r.feesPaidAmount, 0);
  const grandBalanceAmount = rows.reduce((s, r) => s + r.feesBalanceAmount, 0);

  const handleExportCSV = () => {
    // Dynamically build CSV headers based on hasProcessingFee
    const headers = [
      'Month Details',
      ...(hasProcessingFee ? ['Processing Fees without concession'] : []),
      'Monthly Composit Fees without concession',
      'Monthly Transport Fees without concession',
      'Other Fees/Board Exam Fees',
      'Late Fine',
      'Total Fees',
      ...(hasProcessingFee ? ['Monthly Concession on Processing Fee'] : []),
      'Monthly Concession on Monthly composite fee',
      'Monthly Concession on Transport',
      'Fees Payable Amount with concession',
      'Fee Payment Date',
      'Fees Paid Amount',
      'Fees Balance Amount',
      'Remarks',
    ];

    const dataRows = rows.map(r => [
      `"${r.monthDetails}"`,
      ...(hasProcessingFee ? [r.monthlyProcessingFeesWithoutConcession.toFixed(2)] : []),
      r.monthlyCompositeFeesWithoutConcession.toFixed(2),
      r.monthlyTransportFeesWithoutConcession.toFixed(2),
      r.otherFeesBoardExamFees.toFixed(2),
      r.lateFine.toFixed(2),
      r.totalFees.toFixed(2),
      ...(hasProcessingFee ? [r.concessionOnProcessingFee.toFixed(2)] : []),
      r.monthlyConcessionOnComposite.toFixed(2),
      r.monthlyConcessionOnTransport.toFixed(2),
      r.feesPayableAmountWithConcession.toFixed(2),
      `"${r.feePaymentDate}"`,
      r.feesPaidAmount.toFixed(2),
      r.feesBalanceAmount.toFixed(2),
      `"${r.remarks.replace(/"/g, '""')}"`,
    ]);

    // Total row
    dataRows.push([
      '"Total / Summary"',
      ...(hasProcessingFee ? [totalProcessingWithoutConcession.toFixed(2)] : []),
      totalCompositeWithoutConcession.toFixed(2),
      totalTransportWithoutConcession.toFixed(2),
      totalOtherFees.toFixed(2),
      totalLateFine.toFixed(2),
      grandTotalFees.toFixed(2),
      ...(hasProcessingFee ? [totalConcessionProcessing.toFixed(2)] : []),
      totalConcessionComposite.toFixed(2),
      totalConcessionTransport.toFixed(2),
      grandPayableWithConcession.toFixed(2),
      '"-"',
      grandPaidAmount.toFixed(2),
      grandBalanceAmount.toFixed(2),
      '"Session Total Statement"',
    ]);

    const csvString = [headers.join(','), ...dataRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.studentName || 'Student'}_Custom_Fee_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-white">
      {/* Action Toolbar (Screen Only - Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 px-1 gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-indigo-950 uppercase bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
            Custom Tabular Report
          </span>
          {hasProcessingFee && (
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Includes Processing Fee Head
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Export this Custom Report as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Custom CSV</span>
          </button>
          <button
            onClick={() => triggerPrint()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-900 hover:bg-indigo-950 text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Print Custom Report / Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Custom Tabular View */}
      <div className="border border-slate-300 rounded overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
          <thead>
            <tr className="bg-indigo-950 text-white font-semibold divide-x divide-indigo-900 text-[11px]">
              <th className="p-2.5 whitespace-nowrap min-w-[110px]">Month Details</th>

              {/* Dynamic Processing Fee Column without Concession */}
              {hasProcessingFee && (
                <th className="p-2.5 text-right whitespace-nowrap min-w-[130px] bg-purple-950 text-purple-100">
                  Processing Fees<br />
                  <span className="text-[9px] font-normal text-purple-200">without concession</span>
                </th>
              )}

              <th className="p-2.5 text-right whitespace-nowrap min-w-[125px]">
                Monthly Composit Fees<br />
                <span className="text-[9px] font-normal text-indigo-200">without concession</span>
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[125px]">
                Monthly Transport Fees<br />
                <span className="text-[9px] font-normal text-indigo-200">without concession</span>
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[115px]">
                Other Fees/<br />Board Exam Fees
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[85px] bg-amber-900/80 text-amber-100">
                Late Fine
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[105px] bg-indigo-900">
                Total Fees
              </th>

              {/* Dynamic Concession on Processing Fee Column */}
              {hasProcessingFee && (
                <th className="p-2.5 text-right whitespace-nowrap min-w-[130px] text-emerald-200 bg-emerald-950/60">
                  Monthly Concession<br />
                  <span className="text-[9px] font-normal text-emerald-300">on Processing fee</span>
                </th>
              )}

              <th className="p-2.5 text-right whitespace-nowrap min-w-[130px] text-emerald-200">
                Monthly Concession<br />
                <span className="text-[9px] font-normal">on Monthly composite fee</span>
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[120px] text-emerald-200">
                Monthly Concession<br />
                <span className="text-[9px] font-normal">on Transport</span>
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[130px] bg-blue-900 text-blue-100">
                Fees Payable Amount<br />
                <span className="text-[9px] font-normal text-blue-200">with concession</span>
              </th>

              <th className="p-2.5 text-center whitespace-nowrap min-w-[105px]">
                Fee Payment Date
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[110px] bg-emerald-950 text-emerald-200">
                Fees Paid Amount
              </th>

              <th className="p-2.5 text-right whitespace-nowrap min-w-[115px] bg-rose-950 text-rose-200">
                Fees Balance Amount
              </th>

              <th className="p-2.5 whitespace-nowrap min-w-[170px]">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {rows.map((row, idx) => {
              const isPaid = row.status === 'PAID';
              const isPartiallyPaid = row.status === 'PARTIALLY_PAID';

              return (
                <tr
                  key={row.monthDetails}
                  className={`hover:bg-slate-50 transition ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  {/* Month Details */}
                  <td className="p-2 font-bold text-slate-900 whitespace-nowrap border-r border-slate-200 flex items-center gap-1.5">
                    {isPaid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span>{row.monthDetails}</span>
                  </td>

                  {/* Dynamic Processing Fee without concession */}
                  {hasProcessingFee && (
                    <td className="p-2 text-right font-mono border-r border-slate-200 bg-purple-50/20">
                      {row.monthlyProcessingFeesWithoutConcession > 0 ? (
                        <span className="font-semibold text-purple-900">
                          {formatNumber(row.monthlyProcessingFeesWithoutConcession)}
                        </span>
                      ) : (
                        <span className="text-slate-400">0.00</span>
                      )}
                    </td>
                  )}

                  {/* Monthly Composite Fees without concession */}
                  <td className="p-2 text-right font-mono border-r border-slate-200">
                    {formatNumber(row.monthlyCompositeFeesWithoutConcession)}
                  </td>

                  {/* Monthly Transport Fees without concession */}
                  <td className="p-2 text-right font-mono border-r border-slate-200">
                    {row.monthlyTransportFeesWithoutConcession > 0 ? (
                      formatNumber(row.monthlyTransportFeesWithoutConcession)
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Other Fees/Board Exam Fees */}
                  <td className="p-2 text-right font-mono border-r border-slate-200">
                    {row.otherFeesBoardExamFees > 0 ? (
                      formatNumber(row.otherFeesBoardExamFees)
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Late Fine */}
                  <td className="p-2 text-right font-mono border-r border-slate-200 bg-amber-50/40">
                    {row.lateFine > 0 ? (
                      <span className="font-bold text-amber-800">{formatNumber(row.lateFine)}</span>
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Total Fees */}
                  <td className="p-2 text-right font-mono font-semibold bg-slate-100/60 border-r border-slate-200">
                    {formatNumber(row.totalFees)}
                  </td>

                  {/* Dynamic Concession on Processing Fee */}
                  {hasProcessingFee && (
                    <td className="p-2 text-right font-mono text-emerald-700 font-semibold border-r border-slate-200 bg-emerald-50/20">
                      {row.concessionOnProcessingFee > 0 ? (
                        `-${formatNumber(row.concessionOnProcessingFee)}`
                      ) : (
                        <span className="text-slate-400">0.00</span>
                      )}
                    </td>
                  )}

                  {/* Monthly Concession on Monthly composite fee */}
                  <td className="p-2 text-right font-mono text-emerald-700 font-semibold border-r border-slate-200">
                    {row.monthlyConcessionOnComposite > 0 ? (
                      `-${formatNumber(row.monthlyConcessionOnComposite)}`
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Monthly Concession on Transport */}
                  <td className="p-2 text-right font-mono text-emerald-700 font-semibold border-r border-slate-200">
                    {row.monthlyConcessionOnTransport > 0 ? (
                      `-${formatNumber(row.monthlyConcessionOnTransport)}`
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Fees Payable Amount with concession */}
                  <td className="p-2 text-right font-mono font-bold text-indigo-950 bg-blue-50/40 border-r border-slate-200">
                    {formatNumber(row.feesPayableAmountWithConcession)}
                  </td>

                  {/* Fee Payment Date */}
                  <td className="p-2 text-center font-mono text-[11px] border-r border-slate-200 text-slate-700 whitespace-nowrap">
                    {row.feePaymentDate !== '-' ? (
                      <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium border border-emerald-200">
                        {row.feePaymentDate}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Fees Paid Amount */}
                  <td className="p-2 text-right font-mono font-bold text-emerald-800 bg-emerald-50/30 border-r border-slate-200">
                    {row.feesPaidAmount > 0 ? (
                      formatNumber(row.feesPaidAmount)
                    ) : (
                      <span className="text-slate-400">0.00</span>
                    )}
                  </td>

                  {/* Fees Balance Amount */}
                  <td className="p-2 text-right font-mono font-bold border-r border-slate-200">
                    {row.feesBalanceAmount > 0 ? (
                      <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                        {formatNumber(row.feesBalanceAmount)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">0.00</span>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="p-2 text-[11px] whitespace-nowrap">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {row.remarks}
                      </span>
                    ) : isPartiallyPaid ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        {row.remarks}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {row.remarks}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Total Footer Row */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold divide-x divide-slate-800 text-xs border-t-2 border-slate-700">
              <td className="p-2.5 font-bold uppercase tracking-wider text-slate-100">
                Grand Total / Summary
              </td>

              {/* Dynamic Footer for Processing Fee */}
              {hasProcessingFee && (
                <td className="p-2.5 text-right font-mono text-purple-200 bg-purple-950/80">
                  {formatNumber(totalProcessingWithoutConcession)}
                </td>
              )}

              <td className="p-2.5 text-right font-mono text-slate-100">
                {formatNumber(totalCompositeWithoutConcession)}
              </td>
              <td className="p-2.5 text-right font-mono text-slate-100">
                {formatNumber(totalTransportWithoutConcession)}
              </td>
              <td className="p-2.5 text-right font-mono text-slate-100">
                {formatNumber(totalOtherFees)}
              </td>
              <td className="p-2.5 text-right font-mono text-amber-300 bg-amber-950/80">
                {formatNumber(totalLateFine)}
              </td>
              <td className="p-2.5 text-right font-mono text-white bg-slate-800">
                {formatNumber(grandTotalFees)}
              </td>

              {/* Dynamic Footer for Concession on Processing Fee */}
              {hasProcessingFee && (
                <td className="p-2.5 text-right font-mono text-emerald-300 bg-emerald-950/80">
                  {totalConcessionProcessing > 0 ? `-${formatNumber(totalConcessionProcessing)}` : '0.00'}
                </td>
              )}

              <td className="p-2.5 text-right font-mono text-emerald-300">
                -{formatNumber(totalConcessionComposite)}
              </td>
              <td className="p-2.5 text-right font-mono text-emerald-300">
                {totalConcessionTransport > 0 ? `-${formatNumber(totalConcessionTransport)}` : '0.00'}
              </td>
              <td className="p-2.5 text-right font-mono text-blue-200 bg-blue-950/80">
                {formatNumber(grandPayableWithConcession)}
              </td>
              <td className="p-2.5 text-center text-slate-400 font-normal">
                -
              </td>
              <td className="p-2.5 text-right font-mono text-emerald-300 bg-emerald-950/80">
                {formatNumber(grandPaidAmount)}
              </td>
              <td className="p-2.5 text-right font-mono text-rose-300 bg-rose-950/80">
                {formatNumber(grandBalanceAmount)}
              </td>
              <td className="p-2.5 text-[11px] font-normal text-slate-300">
                {grandBalanceAmount === 0 ? 'Full Session Fees Cleared' : `Net Outstanding: ₹${formatNumber(grandBalanceAmount)}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
