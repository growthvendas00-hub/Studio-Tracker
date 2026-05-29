import { useState } from "react";
import {
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Target,
  Wallet,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { PerformanceChart } from "./PerformanceChart";
import { CampaignList } from "./CampaignList";
import { CreativesList } from "./CreativesList";
import { FacebookConnect } from "@/components/facebook/FacebookConnect";
import { periods, getPeriodData } from "./data";
import type { Period } from "./data";
import { currency } from "@/lib/utils";

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("7 dias");
  const { summary: s, chartData, campaigns, creatives, chartLabel } = getPeriodData(period);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-primary)" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-80 mix-blend-screen"
          style={{ background: "var(--gradient-aurora)" }}
          aria-hidden
        />
        <div
          className="absolute -bottom-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[100%] blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.72 0.24 305 / 0.7), transparent)",
          }}
          aria-hidden
        />

        <div className="relative px-5 pt-12 pb-20 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-80">Olá, Bistrô do Léo 👋</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight">Seu resumo</h1>
            </div>
            <button
              type="button"
              aria-label="Notificações"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-warning" />
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

      {/* Main content lifted over header */}
      <main className="relative -mt-12 px-4 space-y-5">
        {/* Facebook Connection */}
        <section>
          <FacebookConnect />
        </section>

        {/* Hero metric */}
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
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                s.variacao.retorno >= 0
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {s.variacao.retorno >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(s.variacao.retorno)}%
            </span>
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

        {/* Metric grid */}
        <section className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Wallet}
            label="Investido"
            value={currency(s.investido)}
            delta={s.variacao.investido}
            tone="neutral"
          />
          <MetricCard
            icon={ShoppingBag}
            label="Compras"
            value={s.compras.toLocaleString("pt-BR")}
            delta={s.variacao.compras}
            tone="success"
          />
          <MetricCard
            icon={DollarSign}
            label="Ticket médio"
            value={currency(s.ticketMedio)}
            delta={s.variacao.ticketMedio}
            tone="success"
          />
          <MetricCard
            icon={Target}
            label="ROAS"
            value={`${s.roas.toFixed(2)}x`}
            delta={s.variacao.roas}
            tone="success"
          />
        </section>

        {/* Chart */}
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
            <PerformanceChart data={chartData} />
          </div>
        </section>

        {/* Campaigns */}
        <section>
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-foreground">Campanhas</h2>
              <p className="text-xs text-muted-foreground">Ordenadas por retorno</p>
            </div>
          </div>
          <CampaignList campaigns={campaigns} />
        </section>

        {/* Creatives */}
        <section>
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-foreground">Criativos campeões</h2>
              <p className="text-xs text-muted-foreground">O que mais vendeu</p>
            </div>
          </div>
          <CreativesList creatives={creatives} />
        </section>

        {/* Insight card */}
        <section
          className="rounded-3xl p-5 text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Insight da semana</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                Seus vídeos de "câmera lenta" geraram <strong>2,3x</strong> mais compras que
                imagens estáticas. Vale aumentar o investimento neles.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
