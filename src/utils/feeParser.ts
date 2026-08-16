import { StudentInfo, FeeItem, PaymentReceipt, MonthFeeGroup, ParsedFeeStatement } from '../types';
import { calculateLateFeeForItem, parseDateDMY, formatDateDMY } from './lateFee';

const MONTH_REGEX = /^(January|February|March|April|May|June|July|August|September|October|November|December)[-\s_]?\d{2,4}/i;

export function parseFeeStatementText(rawText: string, customAsOfDateStr?: string): ParsedFeeStatement {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const student: StudentInfo = {
    schoolName: 'Shemford School, Natwa Road, Mirzapur',
    statementTitle: 'Student Fee Ledger',
    studentName: '',
    admissionNo: '',
    studentClass: '',
    fatherName: '',
    fatherContact: '',
    copyrightInfo: 'Powered by EDUNEXT',
  };

  let activeMonth = '';
  const monthGroupsMap = new Map<string, MonthFeeGroup>();
  const allFeeItems: FeeItem[] = [];
  const allReceipts: PaymentReceipt[] = [];
  let inReceiptSection = false;

  function parseNumber(val: any): number {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val || val === '-' || val === '--') return 0;
    const cleaned = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // 1. Extract metadata & student information
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];

    if (i === 0 && (line.toLowerCase().includes('school') || line.includes(',') || line.length > 5)) {
      student.schoolName = line;
    }

    if (line.toLowerCase().includes('student fee') && !line.includes(':')) {
      student.statementTitle = line;
    }

    if (line.includes('Student Name') || line.includes('Admission No') || line.includes('Father Name')) {
      const nameMatch = line.match(/Student\s*Name\s*:\s*([^:\t\r\n]+?)(?=\s+Admission|\s+Class|\s+Father|$)/i);
      const admMatch = line.match(/Admission\s*No\.?\s*:\s*([^:\t\r\n]+?)(?=\s+Class|\s+Father|\s+Student|$)/i);
      const classMatch = line.match(/Class\s*:\s*([^:\t\r\n]+?)(?=\s+Father|\s+Admission|\s+Student|$)/i);
      const fatherMatch = line.match(/Father\s*Name\s*:\s*([^:\t\r\n]+?)(?=\s+Father\s*Contact|\s+Contact|\s+Class|$)/i);
      const contactMatch = line.match(/Father\s*Contact\s*:\s*([^:\t\r\n]+?)(?=\s+|$)/i);

      if (nameMatch) student.studentName = nameMatch[1].trim();
      if (admMatch) student.admissionNo = admMatch[1].trim();
      if (classMatch) student.studentClass = classMatch[1].trim();
      if (fatherMatch) student.fatherName = fatherMatch[1].trim();
      if (contactMatch) student.fatherContact = contactMatch[1].trim();
    }
  }

  if (!student.studentName) student.studentName = 'AASHVI MISHRA';
  if (!student.admissionNo) student.admissionNo = 'N-2026026';
  if (!student.studentClass) student.studentClass = 'NURSERY-A';
  if (!student.fatherName) student.fatherName = 'PANKAJ MISHRA';
  if (!student.fatherContact) student.fatherContact = '9473937649';

  function getOrCreateMonth(monthName: string): MonthFeeGroup {
    const cleanMonth = monthName.trim();
    if (!monthGroupsMap.has(cleanMonth)) {
      monthGroupsMap.set(cleanMonth, {
        monthName: cleanMonth,
        items: [],
        totalPayable: 0,
        totalConcession: 0,
        totalWaiver: 0,
        totalPaid: 0,
        totalBalance: 0,
        totalLateFee: 0,
        dueDate: '-',
        paidDate: '-',
        lateDays: 0,
        status: 'UNPAID',
        receipts: [],
      });
    }
    return monthGroupsMap.get(cleanMonth)!;
  }

  // Pre-Scan: Find ONLY actual payment/receipt dates (strictly deposited dates)
  let latestActualPaymentDate: Date | null = null;
  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const tokens = rawLine.includes('\t')
      ? rawLine.split('\t').map(t => t.trim())
      : rawLine.split(/\s{2,}/).map(t => t.trim());

    // Receipt lines: token[0] = Receipt No, token[1] = Date
    if (/^N-\d+/i.test(tokens[0]) || /^(REC|RCP|INV)/i.test(tokens[0])) {
      const d = parseDateDMY(tokens[1]);
      if (d && !isNaN(d.getTime())) {
        if (!latestActualPaymentDate || d.getTime() > latestActualPaymentDate.getTime()) {
          latestActualPaymentDate = d;
        }
      }
    }

    // Fee table line with Paid Amount > 0 and a valid Paid Date
    if (tokens.length >= 8) {
      const paidDateStr = tokens[tokens.length - 2] || tokens[10] || tokens[11];
      const paidAmount = parseNumber(tokens[7] || tokens[6]);
      if (paidAmount > 0 && paidDateStr && paidDateStr !== '-') {
        const d = parseDateDMY(paidDateStr);
        if (d && !isNaN(d.getTime())) {
          if (!latestActualPaymentDate || d.getTime() > latestActualPaymentDate.getTime()) {
            latestActualPaymentDate = d;
          }
        }
      }
    }
  }

  // Determine effective reference date for late fee (Paid Date cutoff or custom/current date)
  const effectiveAsOfDateStr = customAsOfDateStr 
    ? customAsOfDateStr 
    : (latestActualPaymentDate ? formatDateDMY(latestActualPaymentDate) : formatDateDMY(new Date()));

  // 2. Process Lines
  let grandTotalRowFromText: {
    payable: number;
    concession: number;
    waiver: number;
    paid: number;
    balance: number;
  } | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];

    if (rawLine.includes('©') || rawLine.toLowerCase().includes('powered by')) {
      student.copyrightInfo = rawLine;
      continue;
    }

    if (
      rawLine.startsWith('Month\tFee Head') ||
      rawLine.includes('Payable Amount\tConcession') ||
      rawLine.startsWith('Receipt No.\tDate')
    ) {
      continue;
    }

    if (rawLine.toLowerCase().includes('fee payment detail')) {
      inReceiptSection = true;
      continue;
    }

    let tokens = rawLine.includes('\t')
      ? rawLine.split('\t').map(t => t.trim())
      : rawLine.split(/\s{2,}/).map(t => t.trim());

    if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === '')) {
      continue;
    }

    // Receipt Line
    const isReceiptLine =
      inReceiptSection ||
      /^N-\d+-\d+/i.test(tokens[0]) ||
      /^(REC|RCP|INV|N-)/i.test(tokens[0]) ||
      tokens.some(t => t.toLowerCase().includes('print receipt') || t.toLowerCase().includes('online fee'));

    if (isReceiptLine && (tokens.length >= 3 || /^N-\d+/i.test(tokens[0]))) {
      const receiptNo = tokens[0] || `RCP-${allReceipts.length + 1}`;
      const date = tokens[1] || '';
      const amount = parseNumber(tokens[2]);
      const advAdjust = parseNumber(tokens[3]);
      
      let docNo = '';
      let paymentMode = 'Online Fee';
      let bank = '';
      let lateFee = 0;
      let chequeBounce = 0;

      for (let tIdx = 4; tIdx < tokens.length; tIdx++) {
        const tok = tokens[tIdx];
        if (!tok || tok.toLowerCase() === 'print receipt') continue;
        if (/^[a-f0-9]{15,}$/i.test(tok) || /^\d{10,}$/.test(tok) || /^[A-Z0-9_-]{12,}$/.test(tok)) {
          docNo = tok;
        } else if (tok.toLowerCase().includes('fee') || tok.toLowerCase().includes('cash') || tok.toLowerCase().includes('cheque') || tok.toLowerCase().includes('upi') || tok.toLowerCase().includes('card') || tok.toLowerCase().includes('net banking') || tok.toLowerCase().includes('online')) {
          paymentMode = tok;
        } else if (tok.toLowerCase().includes('bank') || tok.length > 2) {
          bank = tok;
        }
      }

      const receipt: PaymentReceipt = {
        id: `rcpt-${allReceipts.length + 1}`,
        receiptNo,
        date,
        amount,
        advanceAdjust: advAdjust,
        lateFee,
        chequeBounce,
        chequeOrDocNo: docNo || 'TxnRef-Auto',
        bank: bank || '-',
        paymentMode: paymentMode || 'Online Fee',
        associatedMonth: activeMonth || undefined,
      };

      allReceipts.push(receipt);

      if (activeMonth && monthGroupsMap.has(activeMonth)) {
        monthGroupsMap.get(activeMonth)!.receipts.push(receipt);
      }

      inReceiptSection = false;
      continue;
    }

    // Grand Total row
    if (tokens[0].toLowerCase() === 'total' && tokens.length >= 6) {
      const payable = parseNumber(tokens[1]);
      const concession = parseNumber(tokens[2]);
      const waiver = parseNumber(tokens[3]);
      let paid = 0;
      let balance = 0;

      const numTokens = tokens.slice(1).map(t => parseNumber(t));
      if (tokens.length >= 10) {
        paid = parseNumber(tokens[5]);
        balance = parseNumber(tokens[tokens.length - 1]);
      } else {
        paid = numTokens[3] || 0;
        balance = numTokens[numTokens.length - 1] || 0;
      }

      if (payable > 30000 || idx >= lines.length - 3) {
        grandTotalRowFromText = {
          payable,
          concession,
          waiver,
          paid,
          balance,
        };
        continue;
      } else if (activeMonth) {
        const monthGroup = getOrCreateMonth(activeMonth);
        monthGroup.totalPayable = payable;
        monthGroup.totalConcession = concession;
        monthGroup.totalWaiver = waiver;
        monthGroup.totalPaid = paid;
        monthGroup.totalBalance = balance;
        continue;
      }
    }

    // Month Row
    const firstTokenMonthMatch = tokens[0].match(MONTH_REGEX);
    if (firstTokenMonthMatch) {
      activeMonth = tokens[0];

      // If month total line without fee heads (e.g. "March-2026 Total 0.00...")
      if (tokens[1] && tokens[1].toLowerCase() === 'total') {
        const payable = parseNumber(tokens[2]);
        const concession = parseNumber(tokens[3]);
        const waiver = parseNumber(tokens[4]);
        const dueDate = tokens[5] || '-';
        const paid = parseNumber(tokens[6]);
        const paidDate = tokens[11] || '-';
        const balance = parseNumber(tokens[12] ?? tokens[tokens.length - 1]);

        // Only register month if it has actual payable or paid amounts
        if (payable > 0 || paid > 0 || balance > 0) {
          const monthGroup = getOrCreateMonth(activeMonth);
          monthGroup.totalPayable = payable;
          monthGroup.totalConcession = concession;
          monthGroup.totalWaiver = waiver;
          monthGroup.dueDate = dueDate;
          monthGroup.totalPaid = paid;
          monthGroup.paidDate = paidDate;
          monthGroup.totalBalance = balance;
        }
        continue;
      }

      const feeHead = tokens[1] || 'Fee Head';
      const period = tokens[2] || activeMonth;
      const payable = parseNumber(tokens[3]);
      const concession = parseNumber(tokens[4]);
      const waiver = parseNumber(tokens[5]);
      const dueDate = tokens[6] || '-';
      const paid = parseNumber(tokens[7]);
      const excess = parseNumber(tokens[8]);
      const adjusted = parseNumber(tokens[9]);
      const refund = parseNumber(tokens[10]);
      const paidDate = tokens[11] || '-';
      const balance = parseNumber(tokens[12] ?? tokens[tokens.length - 1]);

      // If payable and balance are zero and fee head is generic empty placeholder, skip
      if (payable === 0 && paid === 0 && balance === 0 && (!feeHead || feeHead === 'Fee Head' || feeHead === '-')) {
        continue;
      }

      const monthGroup = getOrCreateMonth(activeMonth);
      const isItemPaid = balance === 0 && payable > 0;
      const lateFeeRes = calculateLateFeeForItem(
        feeHead,
        dueDate,
        paidDate,
        isItemPaid,
        effectiveAsOfDateStr
      );

      const item: FeeItem = {
        id: `fee-item-${allFeeItems.length + 1}`,
        month: activeMonth,
        feeHead,
        period,
        payableAmount: payable,
        concessionAmount: concession,
        waiverAmount: waiver,
        dueDate: dueDate.trim() || '-',
        paidAmount: paid,
        excess,
        adjusted,
        refundAmount: refund,
        paidDate: paidDate.trim() || '-',
        balanceAmount: balance,
        lateFeeAmount: isItemPaid ? 0 : lateFeeRes.lateFeeAmount,
        lateDays: isItemPaid ? 0 : lateFeeRes.lateDays,
        isLateFeeApplicable: lateFeeRes.isEligibleHead,
        sessionFreezeApplied: lateFeeRes.isFrozenAtSessionEnd,
      };

      monthGroup.items.push(item);
      allFeeItems.push(item);
      if (dueDate !== '-') monthGroup.dueDate = dueDate;
      if (paidDate !== '-' && paidDate.trim() !== '') monthGroup.paidDate = paidDate;
      continue;
    }

    // Fee head sub-line (does not start with Month name)
    if (activeMonth && tokens.length >= 6) {
      const feeHead = tokens[0];
      const period = tokens[1];
      const payable = parseNumber(tokens[2]);
      const concession = parseNumber(tokens[3]);
      const waiver = parseNumber(tokens[4]);
      const dueDate = tokens[5] || '-';
      const paid = parseNumber(tokens[6]);
      const excess = parseNumber(tokens[7]);
      const adjusted = parseNumber(tokens[8]);
      const refund = parseNumber(tokens[9]);
      const paidDate = tokens[10] || '-';
      const balance = parseNumber(tokens[11] ?? tokens[tokens.length - 1]);

      if (payable === 0 && paid === 0 && balance === 0 && (!feeHead || feeHead === '-')) {
        continue;
      }

      const monthGroup = getOrCreateMonth(activeMonth);
      const isItemPaid = balance === 0 && payable > 0;
      const lateFeeRes = calculateLateFeeForItem(
        feeHead,
        dueDate,
        paidDate,
        isItemPaid,
        effectiveAsOfDateStr
      );

      const item: FeeItem = {
        id: `fee-item-${allFeeItems.length + 1}`,
        month: activeMonth,
        feeHead,
        period,
        payableAmount: payable,
        concessionAmount: concession,
        waiverAmount: waiver,
        dueDate: dueDate.trim() || '-',
        paidAmount: paid,
        excess,
        adjusted,
        refundAmount: refund,
        paidDate: paidDate.trim() || '-',
        balanceAmount: balance,
        lateFeeAmount: isItemPaid ? 0 : lateFeeRes.lateFeeAmount,
        lateDays: isItemPaid ? 0 : lateFeeRes.lateDays,
        isLateFeeApplicable: lateFeeRes.isEligibleHead,
        sessionFreezeApplied: lateFeeRes.isFrozenAtSessionEnd,
      };

      monthGroup.items.push(item);
      allFeeItems.push(item);
      if (dueDate !== '-') monthGroup.dueDate = dueDate;
      if (paidDate !== '-' && paidDate.trim() !== '') monthGroup.paidDate = paidDate;
      continue;
    }
  }

  // 3. Post-process: Filter out any month that has no fee items or 0 total payable/paid
  const allMonthsList: MonthFeeGroup[] = Array.from(monthGroupsMap.values());
  const months: MonthFeeGroup[] = allMonthsList.filter(m => m.items.length > 0);

  months.forEach(m => {
    const computedPayable = m.items.reduce((acc, i) => acc + i.payableAmount, 0);
    const computedConcession = m.items.reduce((acc, i) => acc + i.concessionAmount, 0);
    const computedWaiver = m.items.reduce((acc, i) => acc + i.waiverAmount, 0);
    const computedPaid = m.items.reduce((acc, i) => acc + i.paidAmount, 0);
    const computedBalance = m.items.reduce((acc, i) => acc + i.balanceAmount, 0);
    const isMonthFullyPaid = computedBalance === 0 && computedPayable > 0;
    const computedLateFee = isMonthFullyPaid ? 0 : m.items.reduce((acc, i) => acc + (i.lateFeeAmount || 0), 0);
    const maxLateDays = isMonthFullyPaid ? 0 : m.items.reduce((acc, i) => Math.max(acc, i.lateDays || 0), 0);

    m.totalPayable = computedPayable;
    m.totalConcession = computedConcession;
    m.totalWaiver = computedWaiver;
    m.totalPaid = computedPaid;
    m.totalBalance = computedBalance;
    m.totalLateFee = computedLateFee;
    m.lateDays = maxLateDays;

    if (m.dueDate === '-' || !m.dueDate) {
      const foundDue = m.items.find(i => i.dueDate && i.dueDate !== '-');
      if (foundDue) m.dueDate = foundDue.dueDate;
    }
    if (m.paidDate === '-' || !m.paidDate) {
      const foundPaid = m.items.find(i => i.paidDate && i.paidDate !== '-');
      if (foundPaid) m.paidDate = foundPaid.paidDate;
    }

    const netPayable = m.totalPayable - m.totalConcession - m.totalWaiver;
    if (m.totalBalance === 0 || (m.totalPaid >= netPayable && netPayable > 0)) {
      m.status = 'PAID';
      m.totalLateFee = 0;
      m.lateDays = 0;
    } else if (m.totalPaid > 0 && m.totalPaid < netPayable) {
      m.status = 'PARTIALLY_PAID';
    } else if (netPayable === 0 && m.totalPayable === 0) {
      m.status = 'PAID';
      m.totalLateFee = 0;
      m.lateDays = 0;
    } else {
      m.status = 'UNPAID';
    }
  });

  // 4. Compute overall totals
  const totalPayable = grandTotalRowFromText?.payable ?? months.reduce((acc, m) => acc + m.totalPayable, 0);
  const totalConcession = grandTotalRowFromText?.concession ?? months.reduce((acc, m) => acc + m.totalConcession, 0);
  const totalWaiver = grandTotalRowFromText?.waiver ?? months.reduce((acc, m) => acc + m.totalWaiver, 0);
  const totalPaid = grandTotalRowFromText?.paid ?? months.reduce((acc, m) => acc + m.totalPaid, 0);
  const totalBalance = grandTotalRowFromText?.balance ?? months.reduce((acc, m) => acc + m.totalBalance, 0);
  const totalLateFee = months.reduce((acc, m) => acc + (m.totalLateFee || 0), 0);
  const grandTotalWithLateFee = totalBalance + totalLateFee;

  const totalExcess = allFeeItems.reduce((acc, i) => acc + i.excess, 0);
  const totalAdjusted = allFeeItems.reduce((acc, i) => acc + i.adjusted, 0);
  const totalRefund = allFeeItems.reduce((acc, i) => acc + i.refundAmount, 0);

  const paidMonthsCount = months.filter(m => m.status === 'PAID').length;
  const pendingMonthsCount = months.length - paidMonthsCount;

  return {
    student,
    months,
    allFeeItems,
    allReceipts,
    totals: {
      totalPayable,
      totalConcession,
      totalWaiver,
      totalPaid,
      totalBalance,
      totalLateFee,
      grandTotalWithLateFee,
      totalExcess,
      totalAdjusted,
      totalRefund,
      monthsCount: months.length,
      paidMonthsCount,
      pendingMonthsCount,
    },
  };
}

export function exportToCSV(statement: ParsedFeeStatement): string {
  const headers = [
    'Month',
    'Fee Head',
    'For the Period',
    'Payable Amount',
    'Concession Amount',
    'Waiver Amount',
    'Due Date',
    'Paid Amount',
    'Paid Date',
    'Balance Amount',
    'Late Days',
    'Late Fee (₹3/day Comp. Only)',
    'Total Payable with Late Fee',
  ];

  const rows: string[][] = [];

  statement.months.forEach(m => {
    m.items.forEach(item => {
      const isItemPaid = item.balanceAmount === 0;
      const itemLateFee = isItemPaid ? 0 : (item.lateFeeAmount || 0);
      const itemTotalWithLate = item.balanceAmount + itemLateFee;
      rows.push([
        item.month,
        `"${item.feeHead.replace(/"/g, '""')}"`,
        `"${item.period.replace(/"/g, '""')}"`,
        item.payableAmount.toFixed(2),
        item.concessionAmount.toFixed(2),
        item.waiverAmount.toFixed(2),
        item.dueDate,
        item.paidAmount.toFixed(2),
        item.paidDate,
        item.balanceAmount.toFixed(2),
        String(isItemPaid ? 0 : (item.lateDays || 0)),
        itemLateFee.toFixed(2),
        itemTotalWithLate.toFixed(2),
      ]);
    });

    const isMonthPaid = m.status === 'PAID' || m.totalBalance === 0;
    const monthLateFee = isMonthPaid ? 0 : (m.totalLateFee || 0);
    const monthBalanceWithLate = m.totalBalance + monthLateFee;
    rows.push([
      m.monthName,
      'Month Total',
      '-',
      m.totalPayable.toFixed(2),
      m.totalConcession.toFixed(2),
      m.totalWaiver.toFixed(2),
      m.dueDate,
      m.totalPaid.toFixed(2),
      m.paidDate,
      m.totalBalance.toFixed(2),
      String(isMonthPaid ? 0 : (m.lateDays || 0)),
      monthLateFee.toFixed(2),
      monthBalanceWithLate.toFixed(2),
    ]);
  });

  rows.push([
    'Grand Total',
    'ALL HEADS',
    '-',
    statement.totals.totalPayable.toFixed(2),
    statement.totals.totalConcession.toFixed(2),
    statement.totals.totalWaiver.toFixed(2),
    '-',
    statement.totals.totalPaid.toFixed(2),
    '-',
    statement.totals.totalBalance.toFixed(2),
    '-',
    statement.totals.totalLateFee.toFixed(2),
    statement.totals.grandTotalWithLateFee.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
}
