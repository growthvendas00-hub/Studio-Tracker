import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GRAPH = "https://graph.facebook.com/v21.0";

const DATE_PRESET: Record<string, string> = {
  "Hoje":    "today",
  "Ontem":   "yesterday",
  "7 dias":  "last_7d",
  "30 dias": "last_30d",
  "Mês":     "this_month",
};

const TIME_INCREMENT: Record<string, string> = {
  "Hoje":    "1",
  "Ontem":   "1",
  "7 dias":  "1",
  "30 dias": "7",
  "Mês":     "7",
};

const CHART_LABEL: Record<string, string> = {
  "Hoje":    "Hoje",
  "Ontem":   "Ontem",
  "7 dias":  "Últimos 7 dias",
  "30 dias": "Últimos 30 dias",
  "Mês":     "Este mês",
};

// Para período customizado, calcula o time_increment adequado
function customIncrement(since: string, until: string): string {
  const days = Math.ceil(
    (new Date(until).getTime() - new Date(since).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 14) return "1";
  if (days <= 60) return "7";
  return "30";
}

// Monta o parâmetro de data para URLs de insights
function dateParam(period: string, since?: string, until?: string): string {
  if (period === "custom" && since && until) {
    return `time_range=${encodeURIComponent(JSON.stringify({ since, until }))}`;
  }
  return `date_preset=${DATE_PRESET[period]}`;
}

// Sintaxe para insights embutidos em campanhas/ads
function embeddedDateParam(period: string, since?: string, until?: string): string {
  if (period === "custom" && since && until) {
    return `time_range({"since":"${since}","until":"${until}"})`;
  }
  return `date_preset(${DATE_PRESET[period]})`;
}

function fmtDatePtBR(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Tipos de ação que indicam visita ao perfil Instagram
const PROFILE_VISIT_ACTIONS = [
  "instagram_view_profile",
  "profile_visit",
  "onsite_conversion.view_profile",
  "onsite_conversion.flow_complete",
  "view_profile",
];

function creds() {
  const token      = process.env.META_ACCESS_TOKEN;
  const businessId = process.env.META_BUSINESS_ACCOUNT_ID;
  if (!token || !businessId)
    throw new Error("Credenciais Meta não configuradas (META_ACCESS_TOKEN / META_BUSINESS_ACCOUNT_ID)");
  return { token, businessId };
}

function getActionValue(actions: any[], ...types: string[]): number {
  if (!actions) return 0;
  for (const type of types) {
    const found = actions.find((a: any) => a.action_type === type);
    if (found) return parseFloat(found.value ?? "0");
  }
  return 0;
}

function getActionInt(actions: any[], ...types: string[]): number {
  return Math.round(getActionValue(actions, ...types));
}

// Tipos de ação de compra aceitos pelo Facebook
// offsite_conversion.fb_pixel_purchase = compra via pixel (mais comum no Brasil)
const PURCHASE_ACTIONS = [
  "purchase",
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
  "app_custom_event.fb_mobile_purchase",
] as const;

function parsePurchases(insight: any) {
  const investido = parseFloat(insight?.spend ?? "0");

  const compras = getActionInt(
    insight?.actions ?? [],
    ...PURCHASE_ACTIONS
  );

  const retorno = getActionValue(
    insight?.action_values ?? [],
    ...PURCHASE_ACTIONS
  );

  // Usa o ROAS calculado pelo próprio Facebook (exclui do denominador campanhas sem compra)
  const fbRoasArr = insight?.purchase_roas ?? [];
  const fbRoas = fbRoasArr.length > 0
    ? parseFloat(fbRoasArr[0].value ?? "0")
    : (investido > 0 ? retorno / investido : 0);

  return {
    investido,
    compras,
    retorno,
    roas:        fbRoas,
    cpa:         compras > 0 ? investido / compras : 0,
    ticketMedio: compras > 0 ? retorno   / compras : 0,
  };
}

function dayLabel(dateStr: string, period: string) {
  const d = new Date(dateStr + "T12:00:00");
  if (period === "7 dias") return WEEK_DAYS[d.getDay()];
  if (period === "Hoje")   return "Hoje";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function round2(n: number) { return Math.round(n * 100) / 100; }

export const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      period: z.enum(["Hoje", "Ontem", "7 dias", "30 dias", "Mês", "custom"]),
      since:  z.string().optional(),
      until:  z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { period, since, until } = data;
    try {
      const { token, businessId } = creds();
      const isCustom = period === "custom" && !!since && !!until;
      const inc = isCustom
        ? customIncrement(since!, until!)
        : TIME_INCREMENT[period];

      // Campos de insights — purchase_roas é o ROAS calculado pelo próprio Facebook
      const FIELDS    = "spend,actions,action_values,purchase_roas,impressions,clicks";
      // Campos para breakdown por anúncio (sem duplicar impressions/clicks)
      const AD_FIELDS = "ad_id,ad_name,spend,actions,action_values,purchase_roas,impressions,clicks";

      // 1. Ad accounts do Business Manager
      const acRes  = await fetch(
        `${GRAPH}/${businessId}/owned_ad_accounts?fields=id,name&limit=10&access_token=${token}`
      );
      const acJson = await acRes.json();

      let adAccounts: string[] = (acJson.data ?? []).map((a: any) => a.id);

      // Fallback: client_ad_accounts (quando BM age como agência)
      if (!acJson.error && adAccounts.length === 0) {
        const clientRes  = await fetch(
          `${GRAPH}/${businessId}/client_ad_accounts?fields=id,name&limit=10&access_token=${token}`
        );
        const clientJson = await clientRes.json();
        adAccounts = (clientJson.data ?? []).map((a: any) => a.id);
      }

      if (acJson.error) return { success: false as const, error: acJson.error.message };
      if (adAccounts.length === 0)
        return { success: false as const, error: "Nenhuma conta de anúncio encontrada no Business Manager." };

      const acId = adAccounts[0];

      const dp  = dateParam(period, since, until);
      const edp = embeddedDateParam(period, since, until);
      const HOURLY_FIELDS = "spend,actions,action_values";

      // 2. Busca tudo em paralelo
      // campInsRes: insights diretos level=campaign (retorna TODOS os action_types,
      //             inclusive instagram_view_profile que não aparece no embedded)
      const [summaryRes, chartRes, campaignsRes, adsRes, hourlyRes, campInsRes] = await Promise.all([
        fetch(`${GRAPH}/${acId}/insights?fields=${FIELDS}&${dp}&access_token=${token}`),
        fetch(`${GRAPH}/${acId}/insights?fields=${FIELDS}&${dp}&time_increment=${inc}&access_token=${token}`),
        fetch(`${GRAPH}/${acId}/campaigns?fields=id,name,status,objective,insights.${edp}{${FIELDS}}&limit=50&access_token=${token}`),
        fetch(`${GRAPH}/${acId}/insights?level=ad&fields=${AD_FIELDS}&${dp}&limit=100&access_token=${token}`),
        fetch(`${GRAPH}/${acId}/insights?fields=${HOURLY_FIELDS}&${dp}&breakdowns=hourly_stats_aggregated_by_advertiser_time_zone&access_token=${token}`),
        fetch(`${GRAPH}/${acId}/insights?level=campaign&fields=campaign_id,actions,spend&${dp}&limit=50&access_token=${token}`),
      ]);

      const [summaryJson, chartJson, campaignsJson, adsJson, hourlyJson, campInsJson] = await Promise.all([
        summaryRes.json(), chartRes.json(), campaignsRes.json(), adsRes.json(), hourlyRes.json(), campInsRes.json(),
      ]);

      // 3. Summary com ROAS correto do Facebook
      const m = parsePurchases(summaryJson.data?.[0]);

      // 4. Visitas ao perfil e investimento em tráfego
      const allCampaigns = campaignsJson.data ?? [];

      // Mapa campaign_id → actions da chamada direta (retorna todos os action_types)
      const campInsMap = new Map<string, any[]>();
      for (const row of campInsJson.data ?? []) {
        if (row.campaign_id) campInsMap.set(row.campaign_id, row.actions ?? []);
      }

      let profileVisits    = 0;
      let investidoTrafego = 0;

      for (const c of allCampaigns) {
        const insight = c.insights?.data?.[0];
        if (!insight) continue;
        const spend     = parseFloat(insight.spend ?? "0");
        if (spend === 0) continue;

        // Usa actions do insight embedded para calcular compras
        const embActions = insight.actions ?? [];
        const purchases  = getActionInt(embActions, ...PURCHASE_ACTIONS);

        // Usa a chamada direta (level=campaign) para obter visitas — mais completa
        const directActions = campInsMap.get(c.id) ?? embActions;
        const visits = getActionInt(directActions, ...PROFILE_VISIT_ACTIONS);

        if (visits > 0) {
          profileVisits    += visits;
          investidoTrafego += spend;
        } else if (purchases === 0) {
          investidoTrafego += spend;
        }
      }

      // 5. Chart
      const chartData = (chartJson.data ?? []).map((d: any) => ({
        dia: isCustom
          ? new Date(d.date_start + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
          : dayLabel(d.date_start, period),
        investido: parseFloat(d.spend ?? "0"),
        retorno:   getActionValue(d.action_values ?? [], "purchase", "omni_purchase"),
      }));

      // 6. Campanhas (todas, com separação visual de objetivo)
      const campaigns = allCampaigns
        .filter((c: any) => c.status !== "DELETED" && c.status !== "ARCHIVED")
        .map((c: any, i: number) => {
          const cm  = parsePurchases(c.insights?.data?.[0]);
          const obj = (c.objective ?? "").toUpperCase();
          const isSales = obj === "OUTCOME_SALES" || obj === "CONVERSIONS" || obj === "PRODUCT_CATALOG_SALES";
          return {
            id:         i + 1,
            nome:       c.name as string,
            plataforma: "Meta Ads",
            status:     (c.status === "ACTIVE" ? "ativa" : "pausada") as "ativa" | "pausada",
            investido:  round2(cm.investido),
            retorno:    round2(cm.retorno),
            compras:    cm.compras,
            roas:       round2(cm.roas),
            objetivo:   isSales ? "vendas" : "trafego",
          };
        })
        .sort((a: any, b: any) => b.retorno - a.retorno);

      // 7. Anúncios individuais via insights level=ad
      const adsData = adsJson.data ?? [];

      // Busca thumbnails dos anúncios em paralelo (só se tiver dados)
      let thumbMap: Record<string, string> = {};
      if (adsData.length > 0) {
        const adIds = adsData.slice(0, 20).map((a: any) => a.ad_id).filter(Boolean);
        if (adIds.length > 0) {
          try {
            const thumbRes  = await fetch(
              `${GRAPH}/?ids=${adIds.join(",")}&fields=id,creative{thumbnail_url}&access_token=${token}`
            );
            const thumbJson = await thumbRes.json();
            for (const [id, adObj] of Object.entries(thumbJson as Record<string, any>)) {
              const url = adObj?.creative?.thumbnail_url;
              if (url) thumbMap[id] = url;
            }
          } catch { /* thumbnails opcionais */ }
        }
      }

      const adsList = adsData.map((ad: any, i: number) => {
        const am     = parsePurchases(ad);
        const clicks = parseInt(ad.clicks      ?? "0", 10);
        const imps   = parseInt(ad.impressions ?? "0", 10);
        return {
          id:        i + 1,
          nome:      (ad.ad_name ?? "Anúncio") as string,
          tipo:      "Imagem" as "Vídeo" | "Imagem",
          thumbnail: thumbMap[ad.ad_id] ?? null,
          compras:   am.compras,
          retorno:   round2(am.retorno),
          investido: round2(am.investido),
          roas:      round2(am.roas),
          ctr:       imps > 0 ? round2((clicks / imps) * 100) : 0,
        };
      });

      // Fallback: se ads não retornou dados, usa campanhas
      const sourceList = adsList.length > 0 ? adsList : campaigns.map((c, i) => ({
        id:        i + 1,
        nome:      c.nome,
        tipo:      "Imagem" as "Vídeo" | "Imagem",
        thumbnail: null as string | null,
        compras:   c.compras,
        retorno:   c.retorno,
        investido: c.investido,
        roas:      c.roas,
        ctr:       0,
      }));

      const creatives = [...sourceList]
        .sort((a, b) => {
          if (b.compras !== a.compras) return b.compras - a.compras;
          if (b.retorno !== a.retorno) return b.retorno - a.retorno;
          return b.ctr - a.ctr;
        })
        .slice(0, 6);

      // 8. Dados por hora do dia (pico de vendas)
      // A API retorna "HH:00:00 - HH+1:00:00" no campo de breakdown
      const hourlyRaw = hourlyJson.data ?? [];
      const hourlyData = Array.from({ length: 24 }, (_, h) => {
        const prefix = `${String(h).padStart(2, "0")}:`;
        const point = hourlyRaw.find((d: any) =>
          (d.hourly_stats_aggregated_by_advertiser_time_zone ?? "").startsWith(prefix)
        );
        return {
          hora:      `${String(h).padStart(2, "0")}h`,
          compras:   point ? getActionInt (point.actions       ?? [], "purchase", "omni_purchase") : 0,
          retorno:   point ? round2(getActionValue(point.action_values ?? [], "purchase", "omni_purchase")) : 0,
          investido: round2(parseFloat(point?.spend ?? "0")),
        };
      });

      return {
        success: true as const,
        summary: {
          investido:       round2(m.investido),
          retorno:         round2(m.retorno),
          lucro:           round2(m.retorno - m.investido),
          compras:         m.compras,
          ticketMedio:     round2(m.ticketMedio),
          roas:            round2(m.roas),          // ROAS calculado pelo Facebook
          cpa:             round2(m.cpa),
          profileVisits,
          investidoTrafego: round2(investidoTrafego),
          variacao: { investido: 0, retorno: 0, compras: 0, roas: 0, ticketMedio: 0 },
        },
        chartData,
        hourlyData,
        campaigns,
        creatives,
        chartLabel: isCustom
          ? `${fmtDatePtBR(since!)} a ${fmtDatePtBR(until!)}`
          : CHART_LABEL[period],
      };
    } catch (err) {
      console.error("[Facebook API]", err);
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Erro ao buscar dados do Facebook",
      };
    }
  });
