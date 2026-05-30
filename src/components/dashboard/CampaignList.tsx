import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { currency } from "@/lib/utils";
import type { Campaign } from "./data";

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [showAll, setShowAll] = useState(false);

  const active  = campaigns.filter((c) => c.status === "ativa");
  const paused  = campaigns.filter((c) => c.status === "pausada");
  const visible = showAll ? campaigns : active;

  return (
    <div>
      <ul className="space-y-2.5">
        {visible.map((c) => {
          const lucrativa = c.roas >= 3;
          return (
            <li
              key={c.id}
              className="rounded-2xl border border-white/10 bg-card/80 p-4 shadow-soft backdrop-blur-xl transition active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        c.status === "ativa" ? "bg-success" : "bg-muted-foreground/50"
                      }`}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">
                      {c.plataforma}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-foreground leading-snug">
                    {c.nome}
                  </p>
                </div>
                <div className="shrink-0 text-right pl-1">
                  <p className={`text-sm font-bold ${lucrativa ? "text-success" : "text-warning"}`}>
                    {c.roas.toFixed(2)}x
                  </p>
                  <p className="text-[10px] text-muted-foreground">ROAS</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <Stat label="Investido" value={currency(c.investido)} />
                <Stat label="Retorno"   value={currency(c.retorno)} />
                <Stat label="Compras"   value={c.compras.toString()} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Botão para mostrar/ocultar pausadas */}
      {paused.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-card/40 py-3 text-xs font-semibold text-muted-foreground transition hover:bg-card/70 active:scale-[0.99]"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Ocultar campanhas pausadas
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Ver {paused.length} campanha{paused.length > 1 ? "s" : ""} pausada{paused.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
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
