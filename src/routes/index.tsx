import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Kpis } from "@/components/dashboard/Kpis";
import { Legend } from "@/components/dashboard/Legend";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { SidePanel } from "@/components/dashboard/SidePanel";
import { WeekProgressBar } from "@/components/dashboard/WeekProgressBar";
import { sortClients } from "@/lib/dashboard-data";
import { getDashboardData, type DashboardPayload } from "@/lib/api/clickup.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DUA Criativa — Painel de Produção" },
      { name: "description", content: "Centro de operações visual da DUA Criativa para monitoramento em TV." },
    ],
  }),
  component: Dashboard,
});

const EMPTY_PAYLOAD: DashboardPayload = {
  clients: [],
  kpis: { total: 0, delivered: 0, pending: 0, progress: 0 },
  todayProduction: { deliveries: 0, approvals: 0, awaiting: 0 },
  deliveries: [],
  weekDays: ["TER", "QUA", "QUI", "SEX", "SAB", "DOM", "SEG"],
  weekDates: ["--/--", "--/--", "--/--", "--/--", "--/--", "--/--", "--/--"],
  weekStart: "",
  weekEnd: "",
};

function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tvMode, setTvMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<DashboardPayload>(EMPTY_PAYLOAD);
  const [error, setError] = useState<string | null>(null);

  // Init from localStorage
  useEffect(() => {
    const t = (localStorage.getItem("dua-theme") as "dark" | "light") || "dark";
    const tv = localStorage.getItem("dua-tv") === "1";
    setTheme(t);
    setTvMode(tv);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("dua-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dua-tv", tvMode ? "1" : "0");
  }, [tvMode]);

  const fetchData = useCallback(async (offset: number) => {
    setSyncing(true);
    setError(null);
    try {
      const result = await getDashboardData(offset);
      setData(result);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setSyncing(false);
    }
  }, []);

  // Initial load + on week change
  useEffect(() => {
    fetchData(weekOffset);
  }, [fetchData, weekOffset]);

  // Auto refresh every 60s
  useEffect(() => {
    const id = setInterval(() => fetchData(weekOffset), 60_000);
    return () => clearInterval(id);
  }, [fetchData, weekOffset]);

  const sorted = useMemo(() => sortClients(data.clients), [data.clients]);

  const weekLabel = useMemo(() => {
    if (!data.weekDates[0] || data.weekDates[0] === "--/--") return "Carregando...";
    return `${data.weekDates[0]} — ${data.weekDates[6]}`;
  }, [data.weekDates]);

  return (
    <div className={`ambient-bg min-h-screen ${tvMode ? "tv-mode" : ""}`}>
      <div className={`mx-auto ${tvMode ? "p-4 sm:p-8 max-w-[1920px]" : "p-3 sm:p-6 max-w-[1680px]"}`}>
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          tvMode={tvMode}
          onToggleTv={() => setTvMode((v) => !v)}
          lastUpdate={lastUpdate}
          syncing={syncing}
          weekLabel={weekLabel}
          onPrevWeek={() => setWeekOffset((o) => o - 1)}
          onNextWeek={() => setWeekOffset((o) => o + 1)}
        />

        {error && (
          <div className="mb-4 p-3 sm:p-4 rounded-xl text-sm font-medium" style={{ background: "color-mix(in oklab, var(--edge-red) 15%, transparent)", color: "var(--edge-red)", border: "1px solid color-mix(in oklab, var(--edge-red) 40%, transparent)" }}>
            ⚠ {error}
          </div>
        )}

        <Kpis kpis={data.kpis} />
        <WeekProgressBar kpis={data.kpis} />
        <Legend />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] tv:grid-cols-[1fr_400px] gap-4 sm:gap-5 tv:gap-7">
          <div className="grid gap-3 sm:gap-4 tv:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((c, i) => (
              <ClientCard
                key={c.name}
                client={c}
                index={i}
                weekDays={data.weekDays}
                weekDates={data.weekDates}
              />
            ))}
            {sorted.length === 0 && !syncing && !error && (
              <div className="col-span-full text-center text-muted-foreground py-16">
                Nenhum cliente encontrado para esta semana.
              </div>
            )}
          </div>

          <SidePanel
            todayProduction={data.todayProduction}
            deliveries={data.deliveries}
            clients={data.clients}
          />
        </div>
      </div>
    </div>
  );
}
