import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  tvMode: boolean;
  onToggleTv: () => void;
  lastUpdate: Date;
  syncing: boolean;
};

export function Header({ theme, onToggleTheme, tvMode, onToggleTv, lastUpdate, syncing }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const updateLabel = syncing
    ? "Sincronizando..."
    : `Atualizado ${relativeTime(lastUpdate, now)}`;

  return (
    <header className="flex items-center justify-between gap-6 mb-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground font-black text-xl tracking-tight"
          style={{
            background: "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 60%, var(--status-approval)))",
            boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--primary) 60%, transparent)",
          }}>
          DUA
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
            PAINEL DE PRODUÇÃO
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral da semana</p>
        </div>
      </div>

      {/* Center: week selector */}
      <div className="glass-card rounded-2xl flex items-center gap-2 px-2 py-1.5">
        <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="px-3 text-sm font-semibold tabular-nums text-foreground">02/06 — 08/06</div>
        <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="glass-card rounded-2xl px-4 py-2 flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums leading-none text-foreground">
              {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
              <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
              <span>{updateLabel}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="glass-card rounded-2xl w-11 h-11 flex items-center justify-center text-foreground hover:text-primary transition-colors"
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleTv}
          className={`glass-card rounded-2xl h-11 px-4 flex items-center gap-2 text-sm font-semibold transition-colors ${
            tvMode ? "text-primary" : "text-foreground hover:text-primary"
          }`}
          style={tvMode ? { borderColor: "color-mix(in oklab, var(--primary) 50%, transparent)" } : undefined}
          title="Modo TV"
        >
          <Monitor className="w-4 h-4" />
          MODO TV
          <span
            className="ml-1 w-1.5 h-1.5 rounded-full"
            style={{ background: tvMode ? "var(--status-done)" : "var(--status-idle)" }}
          />
        </button>
      </div>
    </header>
  );
}

function relativeTime(then: Date, now: Date) {
  const s = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (s < 5) return "agora";
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  return `há ${m}min`;
}
