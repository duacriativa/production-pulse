import type { Client, Status } from "../dashboard-data";

export type DashboardPayload = {
  clients: Client[];
  kpis: { total: number; delivered: number; pending: number; progress: number };
  todayProduction: { deliveries: number; approvals: number; awaiting: number };
  deliveries: { client: string }[];
  weekDays: string[];
  weekDates: string[];
  weekStart: string;
  weekEnd: string;
};

// Re-export Status so consumers don't need to import from dashboard-data
export type { Status };

export async function getDashboardData(weekOffset = 0): Promise<DashboardPayload> {
  const res = await fetch(`/api/dashboard?weekOffset=${weekOffset}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? "Erro ao carregar dados do ClickUp");
  }
  return res.json() as Promise<DashboardPayload>;
}
