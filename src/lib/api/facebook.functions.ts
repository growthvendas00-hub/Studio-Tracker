import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GRAPH_API_URL = "https://graph.instagram.com";

// Valida access token e retorna dados da conta
export const validateFacebookToken = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const { accessToken } = data;
      const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;

      if (!businessAccountId) {
        return {
          success: false,
          error: "META_BUSINESS_ACCOUNT_ID não configurado no servidor",
        };
      }

      // Testa o token validando a conta
      const response = await fetch(
        `${GRAPH_API_URL}/${businessAccountId}?fields=id,name,currency&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || "Token inválido ou expirado",
        };
      }

      const accountData = await response.json();

      return {
        success: true,
        account: {
          id: accountData.id,
          name: accountData.name,
          currency: accountData.currency,
        },
        message: "Token validado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao validar token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  });

// Lista campanhas ativas do business account
export const fetchFacebookCampaigns = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      businessAccountId: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    try {
      const { accessToken, businessAccountId } = data;

      // Busca ad accounts sob o business account
      const accountsResponse = await fetch(
        `${GRAPH_API_URL}/${businessAccountId}/adaccounts?fields=id,name,currency&access_token=${accessToken}`
      );

      if (!accountsResponse.ok) {
        return {
          success: false,
          error: "Falha ao buscar contas de anúncio",
          campaigns: [],
        };
      }

      const { data: accounts } = await accountsResponse.json();

      if (!accounts || accounts.length === 0) {
        return {
          success: true,
          campaigns: [],
          message: "Nenhuma conta de anúncio encontrada",
        };
      }

      const campaigns = [];

      // Para cada ad account, busca campanhas
      for (const account of accounts) {
        const campaignResponse = await fetch(
          `${GRAPH_API_URL}/${account.id}/campaigns?fields=id,name,status,created_time,daily_budget,lifetime_budget,objective&limit=100&access_token=${accessToken}`
        );

        if (!campaignResponse.ok) continue;

        const { data: accountCampaigns } = await campaignResponse.json();

        if (accountCampaigns) {
          campaigns.push(
            ...accountCampaigns.map((c: any) => ({
              id: c.id,
              name: c.name,
              status: c.status,
              objective: c.objective,
              createdAt: c.created_time,
              dailyBudget: c.daily_budget,
              lifetimeBudget: c.lifetime_budget,
              accountId: account.id,
              accountName: account.name,
            }))
          );
        }
      }

      return {
        success: true,
        campaigns: campaigns.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        totalAccounts: accounts.length,
        totalCampaigns: campaigns.length,
      };
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        campaigns: [],
      };
    }
  });

// Busca insights (métricas) de uma campanha para período
export const fetchCampaignInsights = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      campaignId: z.string().min(1),
      dateStart: z.string(), // YYYY-MM-DD
      dateEnd: z.string(), // YYYY-MM-DD
    })
  )
  .handler(async ({ data }) => {
    try {
      const { accessToken, campaignId, dateStart, dateEnd } = data;

      const insightsResponse = await fetch(
        `${GRAPH_API_URL}/${campaignId}/insights?` +
          `fields=campaign_id,campaign_name,spend,impressions,clicks,actions,action_values,` +
          `cost_per_action_type,cost_per_inline_post_engagement,purchase_roas` +
          `&time_range={since:${dateStart},until:${dateEnd}}` +
          `&access_token=${accessToken}`
      );

      if (!insightsResponse.ok) {
        return {
          success: false,
          error: "Falha ao buscar métricas",
          insights: null,
        };
      }

      const insights = await insightsResponse.json();

      return {
        success: true,
        insights: insights.data ? insights.data[0] : null,
      };
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        insights: null,
      };
    }
  });
