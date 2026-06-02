export type Status = "done" | "design" | "approval" | "planning" | "idle";

export const STATUS_LABEL: Record<Status, string> = {
  done: "Concluído",
  design: "Design",
  approval: "Aprovação",
  planning: "Planejamento",
  idle: "Sem conteúdo",
};

export const STATUS_VAR: Record<Status, string> = {
  done: "var(--status-done)",
  design: "var(--status-design)",
  approval: "var(--status-approval)",
  planning: "var(--status-planning)",
  idle: "var(--status-idle)",
};

export const WEEK_DAYS = ["TER", "QUA", "QUI", "SEX", "SAB", "DOM", "SEG"];
export const WEEK_DATES = ["02/06", "03/06", "04/06", "05/06", "06/06", "07/06", "08/06"];

export type Client = {
  name: string;
  owner: string;
  progress: number;
  idleDays: number;
  week: Status[];
};

export const CLIENTS: Client[] = [
  { name: "Mysla.br", owner: "Ana C.", progress: 0, idleDays: 5, week: ["idle","idle","idle","idle","idle","idle","idle"] },
  { name: "Eloah Studio", owner: "Bruno L.", progress: 8, idleDays: 3, week: ["planning","idle","idle","idle","idle","idle","idle"] },
  { name: "Naromo", owner: "Carla M.", progress: 12, idleDays: 4, week: ["planning","planning","idle","idle","idle","idle","idle"] },
  { name: "Mandi Café", owner: "Diego P.", progress: 18, idleDays: 2, week: ["design","planning","idle","idle","idle","idle","idle"] },
  { name: "Vértice Arq.", owner: "Elisa R.", progress: 22, idleDays: 1, week: ["done","design","planning","idle","idle","idle","idle"] },
  { name: "Casa Tinta", owner: "Felipe S.", progress: 28, idleDays: 0, week: ["done","design","planning","idle","idle","idle","idle"] },
  { name: "Norte Calçados", owner: "Gabi T.", progress: 34, idleDays: 1, week: ["done","done","design","planning","idle","idle","idle"] },
  { name: "Orla Beach", owner: "Hugo V.", progress: 38, idleDays: 0, week: ["done","done","approval","design","idle","idle","idle"] },
  { name: "Plenitude SPA", owner: "Iara W.", progress: 44, idleDays: 0, week: ["done","done","approval","design","planning","idle","idle"] },
  { name: "Quintal Bistrô", owner: "João X.", progress: 51, idleDays: 0, week: ["done","done","done","approval","design","idle","idle"] },
  { name: "Solare Joias", owner: "Karla Y.", progress: 56, idleDays: 0, week: ["done","done","done","approval","design","planning","idle"] },
  { name: "Trilha Outdoor", owner: "Lucas Z.", progress: 63, idleDays: 0, week: ["done","done","done","done","approval","design","idle"] },
  { name: "Urbe Imóveis", owner: "Marina A.", progress: 71, idleDays: 0, week: ["done","done","done","done","approval","design","planning"] },
  { name: "Vento Sul", owner: "Nina B.", progress: 78, idleDays: 0, week: ["done","done","done","done","done","approval","design"] },
  { name: "Xeque Fitness", owner: "Otávio C.", progress: 85, idleDays: 0, week: ["done","done","done","done","done","approval","design"] },
  { name: "Zenith Wines", owner: "Paula D.", progress: 94, idleDays: 0, week: ["done","done","done","done","done","done","approval"] },
];

export function sortClients(list: Client[]): Client[] {
  const bucket = (p: number) => (p < 20 ? 0 : p <= 60 ? 1 : 2);
  return [...list].sort((a, b) => {
    const ba = bucket(a.progress);
    const bb = bucket(b.progress);
    if (ba !== bb) return ba - bb;
    if (b.idleDays !== a.idleDays) return b.idleDays - a.idleDays;
    return a.progress - b.progress;
  });
}

export function edgeColor(progress: number): string {
  if (progress <= 15) return "var(--edge-red)";
  if (progress <= 40) return "var(--edge-orange)";
  return "var(--edge-green)";
}

export const DELIVERIES = [
  { time: "09:00", client: "Eloah" },
  { time: "11:00", client: "Naromo" },
  { time: "14:00", client: "Mandi" },
  { time: "16:00", client: "Mysla" },
];

export const TODAY_PRODUCTION = {
  deliveries: 17,
  approvals: 6,
  awaiting: 3,
};

export const KPIS = {
  total: 188,
  delivered: 41,
  pending: 147,
  progress: 22,
};
