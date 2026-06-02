import { STATUS_LABEL, STATUS_VAR, Status } from "@/lib/dashboard-data";

export function Legend() {
  const items = Object.keys(STATUS_LABEL) as Status[];
  return (
    <div className="glass-card rounded-2xl px-4 py-3 mb-4 flex items-center gap-6 flex-wrap">
      <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
        Guia Visual
      </span>
      {items.map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-md"
            style={{
              background: `color-mix(in oklab, ${STATUS_VAR[s]} 38%, transparent)`,
              border: `1px solid color-mix(in oklab, ${STATUS_VAR[s]} 60%, transparent)`,
            }}
          />
          <span className="text-sm text-foreground/80">{STATUS_LABEL[s]}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-4 text-xs">
        <EdgeChip color="var(--edge-red)" label="0–15%" />
        <EdgeChip color="var(--edge-orange)" label="16–40%" />
        <EdgeChip color="var(--edge-green)" label="41–100%" />
      </div>
    </div>
  );
}

function EdgeChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 h-1 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground tabular-nums">{label}</span>
    </div>
  );
}
