import dayjs from "dayjs";
import type { Employee, Transaction, TransactionFlag } from "../types";

const INDIAN_HOLIDAYS = ["2026-01-26", "2026-08-15", "2026-10-02"];

export const isHoliday = (date: string) => INDIAN_HOLIDAYS.includes(dayjs(date).format("YYYY-MM-DD"));

export const detectFraudFlags = (
  tx: Transaction,
  allTransactions: Transaction[],
  employees: Employee[],
): TransactionFlag[] => {
  const flags: TransactionFlag[] = [];
  const employee = employees.find((item) => item.id === tx.employeeId);
  const txTime = dayjs(tx.dateTime);

  if (!tx.hasMatchingAllpayRecord) {
    flags.push({
      id: `${tx.id}-no-match`,
      rule: "No matching transaction",
      reason: "No matching transaction",
      details: "Reimbursement claimed for transaction not present in allpay records.",
    });
  }

  if (tx.claimedAmount !== tx.amount) {
    flags.push({
      id: `${tx.id}-amount-mismatch`,
      rule: "Amount Mismatch",
      reason: "Amount Mismatch",
      details: `Claimed Rs.${tx.claimedAmount} differs from captured Rs.${tx.amount}.`,
    });
  }

  if (tx.category !== tx.purposeCategory) {
    flags.push({
      id: `${tx.id}-category-mismatch`,
      rule: "Category Mismatch",
      reason: "Category Mismatch",
      details: `Merchant MCC category ${tx.category} conflicts with purpose ${tx.purposeCategory}.`,
    });
  }

  const duplicate = allTransactions.find((item) => {
    if (item.id === tx.id) return false;
    if (item.employeeId !== tx.employeeId || item.merchantName !== tx.merchantName || item.amount !== tx.amount) {
      return false;
    }
    const diff = Math.abs(dayjs(item.dateTime).diff(txTime, "minute"));
    return diff <= 120;
  });

  if (duplicate) {
    flags.push({
      id: `${tx.id}-duplicate`,
      rule: "Duplicate Suspect",
      reason: "Duplicate Suspect",
      details: `Same merchant and amount appears within 2 hours (${duplicate.id}).`,
    });
  }

  const isWeekend = txTime.day() === 0 || txTime.day() === 6;
  if ((isWeekend || isHoliday(tx.dateTime)) && !employee?.travelApproved) {
    flags.push({
      id: `${tx.id}-timing`,
      rule: "Off-policy Timing",
      reason: "Off-policy Timing",
      details: "Weekend or holiday spend without approved travel request.",
    });
  }

  return flags;
};
