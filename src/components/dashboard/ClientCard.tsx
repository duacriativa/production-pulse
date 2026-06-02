import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { Client, STATUS_VAR, edgeColor } from "@/lib/dashboard-data";

type Props = { client: Client; index: number; weekDays: string[]; weekDates: string[] };

export function ClientCard({ client, index, weekDays, weekDates }: Props) {
  const edge = edgeColor(client.progress);
  const critical = client.progress <= 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="glass-card rounded-2xl p-5 tv:p-7 relative overflow-hidden flex flex-col"
      style={{
        borderTop: `4px solid ${edge}`,
        boxShadow: `0 0 0 1px color-mix(in oklab, ${edge} 25%, transparent), 0 0 24px -6px color-mix(in oklab, ${edge} ${critical ? 55 : 30}%, transparent), 0 18px 36px -22px color-mix(in oklab, black 70%, transparent)`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${edge}, transparent)` }}
      />

      {/* Header: name + progress % */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-[1.15rem] tv:text-2xl leading-tight tracking-tight text-foreground truncate">
          {client.name}
        </h3>
        <div
          className="text-3xl tv:text-4xl font-black tabular-nums leading-none shrink-0"
          style={{ color: edge }}
        >
          {client.progress}%
        </div>
      </div>

      {/* Idle badge */}
      {client.idleDays > 0 && (
        <div
          className="mt-3 self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] tv:text-sm font-bold uppercase tracking-wider"
          style={{
            background: `color-mix(in oklab, ${client.idleDays >= 5 ? "var(--edge-red)" : "var(--edge-orange)"} 22%, transparent)`,
            color: client.idleDays >= 5 ? "var(--edge-red)" : "var(--edge-orange)",
            border: `1px solid color-mix(in oklab, ${client.idleDays >= 5 ? "var(--edge-red)" : "var(--edge-orange)"} 50%, transparent)`,
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 tv:w-4 tv:h-4 pulse-dot" />
          Parado há {client.idleDays} {client.idleDays === 1 ? "dia" : "dias"}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4 h-2 tv:h-2.5 rounded-full overflow-hidden bg-muted/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${client.progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${edge}, color-mix(in oklab, ${edge} 55%, white))` }}
        />
      </div>

      {/* Timeline — pills compactas com data + dia da semana */}
      <div className="mt-5 tv:mt-6 flex flex-wrap gap-1.5 tv:gap-2">
        {client.week.map((s, i) => {
          const isIdle = s === "idle";
          const isDone = s === "done";
          return (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 tv:px-3 py-1.5 tv:py-2 rounded-lg text-[12px] tv:text-sm font-bold tabular-nums leading-none"
              style={{
                background: isIdle
                  ? "color-mix(in oklab, var(--muted) 60%, transparent)"
                  : `color-mix(in oklab, ${STATUS_VAR[s]} 22%, transparent)`,
                border: `1.5px solid color-mix(in oklab, ${STATUS_VAR[s]} ${isIdle ? 25 : 65}%, transparent)`,
                color: isIdle ? "var(--muted-foreground)" : STATUS_VAR[s],
                boxShadow: !isIdle
                  ? `0 0 12px -4px color-mix(in oklab, ${STATUS_VAR[s]} 50%, transparent)`
                  : undefined,
              }}
            >
              <span>{weekDates[i]}</span>
              <span className="text-[10px] tv:text-xs opacity-80 uppercase">{weekDays[i].toLowerCase()}</span>
              {isDone && <Check className="w-3 h-3 tv:w-3.5 tv:h-3.5 -mr-0.5" strokeWidth={3} />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
