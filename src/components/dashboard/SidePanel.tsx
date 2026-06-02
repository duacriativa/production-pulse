import { motion } from "framer-motion";
import { Activity, Clock, AlertCircle, Palette, AlertTriangle } from "lucide-react";
import { DELIVERIES, TODAY_PRODUCTION, STATUS_LABEL, STATUS_VAR, Status } from "@/lib/dashboard-data";

const ALERTS = [
  { text: "3 clientes abaixo de 15%", tone: "var(--edge-red)" },
  { text: "147 tarefas pendentes", tone: "var(--status-design)" },
  { text: "4 conteúdos aguardando aprovação", tone: "var(--status-approval)" },
  { text: "2 clientes parados há +5 dias", tone: "var(--edge-orange)" },
];

function Section({ title, icon: Icon, children, delay = 0, badge }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="glass-card rounded-2xl p-5 tv:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 tv:w-10 tv:h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 tv:w-5 tv:h-5 text-primary" />
        </div>
        <h3 className="text-xs tv:text-sm font-bold tracking-[0.18em] uppercase text-muted-foreground">{title}</h3>
        {badge !== undefined && (
          <span
            className="ml-auto px-2 py-0.5 rounded-md text-[11px] tv:text-sm font-black tabular-nums"
            style={{
              background: "color-mix(in oklab, var(--edge-red) 22%, transparent)",
              color: "var(--edge-red)",
              border: "1px solid color-mix(in oklab, var(--edge-red) 50%, transparent)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export function SidePanel() {
  return (
    <aside className="flex flex-col gap-4">
      <Section title="Produção Hoje" icon={Activity} delay={0.05}>
        <div className="space-y-3">
          <Row label="Entregas" value={TODAY_PRODUCTION.deliveries} color="var(--status-done)" />
          <Row label="Aprovações" value={TODAY_PRODUCTION.approvals} color="var(--status-approval)" />
          <Row label="Aguardando cliente" value={TODAY_PRODUCTION.awaiting} color="var(--status-design)" />
        </div>
      </Section>

      <Section title="Entregas do Dia" icon={Clock} delay={0.1}>
        <div className="space-y-2.5">
          {DELIVERIES.map((d) => (
            <div key={d.time} className="flex items-center gap-3 p-2.5 tv:p-3 rounded-xl bg-muted/40 border border-border">
              <div className="text-base tv:text-xl font-bold tabular-nums text-primary w-14">{d.time}</div>
              <div className="text-sm tv:text-lg font-medium text-foreground">{d.client}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Alertas" icon={AlertCircle} delay={0.15} badge={ALERTS.length}>
        <div className="space-y-2">
          {ALERTS.map((a) => (
            <div
              key={a.text}
              className="flex items-center gap-2 p-2.5 tv:p-3 rounded-xl text-sm tv:text-base"
              style={{
                background: `color-mix(in oklab, ${a.tone} 14%, transparent)`,
                border: `1px solid color-mix(in oklab, ${a.tone} 35%, transparent)`,
                color: a.tone,
              }}
            >
              <AlertTriangle className="w-4 h-4 tv:w-5 tv:h-5 shrink-0 pulse-dot" />
              <span className="font-semibold leading-tight">{a.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Legenda Rápida" icon={Palette} delay={0.2}>
        <div className="space-y-2">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <div key={s} className="flex items-center gap-2.5 text-sm tv:text-base">
              <span
                className="w-4 h-4 rounded-md border"
                style={{
                  background: `color-mix(in oklab, ${STATUS_VAR[s]} 40%, transparent)`,
                  borderColor: `color-mix(in oklab, ${STATUS_VAR[s]} 60%, transparent)`,
                }}
              />
              <span className="text-foreground/80">{STATUS_LABEL[s]}</span>
            </div>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-sm tv:text-base text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl tv:text-3xl font-black tabular-nums text-foreground">{value}</span>
    </div>
  );
}
