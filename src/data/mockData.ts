import dayjs from "dayjs";
import type { AdminUser, AlertConfig, BillingPlan, Employee, ExpensePolicy, Transaction } from "../types";
import { detectFraudFlags } from "../utils/fraud";

const departments = ["Engineering", "Sales", "Marketing", "Operations", "HR", "Finance"];
const merchants = [
  { name: "Indian Oil", mcc: "5541", category: "Fuel" },
  { name: "Uber", mcc: "4121", category: "Travel" },
  { name: "IRCTC", mcc: "4112", category: "Travel" },
  { name: "Swiggy", mcc: "5812", category: "Meals" },
  { name: "Amazon Business", mcc: "5942", category: "Office Supplies" },
  { name: "Hotel Bloom", mcc: "7011", category: "Lodging" },
  { name: "The Brew Bar", mcc: "5813", category: "Bars/Alcohol" },
];

export const employeesSeed: Employee[] = Array.from({ length: 24 }, (_, index) => ({
  id: `EMP-${1000 + index}`,
  name: `Employee ${index + 1}`,
  email: `employee${index + 1}@allpay.in`,
  department: departments[index % departments.length],
  role: index % 5 === 0 ? "manager" : "employee",
  active: index % 11 !== 0,
  onboarded: index % 7 !== 0,
  travelApproved: index % 4 === 0,
}));

const createTimeline = (date: string) => [
  { id: `${date}-1`, actor: "system", action: "Transaction captured", timestamp: dayjs(date).subtract(12, "minute").toISOString() },
  { id: `${date}-2`, actor: "employee", action: "Submitted for reimbursement", timestamp: dayjs(date).subtract(10, "minute").toISOString() },
];

const createTransaction = (index: number): Transaction => {
  const employee = employeesSeed[index % employeesSeed.length];
  const merchant = merchants[index % merchants.length];
  const date = dayjs().subtract(index * 37, "minute");
  const amount = 350 + ((index * 137) % 5000);
  const claimedAmount = index % 8 === 0 ? amount + 120 : amount;

  return {
    id: `TX-${70000 + index}`,
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    merchantName: merchant.name,
    mcc: merchant.mcc,
    category: merchant.category,
    amount,
    claimedAmount,
    dateTime: date.toISOString(),
    status: "pending",
    upiApp: (["GPay", "PhonePe", "Paytm", "BHIM"] as const)[index % 4],
    upiRefId: `UPI${Date.now().toString().slice(-5)}${index.toString().padStart(3, "0")}`,
    isNew: index < 5,
    flags: [],
    receiptUrl: "https://dummyimage.com/420x300/e9efff/1f2a4f&text=Receipt",
    hasMatchingAllpayRecord: index % 9 !== 0,
    purposeCategory: index % 6 === 0 ? "Client Entertainment" : merchant.category,
    timeline: createTimeline(date.toISOString()),
  };
};

const seedTransactionsBase = Array.from({ length: 130 }, (_, index) => createTransaction(index));
export const transactionsSeed: Transaction[] = seedTransactionsBase.map((tx) => {
  const flags = detectFraudFlags(tx, seedTransactionsBase, employeesSeed);
  const status = flags.length ? "flagged" : "pending";
  return { ...tx, flags, status };
});

export const policySeed: ExpensePolicy[] = [
  {
    id: "POL-1",
    name: "Fuel max Rs.3000/month",
    mccCategory: "Fuel",
    maxPerTransaction: 1500,
    maxPerMonth: 3000,
    allowedDays: [1, 2, 3, 4, 5],
    scopeType: "all",
    startDate: dayjs().subtract(3, "month").format("YYYY-MM-DD"),
    active: true,
  },
  {
    id: "POL-2",
    name: "No Bars and Alcohol",
    mccCategory: "Bars/Alcohol",
    maxPerTransaction: 0,
    maxPerMonth: 0,
    allowedDays: [1, 2, 3, 4, 5],
    scopeType: "all",
    startDate: dayjs().subtract(2, "month").format("YYYY-MM-DD"),
    active: true,
  },
  {
    id: "POL-3",
    name: "Travel weekday cap Rs.10000",
    mccCategory: "Travel",
    maxPerTransaction: 10000,
    maxPerMonth: 50000,
    allowedDays: [1, 2, 3, 4, 5],
    scopeType: "department",
    scopeValue: "Sales",
    startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    active: true,
  },
];

export const adminsSeed: AdminUser[] = [
  { id: "ADM-1", name: "Riya Nair", email: "riya@allpay.in", role: "super_admin", active: true, twoFactor: true },
  { id: "ADM-2", name: "Aman Sharma", email: "aman@allpay.in", role: "finance_manager", active: true, twoFactor: true },
  { id: "ADM-3", name: "Neha Singh", email: "neha@allpay.in", role: "hr_manager", active: true, twoFactor: true },
  { id: "ADM-4", name: "Audit Bot", email: "audit@allpay.in", role: "auditor", active: true, twoFactor: true },
];

export const alertConfigSeed: AlertConfig = {
  delivery: "both",
  threshold: "daily_digest",
  mutedPolicies: [],
  mutedEmployees: [],
};

export const billingSeed: BillingPlan = {
  plan: "Pro",
  billingCycle: "monthly",
  nextRenewal: dayjs().add(11, "day").format("YYYY-MM-DD"),
  licenses: 25,
  headcount: 24,
};
