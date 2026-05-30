import { Play, Image as ImageIcon } from "lucide-react";
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
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/80 p-3 shadow-soft backdrop-blur-xl transition active:scale-[0.99]"
        >
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: "var(--gradient-warm)" }}
          >
            {c.thumbnail}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-soft">
              {c.tipo === "Vídeo" ? (
                <Play className="h-2.5 w-2.5 fill-current" />
              ) : (
                <ImageIcon className="h-2.5 w-2.5" />
              )}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
              <p className="line-clamp-2 text-sm font-bold text-foreground leading-snug">{c.nome}</p>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>
                <strong className="text-foreground">{c.compras}</strong> compras
              </span>
              <span>
                CTR <strong className="text-foreground">{c.ctr}%</strong>
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-foreground">{currency(c.retorno)}</p>
            <p className="text-[10px] text-muted-foreground">retorno</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
