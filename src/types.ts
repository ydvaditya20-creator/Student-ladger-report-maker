export interface StudentInfo {
  schoolName: string;
  statementTitle: string;
  studentName: string;
  admissionNo: string;
  studentClass: string;
  fatherName: string;
  fatherContact: string;
  copyrightInfo?: string;
}

export interface FeeItem {
  id: string;
  month: string;
  feeHead: string;
  period: string;
  payableAmount: number;
  concessionAmount: number;
  waiverAmount: number;
  dueDate: string;
  paidAmount: number;
  excess: number;
  adjusted: number;
  refundAmount: number;
  paidDate: string;
  balanceAmount: number;
  isTotalRow?: boolean;
  lateFeeAmount?: number;
  lateDays?: number;
  isLateFeeApplicable?: boolean;
  sessionFreezeApplied?: boolean;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  advanceAdjust: number;
  lateFee: number;
  chequeBounce: number;
  chequeOrDocNo: string;
  bank: string;
  paymentMode: string;
  associatedMonth?: string;
}

export interface MonthFeeGroup {
  monthName: string;
  items: FeeItem[];
  totalPayable: number;
  totalConcession: number;
  totalWaiver: number;
  totalPaid: number;
  totalBalance: number;
  totalLateFee: number;
  dueDate: string;
  paidDate: string;
  lateDays: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  receipts: PaymentReceipt[];
}

export interface ParsedFeeStatement {
  student: StudentInfo;
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
    totalExcess: number;
    totalAdjusted: number;
    totalRefund: number;
    monthsCount: number;
    paidMonthsCount: number;
    pendingMonthsCount: number;
  };
}
