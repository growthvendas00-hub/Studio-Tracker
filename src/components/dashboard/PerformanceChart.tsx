import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currencyShort } from "@/lib/utils";
import type { ChartPoint } from "./data";

interface PerformanceChartProps {
  data: ChartPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="retornoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-muted-foreground)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="dia"
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "var(--shadow-card)",
          }}
          formatter={(value: number, name) => [
            currencyShort(value),
            name === "retorno" ? "Retorno" : "Investido",
          ]}
        />
        <Area
          type="monotone"
          dataKey="investido"
          stroke="var(--color-muted-foreground)"
          strokeWidth={2}
          fill="url(#invGrad)"
        />
        <Area
          type="monotone"
          dataKey="retorno"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#retornoGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
