import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: number;
  tone?: "success" | "neutral" | "warning";
}

export function MetricCard({ icon: Icon, label, value, delta, tone = "neutral" }: MetricCardProps) {
  const positive = delta >= 0;
  const goodWhenUp = tone !== "neutral";
  const deltaClass = positive
    ? goodWhenUp
      ? "text-success bg-success/10"
      : "text-muted-foreground bg-muted"
    : "text-destructive bg-destructive/10";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${deltaClass}`}
        >
          {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {Math.abs(delta)}%
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium text-muted-foreground truncate">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground truncate">{value}</p>
    </div>
  );
}
