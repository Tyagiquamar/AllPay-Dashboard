import dayjs from "dayjs";
import { alertConfigSeed, adminsSeed, billingSeed, employeesSeed, policySeed, transactionsSeed } from "../data/mockData";
import type {
  AdminUser,
  AlertConfig,
  BillingPlan,
  Employee,
  ExpensePolicy,
  ExportAudit,
  Transaction,
} from "../types";

interface BootstrapPayload {
  transactions: Transaction[];
  employees: Employee[];
  policies: ExpensePolicy[];
  alertsConfig: AlertConfig;
  admins: AdminUser[];
  billing: BillingPlan;
  exportAudits: ExportAudit[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const MOCK_DELAY = 220;

const delay = <T,>(data: T) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });

const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  if (!API_BASE) {
    throw new Error("No API base configured.");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return (await res.json()) as T;
};

export const adminApi = {
  async bootstrap(): Promise<BootstrapPayload> {
    if (!API_BASE) {
      return delay({
        transactions: transactionsSeed,
        employees: employeesSeed,
        policies: policySeed,
        alertsConfig: alertConfigSeed,
        admins: adminsSeed,
        billing: billingSeed,
        exportAudits: [],
      });
    }
    return request<BootstrapPayload>("/admin/bootstrap");
  },

  async approveTransaction(transactionId: string, amount: number) {
    if (!API_BASE) return delay({ ok: true, transactionId, amount, processedAt: dayjs().toISOString() });
    return request("/admin/transactions/approve", {
      method: "POST",
      body: JSON.stringify({ transactionId, amount }),
    });
  },

  async rejectTransaction(transactionId: string, reason: string) {
    if (!API_BASE) return delay({ ok: true, transactionId, reason, processedAt: dayjs().toISOString() });
    return request("/admin/transactions/reject", {
      method: "POST",
      body: JSON.stringify({ transactionId, reason }),
    });
  },

  async bulkDecision(ids: string[], decision: "approved" | "rejected", reason?: string) {
    if (!API_BASE) return delay({ ok: true, ids, decision, reason, processedAt: dayjs().toISOString() });
    return request("/admin/transactions/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, decision, reason }),
    });
  },

  async createPolicy(policy: ExpensePolicy) {
    if (!API_BASE) return delay({ ok: true, policy });
    return request("/admin/policies", { method: "POST", body: JSON.stringify(policy) });
  },

  async importEmployees(csvText: string) {
    if (!API_BASE) return delay({ ok: true, csvText });
    return request("/admin/employees/import", { method: "POST", body: JSON.stringify({ csvText }) });
  },

  async inviteEmployee(email: string, department: string) {
    if (!API_BASE) return delay({ ok: true, email, department });
    return request("/admin/employees/invite", { method: "POST", body: JSON.stringify({ email, department }) });
  },

  async updateAlerts(config: Partial<AlertConfig>) {
    if (!API_BASE) return delay({ ok: true, config });
    return request("/admin/alerts", { method: "PATCH", body: JSON.stringify(config) });
  },

  async updateBillingPlan(plan: BillingPlan["plan"]) {
    if (!API_BASE) return delay({ ok: true, plan });
    return request("/admin/billing", { method: "PATCH", body: JSON.stringify({ plan }) });
  },

  async upsertAdmin(admin: AdminUser) {
    if (!API_BASE) return delay({ ok: true, admin });
    return request("/admin/users", { method: "PUT", body: JSON.stringify(admin) });
  },

  async toggleAdmin(id: string) {
    if (!API_BASE) return delay({ ok: true, id });
    return request(`/admin/users/${id}/toggle`, { method: "POST" });
  },

  async recordExport(payload: { format: "csv" | "pdf"; dateRange: string; recordCount: number }) {
    if (!API_BASE) return delay({ ok: true, payload });
    return request("/admin/exports", { method: "POST", body: JSON.stringify(payload) });
  },
};
