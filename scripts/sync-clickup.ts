/**
 * Sync ClickUp → public/data/clients.json
 *
 * Lê todas as Lists do Folder "Criação" dentro do Space "[Geral] Dua Criativa"
 * no Team 9013166822 e gera um snapshot consumido pelo dashboard.
 *
 * Roda no GitHub Actions de 5 em 5 min. Token vem de process.env.CLICKUP_TOKEN.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const TEAM_ID = "9013166822";
const SPACE_NAME = "[Geral] Dua Criativa";
const FOLDER_NAME = "Criação";
const OUTPUT_PATH = "public/data/clients.json";

const TOKEN = process.env.CLICKUP_TOKEN;
if (!TOKEN) {
  console.error("Missing CLICKUP_TOKEN env var");
  process.exit(1);
}

type Status = "done" | "design" | "approval" | "planning" | "idle";

type ClickUpList = { id: string; name: string };
type ClickUpFolder = { id: string; name: string; lists: ClickUpList[] };
type ClickUpSpace = { id: string; name: string };
type ClickUpTask = {
  id: string;
  name: string;
  status: { status: string; type?: string };
  due_date: string | null;
  date_updated: string | null;
  date_closed: string | null;
  assignees: { username?: string; initials?: string }[];
};

async function cu<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    headers: { Authorization: TOKEN! },
  });
  if (!res.ok) {
    throw new Error(`ClickUp ${path} → ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function mapStatus(raw: string): Status {
  const s = raw.toLowerCase().trim();
  if (/(conclu|complet|done|entregue|finaliz)/.test(s)) return "done";
  if (/(design|criação|criando|criacao)/.test(s)) return "design";
  if (/(revis|aprov|approval|review)/.test(s)) return "approval";
  if (/(planej|planning|datas|brief|backlog|to ?do)/.test(s)) return "planning";
  return "idle";
}

// Semana TER → SEG (formato do dashboard)
function buildWeek(): { days: string[]; dates: string[]; iso: string[] } {
  const now = new Date();
  // Encontra a terça-feira da semana atual (ou anterior se hoje for seg)
  const day = now.getDay(); // 0=dom 1=seg 2=ter...
  const offsetToTue = (day + 5) % 7 === 0 ? 0 : -((day + 5) % 7); // ajuste pra TER
  // simplificação: pega TER mais próxima passada
  const diffToTue = day >= 2 ? day - 2 : 7 - (2 - day);
  const tuesday = new Date(now);
  tuesday.setDate(now.getDate() - diffToTue);
  tuesday.setHours(0, 0, 0, 0);

  const labels = ["TER", "QUA", "QUI", "SEX", "SAB", "DOM", "SEG"];
  const dates: string[] = [];
  const iso: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(tuesday);
    d.setDate(tuesday.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    dates.push(`${dd}/${mm}`);
    iso.push(d.toISOString().slice(0, 10));
  }
  return { days: labels, dates, iso };
}

const week = buildWeek();

async function main() {
  console.log("→ Listando spaces…");
  const { spaces } = await cu<{ spaces: ClickUpSpace[] }>(
    `/team/${TEAM_ID}/space?archived=false`,
  );
  const space = spaces.find((s) => s.name.trim() === SPACE_NAME);
  if (!space) throw new Error(`Space "${SPACE_NAME}" não encontrado`);

  console.log(`→ Listando folders do space ${space.name}…`);
  const { folders } = await cu<{ folders: ClickUpFolder[] }>(
    `/space/${space.id}/folder?archived=false`,
  );
  const folder = folders.find((f) => f.name.trim() === FOLDER_NAME);
  if (!folder) throw new Error(`Folder "${FOLDER_NAME}" não encontrado`);

  const lists = folder.lists.filter(
    (l) => !/template/i.test(l.name) && !/ex-clientes/i.test(l.name),
  );
  console.log(`→ ${lists.length} lists (clientes) encontrados.`);

  const clients = [];

  for (const list of lists) {
    const { tasks } = await cu<{ tasks: ClickUpTask[] }>(
      `/list/${list.id}/task?archived=false&subtasks=true&include_closed=true&page=0`,
    );

    const total = tasks.length || 1;
    const doneCount = tasks.filter(
      (t) => t.status?.type === "closed" || mapStatus(t.status?.status || "") === "done",
    ).length;
    const progress = Math.round((doneCount / total) * 100);

    // idleDays = dias desde a última atividade
    const lastUpdate = tasks.reduce<number>((acc, t) => {
      const ts = Number(t.date_updated || t.date_closed || 0);
      return ts > acc ? ts : acc;
    }, 0);
    const idleDays = lastUpdate
      ? Math.max(0, Math.floor((Date.now() - lastUpdate) / 86_400_000))
      : 99;

    // Distribui tasks na semana pelo due_date
    const weekStatuses: Status[] = Array(7).fill("idle");
    for (const t of tasks) {
      if (!t.due_date) continue;
      const d = new Date(Number(t.due_date)).toISOString().slice(0, 10);
      const idx = week.iso.indexOf(d);
      if (idx === -1) continue;
      const s = mapStatus(t.status?.status || "");
      // prioridade: done > approval > design > planning > idle
      const rank: Record<Status, number> = { done: 4, approval: 3, design: 2, planning: 1, idle: 0 };
      if (rank[s] > rank[weekStatuses[idx]]) weekStatuses[idx] = s;
    }

    // Owner = primeiro assignee mais frequente
    const ownerCount = new Map<string, number>();
    for (const t of tasks) {
      for (const a of t.assignees || []) {
        const name = a.username || a.initials || "";
        if (!name) continue;
        ownerCount.set(name, (ownerCount.get(name) || 0) + 1);
      }
    }
    const owner =
      [...ownerCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    clients.push({
      name: list.name,
      owner,
      progress,
      idleDays,
      week: weekStatuses,
      _meta: { listId: list.id, taskCount: total, doneCount },
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    week: { days: week.days, dates: week.dates },
    clients,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`✓ ${OUTPUT_PATH} (${clients.length} clientes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
