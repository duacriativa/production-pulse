import type { Client, Status } from "../dashboard-data";
import { CLIENTS, WEEK_DAYS, WEEK_DATES } from "../dashboard-data";

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

export type { Status };

type Snapshot = {
  generatedAt: string;
  week: { days: string[]; dates: string[] };
  clients: Array<{
    name: string;
    owner: string;
    progress: number;
    idleDays: number;
    week: Status[];
  }>;
};

function buildPayload(
  clients: Client[],
  weekDays: string[],
  weekDates: string[],
): DashboardPayload {
  const total = clients.length * 12; // estimativa de demandas por cliente/mês
  const delivered = clients.reduce(
    (acc, c) => acc + c.week.filter((s) => s === "done").length,
    0,
  );
  const pending = Math.max(0, total - delivered);
  const progress = total ? Math.round((delivered / total) * 100) : 0;

  const todayIdx = new Date().getDay(); // 0=dom
  // mapa: dashboard começa em TER → indices 0..6 = ter,qua,qui,sex,sab,dom,seg
  const dayMap = [5, 6, 0, 1, 2, 3, 4]; // dom,seg,ter,qua,qui,sex,sab → posição na semana
  const colIdx = dayMap[todayIdx];

  const todayDeliveries = clients.filter((c) => c.week[colIdx] === "done").length;
  const todayApprovals = clients.filter((c) => c.week[colIdx] === "approval").length;
  const todayAwaiting = clients.filter((c) => c.week[colIdx] === "planning").length;

  const deliveries = clients
    .filter((c) => c.week[colIdx] === "design" || c.week[colIdx] === "approval")
    .slice(0, 6)
    .map((c) => ({ client: c.name }));

  return {
    clients,
    kpis: { total, delivered, pending, progress },
    todayProduction: {
      deliveries: todayDeliveries,
      approvals: todayApprovals,
      awaiting: todayAwaiting,
    },
    deliveries,
    weekDays,
    weekDates,
    weekStart: weekDates[0] ?? "",
    weekEnd: weekDates[6] ?? "",
  };
}

export async function getDashboardData(_weekOffset = 0): Promise<DashboardPayload> {
  try {
    const res = await fetch(`/data/clients.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const snap = (await res.json()) as Snapshot;
      return buildPayload(snap.clients, snap.week.days, snap.week.dates);
    }
  } catch {
    // cai no fallback abaixo
  }
  // Fallback: mock local enquanto o sync do ClickUp não roda
  return buildPayload(CLIENTS, WEEK_DAYS, WEEK_DATES);
}
