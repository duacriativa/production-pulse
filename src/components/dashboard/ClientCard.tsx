import { motion } from "framer-motion";
import { AlertTriangle, User } from "lucide-react";
import { Client, STATUS_VAR, WEEK_DAYS, WEEK_DATES, edgeColor } from "@/lib/dashboard-data";

export function ClientCard({ client, index }: { client: Client; index: number }) {
  const edge = edgeColor(client.progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="glass-card rounded-2xl p-4 relative overflow-hidden"
      style={{ borderTop: `3px solid ${edge}` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${edge}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-base leading-tight truncate text-foreground">
            {client.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate">{client.owner}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: edge }}
          >
            {client.progress}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-muted/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${client.progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${edge}, color-mix(in oklab, ${edge} 60%, white))` }}
        />
      </div>

      {/* Timeline */}
      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className="text-[10px] font-medium text-muted-foreground text-center tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {client.week.map((s, i) => (
            <div
              key={i}
              className="h-7 rounded-md flex items-center justify-center text-[9px] font-semibold tabular-nums"
              style={{
                background: `color-mix(in oklab, ${STATUS_VAR[s]} 28%, transparent)`,
                color: STATUS_VAR[s],
                border: `1px solid color-mix(in oklab, ${STATUS_VAR[s]} 40%, transparent)`,
              }}
              title={WEEK_DATES[i]}
            >
              {WEEK_DATES[i].slice(0, 2)}
            </div>
          ))}
        </div>
      </div>

      {/* Idle warning */}
      {client.idleDays > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--edge-orange)" }}>
          <AlertTriangle className="w-3.5 h-3.5 pulse-dot" />
          <span>{client.idleDays} dias sem movimentação</span>
        </div>
      )}
    </motion.div>
  );
}
