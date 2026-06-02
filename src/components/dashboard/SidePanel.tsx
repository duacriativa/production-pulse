import { motion } from "framer-motion";
import { Activity, Clock, AlertCircle, Palette } from "lucide-react";
import { DELIVERIES, TODAY_PRODUCTION, STATUS_LABEL, STATUS_VAR, Status } from "@/lib/dashboard-data";

function Section({ title, icon: Icon, children, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-muted-foreground">{title}</h3>
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
            <div key={d.time} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="text-sm font-bold tabular-nums text-primary w-12">{d.time}</div>
              <div className="text-sm font-medium text-foreground">{d.client}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Alertas" icon={AlertCircle} delay={0.15}>
        <div className="space-y-2">
          <Alert text="3 clientes com 0%" tone="var(--edge-red)" />
          <Alert text="Mysla parada há 5 dias" tone="var(--edge-orange)" />
          <Alert text="147 tarefas pendentes" tone="var(--status-design)" />
        </div>
      </Section>

      <Section title="Legenda Rápida" icon={Palette} delay={0.2}>
        <div className="space-y-2">
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <div key={s} className="flex items-center gap-2.5 text-sm">
              <span
                className="w-3.5 h-3.5 rounded-md border"
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
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Alert({ text, tone }: { text: string; tone: string }) {
  return (
    <div
      className="flex items-center gap-2 p-2.5 rounded-xl text-sm"
      style={{
        background: `color-mix(in oklab, ${tone} 12%, transparent)`,
        border: `1px solid color-mix(in oklab, ${tone} 30%, transparent)`,
        color: tone,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: tone }} />
      <span className="font-medium">{text}</span>
    </div>
  );
}
