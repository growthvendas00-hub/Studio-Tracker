import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Target,
  Wallet,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);

  const isCustom = !!(customRange?.from && customRange?.to);

  const customLabel = isCustom
    ? `${format(customRange!.from!, "dd/MM")} – ${format(customRange!.to!, "dd/MM")}`
    : "Período";

  function selectPreset(p: Period) {
    setPeriod(p);
    setCustomRange(undefined);
  }

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", isCustom ? "custom" : period, customRange?.from, customRange?.to],
    queryFn: () => {
      if (isCustom) {
        return fetchDashboardData({
          data: {
            period: "custom",
            since: format(customRange!.from!, "yyyy-MM-dd"),
            until: format(customRange!.to!, "yyyy-MM-dd"),
          },
        });
      }
      return fetchDashboardData({ data: { period } });
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const ok        = data?.success === true;
  const apiError  = isError || (data && !data.success);
  const errorMsg  = data && !data.success
    ? data.error
    : "Falha ao conectar com o Facebook. Verifique as credenciais.";

  const s          = ok ? data.summary   : null;
  const chartData  = ok ? data.chartData  : [];
  const campaigns  = ok ? data.campaigns  : [];
  const creatives  = ok ? data.creatives  : [];
  const chartLabel = ok ? data.chartLabel : "—";

  return (
    <div className="min-h-screen bg-background pb-safe">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Gradiente de fundo */}
        <div className="absolute inset-0" style={{ background: "var(--gradient-primary)" }} aria-hidden />
        <div className="absolute inset-0 opacity-70 mix-blend-screen" style={{ background: "var(--gradient-aurora)" }} aria-hidden />
        {/* Glow dourado na base */}
        <div
          className="absolute -bottom-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-[100%] blur-3xl opacity-50"
          style={{ background: "radial-gradient(closest-side, oklch(0.55 0.12 82 / 0.35), transparent)" }}
          aria-hidden
        />

        <div className="relative px-5 pt-safe pb-20 text-primary-foreground">
          <div className="flex items-center justify-between gap-3">

            {/* Logo + nome do cliente */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black shadow-card">
                <img
                  src="/logo.jpg"
                  alt="Studio Burguer"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium opacity-75 truncate">Painel de resultados</p>
                <h1 className="text-base font-bold tracking-tight truncate">Studio Burguer</h1>
              </div>
            </div>

            {/* Botão atualizar */}
            <button
              type="button"
              aria-label="Atualizar dados"
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Period selector */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={!isCustom && period === p}
                onClick={() => selectPreset(p)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  !isCustom && period === p
                    ? "bg-white text-primary shadow-soft"
                    : "bg-white/15 text-primary-foreground hover:bg-white/25"
                }`}
              >
                {p === "Hoje" && <Calendar className="h-3.5 w-3.5" />}
                {p}
              </button>
            ))}

            {/* Seletor de data customizada */}
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    isCustom
                      ? "bg-white text-primary shadow-soft"
                      : "bg-white/15 text-primary-foreground hover:bg-white/25"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {customLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-border bg-card shadow-card"
                align="start"
                side="bottom"
                sideOffset={8}
              >
                <CalendarPicker
                  mode="range"
                  selected={customRange}
                  onSelect={(range) => {
                    setCustomRange(range);
                    if (range?.from && range?.to) {
                      setPickerOpen(false);
                    }
                  }}
                  disabled={{ after: new Date() }}
                  locale={ptBR}
                  numberOfMonths={1}
                  className="p-3"
                />
                {isCustom && (
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      onClick={() => { setCustomRange(undefined); setPickerOpen(false); }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <X className="h-3 w-3" /> Limpar filtro
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="relative -mt-12 px-4 space-y-4">

        {/* ── Erro ───────────────────────────────────────────────── */}
        {apiError && (
          <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">Erro ao carregar dados</p>
                <p className="mt-0.5 text-xs text-destructive/80 break-words">{errorMsg}</p>
              </div>
              <button onClick={() => refetch()} className="shrink-0 text-xs font-semibold text-destructive underline">
                Tentar novamente
              </button>
            </div>
          </section>
        )}

        {/* ── Skeleton hero ──────────────────────────────────────── */}
        {isLoading && !ok && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-card animate-pulse">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="mt-3 h-9 w-44 rounded bg-muted" />
            <div className="mt-3 h-6 w-36 rounded-full bg-muted" />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded bg-muted" />)}
            </div>
          </section>
        )}

        {/* ── Hero metric ────────────────────────────────────────── */}
        {s && (
          <section
            className="relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-card backdrop-blur-xl"
            style={{ background: "var(--gradient-card)" }}
          >
            {/* Glow dourado decorativo */}
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--primary-glow)" }}
              aria-hidden
            />

            <p className="text-xs font-medium text-muted-foreground">Retorno bruto no período</p>
            <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground truncate">
              {currency(s.retorno)}
            </p>

            {/* Lucro líquido */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-bold text-success">
                Lucro líquido: {currency(s.lucro)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Investido</p>
                <p className="mt-0.5 text-xs font-bold text-foreground truncate">{currency(s.investido)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">ROAS</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{s.roas.toFixed(2)}x</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">CPA</p>
                <p className="mt-0.5 text-xs font-bold text-foreground truncate">{currency(s.cpa)}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Skeleton grid ──────────────────────────────────────── */}
        {isLoading && !ok && (
          <section className="grid grid-cols-2 gap-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-card/80 border border-white/10" />
            ))}
          </section>
        )}

        {/* ── Metric grid ────────────────────────────────────────── */}
        {s && (
          <section className="grid grid-cols-2 gap-3">
            <MetricCard icon={ShoppingBag} label="Compras"      value={s.compras.toLocaleString("pt-BR")} delta={s.variacao.compras}     tone="success" />
            <MetricCard icon={DollarSign}  label="Ticket médio" value={currency(s.ticketMedio)}           delta={s.variacao.ticketMedio} tone="success" />
            <MetricCard icon={Wallet}      label="Investido"    value={currency(s.investido)}             delta={s.variacao.investido}   tone="neutral" />
            <MetricCard icon={Target}      label="ROAS"         value={`${s.roas.toFixed(2)}x`}           delta={s.variacao.roas}        tone="success" />
          </section>
        )}

        {/* ── Tráfego & Engajamento ──────────────────────────────── */}
        {s && s.investidoTrafego > 0 && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-soft backdrop-blur-xl">
            <h2 className="text-sm font-bold text-foreground">Tráfego & Seguidores</h2>
            <p className="text-xs text-muted-foreground mb-4">Campanhas de visitas e engajamento</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Eye className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Visitas ao perfil</p>
                  <p className="mt-0.5 text-lg font-bold text-foreground">
                    {s.profileVisits > 0 ? s.profileVisits.toLocaleString("pt-BR") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Wallet className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Investido</p>
                  <p className="mt-0.5 text-lg font-bold text-foreground truncate">
                    {currency(s.investidoTrafego)}
                  </p>
                </div>
              </div>
            </div>

            {/* Custo por visita — mostra sempre que há dados */}
            <div className="mt-4 rounded-2xl bg-background/40 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Custo por visita</p>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {s.profileVisits > 0
                  ? currency(s.investidoTrafego / s.profileVisits)
                  : "—"}
              </p>
              {s.profileVisits === 0 && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Visitas não rastreadas neste período
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Chart ──────────────────────────────────────────────── */}
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

        {/* ── Campanhas ──────────────────────────────────────────── */}
        {(isLoading || campaigns.length > 0) && (
          <section>
            <div className="mb-3 px-1">
              <h2 className="text-base font-bold text-foreground">Campanhas</h2>
              <p className="text-xs text-muted-foreground">Ordenadas por retorno</p>
            </div>
            {isLoading && !ok
              ? <div className="space-y-2.5 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-card/80 border border-white/10" />)}</div>
              : <CampaignList campaigns={campaigns} />
            }
          </section>
        )}

        {/* ── Criativos ──────────────────────────────────────────── */}
        {(isLoading || creatives.length > 0) && (
          <section>
            <div className="mb-3 px-1">
              <h2 className="text-base font-bold text-foreground">Criativos campeões</h2>
              <p className="text-xs text-muted-foreground">O que mais vendeu</p>
            </div>
            {isLoading && !ok
              ? <div className="space-y-2.5 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-card/80 border border-white/10" />)}</div>
              : <CreativesList creatives={creatives} />
            }
          </section>
        )}

        {/* ── Vazio ──────────────────────────────────────────────── */}
        {!isLoading && !apiError && ok && campaigns.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-card/80 p-8 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhuma campanha encontrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Não há campanhas ativas para este período.
            </p>
          </section>
        )}

      </main>
    </div>
  );
}
