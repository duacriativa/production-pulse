import { motion } from "framer-motion";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";

type KpisData = { total: number; delivered: number; pending: number; progress: number };

export function Kpis({ kpis }: { kpis: KpisData }) {
  const cards = [
    { label: "Total de Tarefas", value: kpis.total, icon: ListTodo, accent: "var(--primary)" },
    { label: "Entregues", value: kpis.delivered, icon: CheckCircle2, accent: "var(--status-done)" },
    { label: "Pendentes", value: kpis.pending, icon: Clock, accent: "var(--status-design)" },
    { label: "Progresso da Semana", value: `${kpis.progress}%`, icon: TrendingUp, accent: "var(--status-approval)", progress: kpis.progress },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden"
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ background: c.accent }}
          />
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
              {c.label}
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `color-mix(in oklab, ${c.accent} 18%, transparent)`,
                color: c.accent,
              }}
            >
              <c.icon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 text-3xl sm:text-5xl font-black tabular-nums tracking-tight text-foreground leading-none">
            {c.value}
          </div>
          {c.progress !== undefined && (
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.accent}, color-mix(in oklab, ${c.accent} 50%, white))` }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
