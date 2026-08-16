/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HighDensityHeader } from './components/StudentHeader';
import { MetricCards } from './components/MetricCards';
import { FeeTable } from './components/FeeTable';
import { ReceiptModal } from './components/ReceiptModal';
import { PasteDataModal } from './components/PasteDataModal';
import { EmptyUploadView } from './components/EmptyUploadView';
import { parseFeeStatementText, exportToCSV } from './utils/feeParser';
import { triggerPrint } from './utils/printHelper';
import { PaymentReceipt, MonthFeeGroup } from './types';

export default function App() {
  // Start with empty raw text so the user manually imports/pastes data initially
  const [rawText, setRawText] = useState<string>('');
  const [isParserModalOpen, setIsParserModalOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [selectedReceiptMonth, setSelectedReceiptMonth] = useState<MonthFeeGroup | null>(null);

  // Parse statement memoized
  const parsedStatement = useMemo(() => {
    if (!rawText || !rawText.trim()) return null;
    return parseFeeStatementText(rawText);
  }, [rawText]);

  // Actions
  const handleOpenParser = () => {
    setIsParserModalOpen(true);
  };

  const handleParseText = (newText: string) => {
    setRawText(newText);
  };

  const handleClearData = () => {
    setRawText('');
  };

  const handleExportCSV = () => {
    if (!parsedStatement) return;
    const csvData = exportToCSV(parsedStatement);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeStudentName = parsedStatement.student.studentName.replace(/[^a-z0-9]/gi, '_') || 'Student';
    link.setAttribute('download', `${safeStudentName}_Fee_Ledger_Statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    triggerPrint();
  };

  const handleSelectReceipt = (receipt: PaymentReceipt, monthGroup?: MonthFeeGroup) => {
    if (!parsedStatement) return;
    setSelectedReceipt(receipt);
    if (monthGroup) {
      setSelectedReceiptMonth(monthGroup);
    } else {
      const matched = parsedStatement.months.find(m => m.monthName === receipt.associatedMonth);
      setSelectedReceiptMonth(matched || null);
    }
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
    setSelectedReceiptMonth(null);
  };

  // If no data has been entered or parsed yet, show the manual upload & paste landing screen
  if (!parsedStatement || parsedStatement.months.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <EmptyUploadView onParseText={handleParseText} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans p-3 sm:p-4 print:p-0 print:m-0 max-w-7xl print:max-w-full print:w-full mx-auto antialiased">
      {/* High Density Header */}
      <HighDensityHeader
        student={parsedStatement.student}
        onOpenParser={handleOpenParser}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        onClearData={handleClearData}
        academicYear="Session 2026-2027"
      />

      {/* High Density Metric Cards */}
      <MetricCards
        totalPayable={parsedStatement.totals.totalPayable}
        totalConcession={parsedStatement.totals.totalConcession}
        totalWaiver={parsedStatement.totals.totalWaiver}
        totalPaid={parsedStatement.totals.totalPaid}
        totalBalance={parsedStatement.totals.totalBalance}
        totalLateFee={parsedStatement.totals.totalLateFee}
        grandTotalWithLateFee={parsedStatement.totals.grandTotalWithLateFee}
        paidMonthsCount={parsedStatement.totals.paidMonthsCount}
        totalMonthsCount={parsedStatement.totals.monthsCount}
      />

      {/* Main Interactive High Density Fee Ledger Table */}
      <FeeTable
        student={parsedStatement.student}
        months={parsedStatement.months}
        allFeeItems={parsedStatement.allFeeItems}
        allReceipts={parsedStatement.allReceipts}
        totals={parsedStatement.totals}
        onSelectReceipt={handleSelectReceipt}
      />

      {/* Modals */}
      <ReceiptModal
        receipt={selectedReceipt}
        student={parsedStatement.student}
        monthGroup={selectedReceiptMonth}
        onClose={handleCloseReceipt}
      />

      <PasteDataModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        onParseText={handleParseText}
        currentText={rawText}
      />
    </div>
  );
}
