# Studio Tracker — Mapa de Caminhos

## 📍 Visão Geral

Dashboard mobile-first (TanStack React Start + Tailwind) para acompanhamento de campanhas de tráfego pago para delivery. Deploy: Vercel via Nitro `vercel` preset.

**Stack:** React 19 | TanStack Router | TanStack Query | Recharts | Tailwind CSS 4 | shadcn/ui

---

## 🗂️ Estrutura Principal

```
src/
├── components/dashboard/
│   ├── Dashboard.tsx          ← Página principal (header + sections)
│   ├── data.ts                ← Dados por período + tipos (Period, Campaign, Creative)
│   ├── CampaignList.tsx       ← Lista de campanhas (recebe campaigns[])
│   ├── CreativesList.tsx      ← Criativos (recebe creatives[])
│   ├── PerformanceChart.tsx   ← Gráfico Recharts (recebe data[])
│   └── MetricCard.tsx         ← Card reutilizável (icon + value + delta)
│
├── routes/
│   ├── __root.tsx             ← Shell HTML + provider QueryClient
│   └── index.tsx              ← "/" → <Dashboard />
│
├── lib/
│   ├── utils.ts               ← currency(), cn() — centralizados
│   ├── config.server.ts       ← Env server-only
│   ├── error-*.ts             ← Error handling Lovable
│   └── api/example.functions.ts ← Template server function (Nitro/Edge)
│
└── styles.css                 ← CSS vars (OKLCH), Tailwind, design tokens
```

---

## 🔑 Arquivos-Chave

| Arquivo | Função | Quando mexer |
|---------|--------|-------------|
| `data.ts` | `Period` type + `getPeriodData(period)` | Adicionar período / editar dados |
| `Dashboard.tsx` | Layout da página (Header + sections) | Mudar ordem, adicionar seção |
| `utils.ts` | `currency(v)`, `cn()` | Adicionar helper geral |
| `vite.config.ts` | Config TanStack + Nitro preset "vercel" | Mudar target deploy |
| `vercel.json` | Build/install commands | Setup Vercel inicial |
| `tsconfig.json` | Alias `@/*` → `./src/*` | Paths/strict mode |

---

## 📊 Como Adicionar uma Métrica

1. **Em `data.ts`:** Adicione campo em `PeriodSummary` + todos os 4 períodos
2. **Em `Dashboard.tsx`:** Importe `MetricCard` + renderize (veja grid cols-2)
3. **Em `utils.ts`:** Se precisar de format especial (ex: `percentageFormat`), crie lá

Exemplo:
```tsx
// data.ts
export type PeriodSummary = {
  // ... existentes
  ctc: number;  // novo
};

// Dashboard.tsx
<MetricCard icon={Percent} label="CTC" value={`${s.ctc}%`} delta={...} />
```

---

## 📈 Período × Dados

- **`periods`** = `["Hoje", "7 dias", "30 dias", "Mês"]`
- **`getPeriodData(period)`** → retorna `{ summary, chartData, campaigns, creatives, chartLabel }`
- Dashboard setState `period` → chama `getPeriodData` → renderiza

Para testar: clique nos botões do header → deve mudar dados + gráfico.

---

## 🚀 Deploy na Vercel

1. Em [vercel.com/new](https://vercel.com/new): Import GitHub → Studio-Tracker
2. Build Command: `npm run build` ✓
3. Install: `npm install` ✓
4. Output Directory: deixe branco (Nitro `vercel` gera `.vercel/output/`)
5. Deploy

Nitro auto-gera API serverless functions em `/api/*` (não usar agora, exemplo só em `example.functions.ts`).

---

## 🎨 Design System

**Cores** (OKLCH em `styles.css`):
- Primary: `oklch(0.62 0.26 295)` = violeta vibrante
- Success: `oklch(0.78 0.2 160)` = verde
- Warning: `oklch(0.82 0.18 85)` = amarelo

**Sombras:** `shadow-soft`, `shadow-card`, `shadow-glow`

**Spacing:** Tailwind default (4px = 1 unit)

---

## 🔄 Fluxo de Dados

```
useState(period) → getPeriodData(period) → {summary, chartData, campaigns, creatives}
                ↓
         <Dashboard>
         ├─ MetricCard (summary)
         ├─ PerformanceChart (chartData)
         ├─ CampaignList (campaigns)
         └─ CreativesList (creatives)
```

Todos os componentes filhos recebem dados **como props** (sem Redux/Context).

---

## 📝 Convenções

- **Imports:** `import { currency } from "@/lib/utils"`
- **Tipos:** Centralizados em `data.ts`
- **Currency:** Sempre `currency(number)` em pt-BR BRL
- **HTML:** `lang="pt-BR"`, mensagens em português
- **Props:** Nomes descritivos (`campaigns`, `chartData`, não `data`)

---

## ⚠️ O Que NÃO Mexer

- `.lovable/` — metadados (ignorado em .gitignore)
- `.routeTree.gen.ts` — auto-gerado por TanStack Router
- `ui/` components — shadcn/ui, só usar via export

---

## 🔍 TypeScript Checks

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

No VS Code, Stripe mostra erros de tipo em tempo real.

---

## 🎯 Próximas Features (Ideias)

- [ ] Conectar Meta Graph API para dados reais
- [ ] Detalhe de campanha (route `/campaign/:id`)
- [ ] Filtro de data customizado
- [ ] Export CSV de logs
- [ ] Dark mode toggle (CSS vars prontas)
