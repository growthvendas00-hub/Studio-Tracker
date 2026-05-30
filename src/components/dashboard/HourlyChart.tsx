import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { currencyShort } from "@/lib/utils";
import type { HourlyPoint } from "./data";

interface HourlyChartProps {
  data: HourlyPoint[];
  metric: "retorno" | "compras";
}

export function HourlyChart({ data, metric }: HourlyChartProps) {
  const maxVal = Math.max(...data.map((d) => d[metric]), 1);

  const formatTip = (v: number) =>
    metric === "retorno"
      ? currencyShort(v)
      : `${v} compra${v !== 1 ? "s" : ""}`;

  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      {/* Largura fixa para caber todas as 24 horas e permitir scroll em mobile */}
      <div style={{ minWidth: 640, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={18}>
            <XAxis
              dataKey="hora"
              stroke="var(--color-muted-foreground)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                metric === "retorno" ? `${v / 1000}k` : String(v)
              }
              width={32}
            />
            <Tooltip
              cursor={{ fill: "var(--color-accent)", opacity: 0.3 }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => [formatTip(v), metric === "retorno" ? "Retorno" : "Compras"]}
              labelFormatter={(l) => `${l}`}
            />
            <Bar dataKey={metric} radius={[3, 3, 0, 0]}>
              {data.map((d, i) => {
                const isMax = d[metric] === maxVal && maxVal > 0;
                const isHigh = d[metric] >= maxVal * 0.7 && maxVal > 0;
                return (
                  <Cell
                    key={i}
                    fill={
                      isMax
                        ? "var(--color-primary)"
                        : isHigh
                        ? "oklch(0.65 0.11 78)"
                        : "var(--color-accent)"
                    }
                    opacity={d[metric] === 0 ? 0.25 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
