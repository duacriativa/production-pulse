import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";
import type { Client, Status } from "../dashboard-data";

const FOLDER_ID = "901316459074"; // [Geral] Dua Criativa / Criação

const STATUS_PRIORITY: Record<Status, number> = {
  done: 4,
  approval: 3,
  design: 2,
  planning: 1,
  idle: 0,
};

function mapStatus(s: string): Status {
  const lower = s.toLowerCase().trim();
  if (["concluído", "concluido", "agendamento"].includes(lower)) return "done";
  if (["aprovação", "aprovacao", "em aprovação", "em aprovacao"].includes(lower)) return "approval";
  if (["design", "revisão", "revisao"].includes(lower)) return "design";
  if (["planejamento"].includes(lower)) return "planning";
  return "idle";
}

// Week starts on Tuesday (index 2), ends on Monday (index 1)
function getWeekRange(offset = 0): { weekStart: Date; weekEnd: Date; days: Date[] } {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon,2=Tue,...,6=Sat
  const daysBack = dow === 0 ? 5 : dow === 1 ? 6 : dow - 2;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysBack + offset * 7);
  weekStart.setHours(0, 0, 0, 0);

  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEnd = new Date(days[6]);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd, days };
}

interface RawTask {
  id: string;
  name: string;
  status: string;
  due_date: string | null;
  list: { id: string; name: string };
  url: string;
}

async function fetchWeekTasks(token: string, weekStart: Date, weekEnd: Date): Promise<RawTask[]> {
  const all: RawTask[] = [];
  let page = 0;

  while (true) {
    const url = new URL(`https://api.clickup.com/api/v2/folder/${FOLDER_ID}/task`);
    url.searchParams.set("include_closed", "true");
    url.searchParams.set("subtasks", "true");
    url.searchParams.set("due_date_gt", String(weekStart.getTime() - 1));
    url.searchParams.set("due_date_lt", String(weekEnd.getTime() + 1));
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), { headers: { Authorization: token } });
    if (!res.ok) break;

    const data = (await res.json()) as { tasks: RawTask[]; last_page?: boolean };
    all.push(...data.tasks);
    if (data.last_page || data.tasks.length === 0) break;
    page++;
  }

  return all;
}

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

export const getDashboardData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ weekOffset: z.number().int().optional() }).optional())
  .handler(async ({ data }): Promise<DashboardPayload> => {
    const token = process.env.CLICKUP_TOKEN;
    if (!token) throw new Error("CLICKUP_TOKEN não configurado");

    const offset = data?.weekOffset ?? 0;
    const { weekStart, weekEnd, days } = getWeekRange(offset);

    const raw = await fetchWeekTasks(token, weekStart, weekEnd);

    // Exclude templates and internal lists
    const tasks = raw.filter(
      (t) => !t.list.name.includes("[TEMPLATE]") && t.list.name.trim() !== "Dua Criativa",
    );

    // Group by client
    const byClient = new Map<string, RawTask[]>();
    for (const t of tasks) {
      const name = t.list.name.trim();
      if (!byClient.has(name)) byClient.set(name, []);
      byClient.get(name)!.push(t);
    }

    const clients: Client[] = [];

    for (const [name, clientTasks] of byClient) {
      // Status per day of the week (best status wins)
      const week: Status[] = days.map((day) => {
        const dayStr = day.toDateString();
        const dayTasks = clientTasks.filter(
          (t) => t.due_date && new Date(Number(t.due_date)).toDateString() === dayStr,
        );
        if (!dayTasks.length) return "idle";
        return dayTasks.reduce<Status>((best, t) => {
          const s = mapStatus(t.status);
          return STATUS_PRIORITY[s] > STATUS_PRIORITY[best] ? s : best;
        }, "idle");
      });

      // Progress
      const doneCount = clientTasks.filter((t) => mapStatus(t.status) === "done").length;
      const progress =
        clientTasks.length > 0 ? Math.round((doneCount / clientTasks.length) * 100) : 0;

      // idleDays: consecutive idle days counting back from today within this week
      const todayStr = new Date().toDateString();
      const todayIdx = days.findIndex((d) => d.toDateString() === todayStr);
      let idleDays = 0;
      if (todayIdx >= 0) {
        for (let i = todayIdx; i >= 0; i--) {
          if (week[i] !== "idle") break;
          idleDays++;
        }
      }

      clients.push({ name, owner: "", progress, idleDays, week });
    }

    // KPIs
    const total = tasks.length;
    const delivered = tasks.filter((t) => mapStatus(t.status) === "done").length;
    const pending = total - delivered;
    const progress = total > 0 ? Math.round((delivered / total) * 100) : 0;

    // Today's stats
    const todayStr = new Date().toDateString();
    const todayTasks = tasks.filter(
      (t) => t.due_date && new Date(Number(t.due_date)).toDateString() === todayStr,
    );
    const todayDeliveries = todayTasks.filter((t) => mapStatus(t.status) === "done").length;
    const todayApprovals = todayTasks.filter((t) => mapStatus(t.status) === "approval").length;
    const todayAwaiting = todayTasks.filter((t) =>
      ["planning", "idle"].includes(mapStatus(t.status)),
    ).length;

    // Clients with deliveries today
    const deliveryClients = [
      ...new Set(
        todayTasks
          .filter((t) => mapStatus(t.status) === "done")
          .map((t) => t.list.name.trim()),
      ),
    ];

    const DAY_NAMES = ["TER", "QUA", "QUI", "SEX", "SAB", "DOM", "SEG"];
    const weekDates = days.map(
      (d) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    );

    return {
      clients,
      kpis: { total, delivered, pending, progress },
      todayProduction: {
        deliveries: todayDeliveries,
        approvals: todayApprovals,
        awaiting: todayAwaiting,
      },
      deliveries: deliveryClients.map((c) => ({ client: c })),
      weekDays: DAY_NAMES,
      weekDates,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    };
  });
