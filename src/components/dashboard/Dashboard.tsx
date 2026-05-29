import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Target,
  Wallet,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { CampaignList } from "./CampaignList";
import { CreativesList } from "./CreativesList";
import { periods } from "./data";
import type { Period } from "./data";
import { currency } from "@/lib/utils";
import { fetchDashboardData } from "@/lib/api/facebook.functions";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("7 dias");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => fetchDashboardData({ data: { period } }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const ok = data?.success === true;
  const apiError = isError || (data && !data.success);
  const errorMsg = data && !data.success ? data.error : "Falha ao conectar com o Facebook. Verifique as credenciais.";

  const s         = ok ? data.summary    : null;
  const chartData = ok ? data.chartData  : [];
  const campaigns = ok ? data.campaigns  : [];
  const creatives = ok ? data.creatives  : [];
  const chartLabel = ok ? data.chartLabel : "—";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-primary)" }} aria-hidden />
        <div className="absolute inset-0 opacity-80 mix-blend-screen" style={{ background: "var(--gradient-aurora)" }} aria-hidden />
        <div
          className="absolute -bottom-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[100%] blur-3xl opacity-60"
          style={{ background: "radial-gradient(closest-side, oklch(0.72 0.24 305 / 0.7), transparent)" }}
          aria-hidden
        />

        <div className="relative px-5 pt-12 pb-20 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-80">Painel de resultados</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight">
                {ok ? (
                  <span>Meta Ads</span>
                ) : (
                  <span>Seu resumo</span>
                )}
              </h1>
            </div>
            <button
              type="button"
              aria-label="Atualizar dados"
              onClick={() => refetch()}
              disabled={isFetching}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Period selector */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  period === p
                    ? "bg-white text-primary shadow-soft"
                    : "bg-white/15 text-primary-foreground hover:bg-white/25"
                }`}
              >
                {p === "Hoje" && <Calendar className="h-3.5 w-3.5" />}
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative -mt-12 px-4 space-y-5">
        {/* Erro de API */}
        {apiError && (
          <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">Erro ao carregar dados</p>
                <p className="mt-0.5 text-xs text-destructive/80 break-words">{errorMsg}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="shrink-0 text-xs font-semibold text-destructive underline"
              >
                Tentar novamente
              </button>
            </div>
          </section>
        )}

        {/* Loading skeleton — hero */}
        {isLoading && !ok && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-card animate-pulse">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-3 h-10 w-48 rounded bg-muted" />
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
            </div>
          </section>
        )}

        {/* Hero metric */}
        {s && (
          <section
            className="relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-card backdrop-blur-xl"
            style={{ background: "var(--gradient-card)" }}
          >
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full opacity-50 blur-3xl"
              style={{ background: "var(--primary-glow)" }}
              aria-hidden
            />
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Retorno no período</p>
              {s.variacao.retorno !== 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    s.variacao.retorno >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {s.variacao.retorno >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(s.variacao.retorno)}%
                </span>
              )}
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
              {currency(s.retorno)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">ROAS</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{s.roas.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">CPA</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{currency(s.cpa)}</p>
              </div>
            </div>
          </section>
        )}

        {/* Loading skeleton — grid */}
        {isLoading && !ok && (
          <section className="grid grid-cols-2 gap-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-card/80 border border-white/10" />
            ))}
          </section>
        )}

        {/* Metric grid */}
        {s && (
          <section className="grid grid-cols-2 gap-3">
            <MetricCard icon={Wallet}    label="Investido"    value={currency(s.investido)}               delta={s.variacao.investido}   tone="neutral" />
            <MetricCard icon={ShoppingBag} label="Compras"   value={s.compras.toLocaleString("pt-BR")}   delta={s.variacao.compras}     tone="success" />
            <MetricCard icon={DollarSign} label="Ticket médio" value={currency(s.ticketMedio)}            delta={s.variacao.ticketMedio} tone="success" />
            <MetricCard icon={Target}    label="ROAS"         value={`${s.roas.toFixed(2)}x`}             delta={s.variacao.roas}        tone="success" />
          </section>
        )}

        {/* Chart */}
        {(isLoading || ok) && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Investimento × Retorno</h2>
                <p className="text-xs text-muted-foreground">{chartLabel}</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Retorno
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Invest.
                </span>
              </div>
            </div>
            <div className="mt-4 h-44">
              {isLoading && !ok
                ? <div className="h-full rounded-xl bg-muted/30 animate-pulse" />
                : <PerformanceChart data={chartData} />
              }
            </div>
          </section>
        )}

        {/* Campanhas */}
        {(isLoading || campaigns.length > 0) && (
          <section>
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <h2 className="text-base font-bold text-foreground">Campanhas</h2>
                <p className="text-xs text-muted-foreground">Ordenadas por retorno</p>
              </div>
            </div>
            {isLoading && !ok ? (
              <div className="space-y-2.5 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-card/80 border border-white/10" />
                ))}
              </div>
            ) : (
              <CampaignList campaigns={campaigns} />
            )}
          </section>
        )}

        {/* Criativos */}
        {(isLoading || creatives.length > 0) && (
          <section>
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <h2 className="text-base font-bold text-foreground">Criativos campeões</h2>
                <p className="text-xs text-muted-foreground">O que mais vendeu</p>
              </div>
            </div>
            {isLoading && !ok ? (
              <div className="space-y-2.5 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-card/80 border border-white/10" />
                ))}
              </div>
            ) : (
              <CreativesList creatives={creatives} />
            )}
          </section>
        )}

        {/* Estado vazio — sem erros, mas sem dados */}
        {!isLoading && !apiError && ok && campaigns.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-8 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhuma campanha encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Não há campanhas ativas ou com dados para este período.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
