export const periods = ["Hoje", "7 dias", "30 dias", "Mês"] as const;
export type Period = (typeof periods)[number];

export type PeriodSummary = {
  investido: number;
  retorno: number;
  compras: number;
  ticketMedio: number;
  roas: number;
  cpa: number;
  variacao: {
    investido: number;
    retorno: number;
    compras: number;
    roas: number;
    ticketMedio: number;
  };
};

export type ChartPoint = { dia: string; investido: number; retorno: number };

export type Campaign = {
  id: number;
  nome: string;
  plataforma: string;
  investido: number;
  retorno: number;
  compras: number;
  roas: number;
  status: "ativa" | "pausada";
};

export type Creative = {
  id: number;
  nome: string;
  tipo: "Vídeo" | "Imagem";
  thumbnail: string;
  compras: number;
  retorno: number;
  ctr: number;
};

export type PeriodData = {
  summary: PeriodSummary;
  chartData: ChartPoint[];
  campaigns: Campaign[];
  creatives: Creative[];
  chartLabel: string;
};

const allData: Record<Period, PeriodData> = {
  "Hoje": {
    summary: {
      investido: 680,
      retorno: 3120,
      compras: 68,
      ticketMedio: 45.88,
      roas: 4.59,
      cpa: 10.0,
      variacao: { investido: 6.3, retorno: 12.9, compras: 15.3, roas: 6.1, ticketMedio: 2.1 },
    },
    chartLabel: "Hoje (por hora)",
    chartData: [
      { dia: "08h", investido: 60, retorno: 210 },
      { dia: "10h", investido: 90, retorno: 380 },
      { dia: "12h", investido: 120, retorno: 560 },
      { dia: "14h", investido: 110, retorno: 510 },
      { dia: "16h", investido: 100, retorno: 480 },
      { dia: "18h", investido: 130, retorno: 620 },
      { dia: "20h", investido: 70, retorno: 360 },
    ],
    campaigns: [
      { id: 1, nome: "Combo Família — Fim de Semana", plataforma: "Meta Ads", investido: 200, retorno: 1040, compras: 22, roas: 5.2, status: "ativa" },
      { id: 2, nome: "Promo Almoço Executivo", plataforma: "Meta Ads", investido: 160, retorno: 690, compras: 16, roas: 4.3, status: "ativa" },
      { id: 3, nome: "Retargeting — Carrinho Abandonado", plataforma: "Google Ads", investido: 100, retorno: 560, compras: 12, roas: 5.6, status: "ativa" },
      { id: 4, nome: "Lançamento Novo Sabor", plataforma: "Meta Ads", investido: 130, retorno: 420, compras: 9, roas: 3.23, status: "pausada" },
      { id: 5, nome: "Sobremesas — Happy Hour", plataforma: "TikTok Ads", investido: 90, retorno: 410, compras: 9, roas: 2.56, status: "ativa" },
    ],
    creatives: [
      { id: 1, nome: "Vídeo — Hambúrguer em câmera lenta", tipo: "Vídeo", thumbnail: "🍔", compras: 30, retorno: 1380, ctr: 5.1 },
      { id: 2, nome: "Carrossel — Combo família", tipo: "Imagem", thumbnail: "🍕", compras: 21, retorno: 960, ctr: 3.8 },
      { id: 3, nome: "Vídeo — Cozinha ao vivo", tipo: "Vídeo", thumbnail: "🎥", compras: 12, retorno: 540, ctr: 3.2 },
      { id: 4, nome: "Imagem — Sobremesa do dia", tipo: "Imagem", thumbnail: "🍰", compras: 5, retorno: 240, ctr: 2.0 },
    ],
  },

  "7 dias": {
    summary: {
      investido: 4280,
      retorno: 18940,
      compras: 412,
      ticketMedio: 45.97,
      roas: 4.42,
      cpa: 10.39,
      variacao: { investido: -3.2, retorno: 18.6, compras: 12.4, roas: 22.1, ticketMedio: 5.3 },
    },
    chartLabel: "Últimos 7 dias",
    chartData: [
      { dia: "Seg", investido: 520, retorno: 2100 },
      { dia: "Ter", investido: 610, retorno: 2480 },
      { dia: "Qua", investido: 580, retorno: 2620 },
      { dia: "Qui", investido: 640, retorno: 2950 },
      { dia: "Sex", investido: 720, retorno: 3480 },
      { dia: "Sáb", investido: 680, retorno: 3120 },
      { dia: "Dom", investido: 530, retorno: 2190 },
    ],
    campaigns: [
      { id: 1, nome: "Combo Família — Fim de Semana", plataforma: "Meta Ads", investido: 1240, retorno: 6820, compras: 148, roas: 5.5, status: "ativa" },
      { id: 2, nome: "Promo Almoço Executivo", plataforma: "Meta Ads", investido: 980, retorno: 4310, compras: 102, roas: 4.4, status: "ativa" },
      { id: 3, nome: "Retargeting — Carrinho Abandonado", plataforma: "Google Ads", investido: 640, retorno: 3580, compras: 78, roas: 5.59, status: "ativa" },
      { id: 4, nome: "Lançamento Novo Sabor", plataforma: "Meta Ads", investido: 820, retorno: 2640, compras: 54, roas: 3.22, status: "pausada" },
      { id: 5, nome: "Sobremesas — Happy Hour", plataforma: "TikTok Ads", investido: 600, retorno: 1589, compras: 30, roas: 2.65, status: "ativa" },
    ],
    creatives: [
      { id: 1, nome: "Vídeo — Hambúrguer em câmera lenta", tipo: "Vídeo", thumbnail: "🍔", compras: 186, retorno: 8420, ctr: 4.8 },
      { id: 2, nome: "Carrossel — Combo família", tipo: "Imagem", thumbnail: "🍕", compras: 124, retorno: 5610, ctr: 3.6 },
      { id: 3, nome: "Vídeo — Cozinha ao vivo", tipo: "Vídeo", thumbnail: "🎥", compras: 78, retorno: 3210, ctr: 3.1 },
      { id: 4, nome: "Imagem — Sobremesa do dia", tipo: "Imagem", thumbnail: "🍰", compras: 24, retorno: 699, ctr: 1.9 },
    ],
  },

  "30 dias": {
    summary: {
      investido: 17200,
      retorno: 75900,
      compras: 1648,
      ticketMedio: 46.05,
      roas: 4.41,
      cpa: 10.44,
      variacao: { investido: 8.1, retorno: 21.3, compras: 18.7, roas: 12.2, ticketMedio: 4.1 },
    },
    chartLabel: "Últimos 30 dias (por semana)",
    chartData: [
      { dia: "Sem 1", investido: 3800, retorno: 16200 },
      { dia: "Sem 2", investido: 4100, retorno: 18500 },
      { dia: "Sem 3", investido: 4600, retorno: 20800 },
      { dia: "Sem 4", investido: 4700, retorno: 20400 },
    ],
    campaigns: [
      { id: 1, nome: "Combo Família — Fim de Semana", plataforma: "Meta Ads", investido: 4960, retorno: 27280, compras: 592, roas: 5.5, status: "ativa" },
      { id: 2, nome: "Promo Almoço Executivo", plataforma: "Meta Ads", investido: 3920, retorno: 17240, compras: 408, roas: 4.4, status: "ativa" },
      { id: 3, nome: "Retargeting — Carrinho Abandonado", plataforma: "Google Ads", investido: 2560, retorno: 14320, compras: 312, roas: 5.59, status: "ativa" },
      { id: 4, nome: "Lançamento Novo Sabor", plataforma: "Meta Ads", investido: 3280, retorno: 10560, compras: 216, roas: 3.22, status: "pausada" },
      { id: 5, nome: "Sobremesas — Happy Hour", plataforma: "TikTok Ads", investido: 2480, retorno: 6500, compras: 120, roas: 2.62, status: "ativa" },
    ],
    creatives: [
      { id: 1, nome: "Vídeo — Hambúrguer em câmera lenta", tipo: "Vídeo", thumbnail: "🍔", compras: 744, retorno: 33680, ctr: 4.7 },
      { id: 2, nome: "Carrossel — Combo família", tipo: "Imagem", thumbnail: "🍕", compras: 496, retorno: 22440, ctr: 3.5 },
      { id: 3, nome: "Vídeo — Cozinha ao vivo", tipo: "Vídeo", thumbnail: "🎥", compras: 312, retorno: 12840, ctr: 3.0 },
      { id: 4, nome: "Imagem — Sobremesa do dia", tipo: "Imagem", thumbnail: "🍰", compras: 96, retorno: 2799, ctr: 1.8 },
    ],
  },

  "Mês": {
    summary: {
      investido: 19500,
      retorno: 82400,
      compras: 1810,
      ticketMedio: 45.52,
      roas: 4.22,
      cpa: 10.77,
      variacao: { investido: 14.3, retorno: 19.8, compras: 16.2, roas: 4.8, ticketMedio: -1.2 },
    },
    chartLabel: "Maio 2026 (por semana)",
    chartData: [
      { dia: "Sem 1", investido: 4200, retorno: 17800 },
      { dia: "Sem 2", investido: 4800, retorno: 20100 },
      { dia: "Sem 3", investido: 5100, retorno: 22600 },
      { dia: "Sem 4", investido: 5400, retorno: 21900 },
    ],
    campaigns: [
      { id: 1, nome: "Combo Família — Fim de Semana", plataforma: "Meta Ads", investido: 5640, retorno: 29760, compras: 648, roas: 5.28, status: "ativa" },
      { id: 2, nome: "Promo Almoço Executivo", plataforma: "Meta Ads", investido: 4410, retorno: 18810, compras: 448, roas: 4.27, status: "ativa" },
      { id: 3, nome: "Retargeting — Carrinho Abandonado", plataforma: "Google Ads", investido: 2880, retorno: 15580, compras: 342, roas: 5.41, status: "ativa" },
      { id: 4, nome: "Lançamento Novo Sabor", plataforma: "Meta Ads", investido: 3900, retorno: 11250, compras: 244, roas: 2.88, status: "pausada" },
      { id: 5, nome: "Sobremesas — Happy Hour", plataforma: "TikTok Ads", investido: 2670, retorno: 7000, compras: 128, roas: 2.62, status: "ativa" },
    ],
    creatives: [
      { id: 1, nome: "Vídeo — Hambúrguer em câmera lenta", tipo: "Vídeo", thumbnail: "🍔", compras: 816, retorno: 37100, ctr: 4.9 },
      { id: 2, nome: "Carrossel — Combo família", tipo: "Imagem", thumbnail: "🍕", compras: 544, retorno: 24760, ctr: 3.7 },
      { id: 3, nome: "Vídeo — Cozinha ao vivo", tipo: "Vídeo", thumbnail: "🎥", compras: 342, retorno: 14050, ctr: 3.1 },
      { id: 4, nome: "Imagem — Sobremesa do dia", tipo: "Imagem", thumbnail: "🍰", compras: 108, retorno: 3490, ctr: 1.9 },
    ],
  },
};

export function getPeriodData(period: Period): PeriodData {
  return allData[period];
}
