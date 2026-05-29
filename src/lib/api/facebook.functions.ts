import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GRAPH = "https://graph.facebook.com/v21.0";

const DATE_PRESET: Record<string, string> = {
  "Hoje":    "today",
  "7 dias":  "last_7d",
  "30 dias": "last_30d",
  "Mês":     "this_month",
};

const TIME_INCREMENT: Record<string, string> = {
  "Hoje":    "1",
  "7 dias":  "1",
  "30 dias": "7",
  "Mês":     "7",
};

const CHART_LABEL: Record<string, string> = {
  "Hoje":    "Hoje",
  "7 dias":  "Últimos 7 dias",
  "30 dias": "Últimos 30 dias",
  "Mês":     "Este mês",
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function creds() {
  const token      = process.env.META_ACCESS_TOKEN;
  const businessId = process.env.META_BUSINESS_ACCOUNT_ID;
  if (!token || !businessId)
    throw new Error("Credenciais Meta não configuradas no servidor (META_ACCESS_TOKEN / META_BUSINESS_ACCOUNT_ID)");
  return { token, businessId };
}

function parsePurchases(insight: any) {
  const investido = parseFloat(insight?.spend ?? "0");

  const purchaseAction = insight?.actions?.find(
    (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
  );
  const compras = parseInt(purchaseAction?.value ?? "0", 10);

  const purchaseValue = insight?.action_values?.find(
    (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
  );
  const retorno = parseFloat(purchaseValue?.value ?? "0");

  return {
    investido,
    compras,
    retorno,
    roas:        investido > 0 ? retorno / investido : 0,
    cpa:         compras  > 0 ? investido / compras  : 0,
    ticketMedio: compras  > 0 ? retorno  / compras   : 0,
  };
}

function dayLabel(dateStr: string, period: string) {
  const d = new Date(dateStr + "T12:00:00");
  if (period === "7 dias") return WEEK_DAYS[d.getDay()];
  if (period === "Hoje")   return "Hoje";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function round2(n: number) { return Math.round(n * 100) / 100; }

// ─── Única função pública — chamada pelo Dashboard ─────────────────────────

export const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({ period: z.enum(["Hoje", "7 dias", "30 dias", "Mês"]) })
  )
  .handler(async ({ data: { period } }) => {
    try {
      const { token, businessId } = creds();
      const preset = DATE_PRESET[period];
      const inc    = TIME_INCREMENT[period];
      const FIELDS = "spend,actions,action_values";

      // 1. Busca ad accounts do business manager
      const acRes  = await fetch(
        `${GRAPH}/${businessId}/adaccounts?fields=id,name&limit=10&access_token=${token}`
      );
      const acJson = await acRes.json();
      if (acJson.error) return { success: false as const, error: acJson.error.message };

      const adAccounts: string[] = (acJson.data ?? []).map((a: any) => a.id);
      if (adAccounts.length === 0)
        return { success: false as const, error: "Nenhuma conta de anúncio encontrada no Business Manager." };

      const acId = adAccounts[0]; // usa a primeira conta

      // 2. Busca tudo em paralelo
      const [summaryRes, chartRes, campaignsRes, adsRes] = await Promise.all([
        fetch(
          `${GRAPH}/${acId}/insights?fields=${FIELDS}&date_preset=${preset}&access_token=${token}`
        ),
        fetch(
          `${GRAPH}/${acId}/insights?fields=${FIELDS}&date_preset=${preset}&time_increment=${inc}&access_token=${token}`
        ),
        fetch(
          `${GRAPH}/${acId}/campaigns?fields=id,name,status,insights.date_preset(${preset}){${FIELDS}}&limit=25&access_token=${token}`
        ),
        fetch(
          `${GRAPH}/${acId}/ads?fields=id,name,creative{video_id},insights.date_preset(${preset}){${FIELDS},impressions,clicks}&limit=10&access_token=${token}`
        ),
      ]);

      const [summaryJson, chartJson, campaignsJson, adsJson] = await Promise.all([
        summaryRes.json(), chartRes.json(), campaignsRes.json(), adsRes.json(),
      ]);

      // 3. Summary
      const m = parsePurchases(summaryJson.data?.[0]);

      // 4. Chart
      const chartData = (chartJson.data ?? []).map((d: any) => ({
        dia:       dayLabel(d.date_start, period),
        investido: parseFloat(d.spend ?? "0"),
        retorno:   parseFloat(
          d.action_values?.find((a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase")?.value ?? "0"
        ),
      }));

      // 5. Campanhas
      const campaigns = (campaignsJson.data ?? [])
        .filter((c: any) => c.status !== "DELETED" && c.status !== "ARCHIVED")
        .map((c: any, i: number) => {
          const cm = parsePurchases(c.insights?.data?.[0]);
          return {
            id:         i + 1,
            nome:       c.name as string,
            plataforma: "Meta Ads",
            status:     (c.status === "ACTIVE" ? "ativa" : "pausada") as "ativa" | "pausada",
            investido:  round2(cm.investido),
            retorno:    round2(cm.retorno),
            compras:    cm.compras,
            roas:       round2(cm.roas),
          };
        })
        .sort((a: any, b: any) => b.retorno - a.retorno);

      // 6. Criativos (anúncios)
      const creatives = (adsJson.data ?? [])
        .map((ad: any, i: number) => {
          const am    = parsePurchases(ad.insights?.data?.[0]);
          const clicks = parseInt(ad.insights?.data?.[0]?.clicks ?? "0", 10);
          const imp    = parseInt(ad.insights?.data?.[0]?.impressions ?? "0", 10);
          const isVid  = !!ad.creative?.video_id;
          return {
            id:        i + 1,
            nome:      ad.name as string,
            tipo:      (isVid ? "Vídeo" : "Imagem") as "Vídeo" | "Imagem",
            thumbnail: isVid ? "🎬" : "🖼️",
            compras:   am.compras,
            retorno:   round2(am.retorno),
            ctr:       imp > 0 ? round2((clicks / imp) * 100) : 0,
          };
        })
        .sort((a: any, b: any) => b.retorno - a.retorno)
        .slice(0, 4);

      return {
        success: true as const,
        summary: {
          investido:   round2(m.investido),
          retorno:     round2(m.retorno),
          compras:     m.compras,
          ticketMedio: round2(m.ticketMedio),
          roas:        round2(m.roas),
          cpa:         round2(m.cpa),
          variacao: { investido: 0, retorno: 0, compras: 0, roas: 0, ticketMedio: 0 },
        },
        chartData,
        campaigns,
        creatives,
        chartLabel: CHART_LABEL[period],
      };
    } catch (err) {
      console.error("[Facebook API]", err);
      return {
        success: false as const,
        error: err instanceof Error ? err.message : "Erro ao buscar dados do Facebook",
      };
    }
  });
