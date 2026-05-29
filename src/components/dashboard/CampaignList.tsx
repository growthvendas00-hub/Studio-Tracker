import { currency } from "@/lib/utils";
import type { Campaign } from "./data";

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  return (
    <ul className="space-y-2.5">
      {campaigns.map((c) => {
        const lucrativa = c.roas >= 3;
        return (
          <li
            key={c.id}
            className="rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      c.status === "ativa" ? "bg-success" : "bg-muted-foreground/50"
                    }`}
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.plataforma}
                  </p>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-foreground">{c.nome}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-bold ${lucrativa ? "text-success" : "text-warning"}`}>
                  {c.roas.toFixed(2)}x
                </p>
                <p className="text-[10px] text-muted-foreground">ROAS</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
              <Stat label="Investido" value={currency(c.investido)} />
              <Stat label="Retorno" value={currency(c.retorno)} />
              <Stat label="Compras" value={c.compras.toString()} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}
