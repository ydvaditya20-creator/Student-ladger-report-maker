/**
 * Late Fee Calculator for School Fee Ledger
 * Rule:
 * 1. Applicable ONLY on 'Monthly Composite Fees' / 'Composite Fee' heads.
 * 2. When Composite Fee is already paid, late fee was cleared/settled along with it (Late Fee Due = 0).
 * 3. On UNPAID / PENDING Composite Fees: Late fee is calculated ONLY up to the Reference Date / Today's Date,
 *    or up to the latest payment date. It does NOT calculate future dates ahead of time.
 * 4. If target date is before or equal to Due Date, Late Fee = 0.
 */

export const SESSION_END_DATE_STRING = '31-03-2027';

/**
 * Parses date string in DD-MM-YYYY or DD-MM-YY format to Date object
 */
export function parseDateDMY(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr === '-' || dateStr === '--' || dateStr.trim() === '') {
    return null;
  }
  const clean = dateStr.trim();
  const parts = clean.split(/[-/.]/);
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  let year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  if (year < 100) {
    year += 2000;
  }

  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats Date object to DD-MM-YYYY string
 */
export function formatDateDMY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export interface LateFeeCalculationResult {
  isEligibleHead: boolean;
  dueDate: string;
  depositedDate: string;
  effectiveEndDate: string;
  lateDays: number;
  ratePerDay: number;
  lateFeeAmount: number;
  isFrozenAtSessionEnd: boolean;
  statusText: string;
}

/**
 * Calculates late fee for a fee item based on school policy.
 * Only calculates elapsed overdue days up to asOfDate (reference date / paid date back).
 * Future days are NOT calculated in advance.
 */
export function calculateLateFeeForItem(
  feeHead: string,
  dueDateStr: string,
  paidDateStr: string,
  isPaid: boolean,
  targetAsOfDateStr?: string
): LateFeeCalculationResult {
  const isEligibleHead = feeHead.toLowerCase().includes('composite');
  const ratePerDay = 3;

  // If not composite head OR if already paid (as late fee was settled along with payment)
  if (!isEligibleHead || isPaid) {
    return {
      isEligibleHead,
      dueDate: dueDateStr || '-',
      depositedDate: paidDateStr || '-',
      effectiveEndDate: '-',
      lateDays: 0,
      ratePerDay: isEligibleHead ? ratePerDay : 0,
      lateFeeAmount: 0,
      isFrozenAtSessionEnd: false,
      statusText: isPaid ? 'Fee Paid (No Late Fee Due)' : 'No Late Fee (Composite Head Only)',
    };
  }

  const dueDate = parseDateDMY(dueDateStr);
  if (!dueDate) {
    return {
      isEligibleHead: true,
      dueDate: dueDateStr || '-',
      depositedDate: paidDateStr || '-',
      effectiveEndDate: '-',
      lateDays: 0,
      ratePerDay,
      lateFeeAmount: 0,
      isFrozenAtSessionEnd: false,
      statusText: 'No Due Date Defined',
    };
  }

  // Determine calculation end date:
  // If targetAsOfDateStr is provided, use it. Otherwise use current date (today).
  let calculationDate = targetAsOfDateStr ? parseDateDMY(targetAsOfDateStr) : new Date();
  if (!calculationDate) {
    calculationDate = new Date();
  }

  // Only calculate if the calculation date has actually passed the due date
  const diffTime = calculationDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isEligibleHead: true,
      dueDate: dueDateStr,
      depositedDate: paidDateStr && paidDateStr !== '-' ? paidDateStr : '-',
      effectiveEndDate: formatDateDMY(calculationDate),
      lateDays: 0,
      ratePerDay,
      lateFeeAmount: 0,
      isFrozenAtSessionEnd: false,
      statusText: 'Due Date Not Reached / Not Overdue (₹0)',
    };
  }

  const lateDays = diffDays;
  const lateFeeAmount = lateDays * ratePerDay;

  return {
    isEligibleHead: true,
    dueDate: dueDateStr,
    depositedDate: paidDateStr && paidDateStr !== '-' ? paidDateStr : '-',
    effectiveEndDate: formatDateDMY(calculationDate),
    lateDays,
    ratePerDay,
    lateFeeAmount,
    isFrozenAtSessionEnd: false,
    statusText: `${lateDays} days overdue @ ₹${ratePerDay}/day`,
  };
}
