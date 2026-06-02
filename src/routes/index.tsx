import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Kpis } from "@/components/dashboard/Kpis";
import { Legend } from "@/components/dashboard/Legend";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { SidePanel } from "@/components/dashboard/SidePanel";
import { CLIENTS, sortClients } from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DUA Criativa — Painel de Produção" },
      { name: "description", content: "Centro de operações visual da DUA Criativa para monitoramento em TV." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tvMode, setTvMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [syncing, setSyncing] = useState(false);

  // Init from localStorage
  useEffect(() => {
    const t = (localStorage.getItem("dua-theme") as "dark" | "light") || "dark";
    const tv = localStorage.getItem("dua-tv") === "1";
    setTheme(t);
    setTvMode(tv);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("dua-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dua-tv", tvMode ? "1" : "0");
  }, [tvMode]);

  // Auto refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      setSyncing(true);
      setTimeout(() => {
        setLastUpdate(new Date());
        setSyncing(false);
      }, 900);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => sortClients(CLIENTS), []);

  return (
    <div className={`ambient-bg min-h-screen ${tvMode ? "tv-mode" : ""}`}>
      <div className={`mx-auto ${tvMode ? "p-8 max-w-[1920px]" : "p-6 max-w-[1680px]"}`}>
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          tvMode={tvMode}
          onToggleTv={() => setTvMode((v) => !v)}
          lastUpdate={lastUpdate}
          syncing={syncing}
        />

        <Kpis />
        <Legend />

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className={`grid gap-4 ${tvMode ? "grid-cols-4" : "grid-cols-4"}`}>
            {sorted.map((c, i) => (
              <ClientCard key={c.name} client={c} index={i} />
            ))}
          </div>

          <SidePanel />
        </div>
      </div>
    </div>
  );
}
