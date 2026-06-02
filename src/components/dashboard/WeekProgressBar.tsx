import { motion } from "framer-motion";
import { KPIS } from "@/lib/dashboard-data";

export function WeekProgressBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-5 tv:p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tv:text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground">
          Progresso Geral da Semana
        </span>
        <span className="text-2xl tv:text-3xl font-black tabular-nums text-foreground">
          {KPIS.delivered}<span className="text-muted-foreground font-bold text-base tv:text-lg">/{KPIS.total}</span>
          <span className="ml-3 text-primary">{KPIS.progress}%</span>
        </span>
      </div>
      <div className="h-3 tv:h-4 rounded-full overflow-hidden bg-muted/60 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${KPIS.progress}%` }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
          className="h-full rounded-full relative"
          style={{
            background: "linear-gradient(90deg, var(--primary), var(--status-approval))",
            boxShadow: "0 0 20px -2px color-mix(in oklab, var(--primary) 70%, transparent)",
          }}
        >
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%)] bg-[length:14px_14px]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
