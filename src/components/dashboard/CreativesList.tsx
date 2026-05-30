import { currency } from "@/lib/utils";
import type { Creative } from "./data";

interface CreativesListProps {
  creatives: Creative[];
}

export function CreativesList({ creatives }: CreativesListProps) {
  return (
    <ul className="space-y-2.5">
      {creatives.map((c, i) => (
        <li
          key={c.id}
          className="rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl"
        >
          {/* Rank + nome */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                #{i + 1}
              </span>
              <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{c.nome}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold text-primary">
                {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">ROAS</p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Investido</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">{currency(c.investido)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Retorno</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">{currency(c.retorno)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Compras</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">{c.compras}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
