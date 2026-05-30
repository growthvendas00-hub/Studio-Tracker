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
          className="flex items-stretch gap-0 rounded-2xl border border-white/10 bg-card/80 shadow-soft backdrop-blur-xl overflow-hidden"
        >
          {/* Thumbnail */}
          <div className="relative shrink-0 w-20 bg-black">
            {c.thumbnail ? (
              <img
                src={c.thumbnail}
                alt={c.nome}
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-2xl"
                style={{ background: "var(--gradient-warm)" }}
              >
                📷
              </div>
            )}
            {/* Badge rank */}
            <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-primary">
              #{i + 1}
            </span>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0 p-3">
            {/* Nome */}
            <p className="text-sm font-bold text-foreground leading-snug line-clamp-1 mb-2">{c.nome}</p>

            {/* ROAS em destaque */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ROAS</span>
              <span className={`text-sm font-bold ${c.roas > 0 ? "text-primary" : "text-muted-foreground"}`}>
                {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "—"}
              </span>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-1 border-t border-border pt-2">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Investido</p>
                <p className="mt-0.5 text-[11px] font-bold text-foreground">{currency(c.investido)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Retorno</p>
                <p className="mt-0.5 text-[11px] font-bold text-foreground">{currency(c.retorno)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Compras</p>
                <p className="mt-0.5 text-[11px] font-bold text-foreground">{c.compras}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
