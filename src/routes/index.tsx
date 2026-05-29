import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de Resultados — Tráfego Pago" },
      { name: "description", content: "Acompanhe o desempenho das suas campanhas de delivery em tempo real." },
      { property: "og:title", content: "Painel de Resultados" },
      { property: "og:description", content: "Resumo de campanhas, criativos e vendas na palma da mão." },
    ],
  }),
  component: Dashboard,
});
