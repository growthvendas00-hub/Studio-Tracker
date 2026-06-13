# 🔗 Integração Facebook — Primeiros Passos

## ✅ O Que Já Foi Feito

### 1️⃣ Endpoints API (Server Functions Nitro)
**Arquivo:** `src/lib/api/facebook.functions.ts`

- **`validateFacebookToken()`** — Testa se o token é válido
- **`fetchFacebookCampaigns()`** — Lista todas as campanhas do business account
- **`fetchCampaignInsights()`** — Busca métricas (spend, impressions, clicks, etc) de uma campanha

### 2️⃣ Componente de Conexão UI
**Arquivo:** `src/components/facebook/FacebookConnect.tsx`

- Input para colar access token
- Validação em tempo real
- Armazena token em localStorage
- Exibe status "Conectado" com dados da conta
- Botão desconectar

### 3️⃣ Documentação
- **`.env.example`** — Variáveis necessárias
- **`README.SETUP.md`** — Guia completo para conseguir credenciais Facebook
- **`CLAUDE.md`** — Mapa de caminhos do projeto
- **`INTEGRATION.md`** — Este arquivo

---

## 🚀 Como Proceder Agora

### Passo 1: Conseguir Access Token Facebook

1. Vá para [developers.facebook.com/docs/marketing-api/get-started](https://developers.facebook.com/docs/marketing-api/get-started)
2. Crie uma App (type: Business)
3. Ativa Marketing API
4. Em Tools → Access Token Generator:
   - Selecione sua página/conta
   - Marque: `ads_read`, `read_insights`
   - Copie o token (válido por 60 dias)

### Passo 2: Setup Local (Testes)

```bash
# Clone o projeto (ou já tem)
cd Studio-Tracker

# Copie e preencha .env.local
cp .env.example .env.local

# Edite .env.local com suas credenciais:
# - META_BUSINESS_ACCOUNT_ID (encontra em business.facebook.com)
# - META_ACCESS_TOKEN (do paso 1)

# Instale dependências
npm install --legacy-peer-deps

# Rode localmente
npm run dev
# Acessa http://localhost:5173
```

### Passo 3: Testar Conexão Localmente

1. Na página do dashboard, encontre "Conectar ao Facebook"
2. Cole o access token
3. Clique "Conectar"
4. Se tudo ok → aparece "Conectado ao Facebook" com nome da conta

### Passo 4: Setup na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione projeto `Studio-Tracker`
3. Settings → Environment Variables
4. Adicione:
   ```
   META_BUSINESS_ACCOUNT_ID = seu_id
   META_ACCESS_TOKEN = seu_token
   META_AD_ACCOUNT_ID = act_xxxxxxxxxx
   ```
   > `META_AD_ACCOUNT_ID` fixa a SUA conta de anúncio. Sem ela, a dashboard usa a
   > primeira conta que a BM listar — numa BM compartilhada isso mistura anúncios
   > de terceiros. Pegue o ID em Gerenciador de Anúncios → o número após `act=` na
   > URL (aceita com ou sem o prefixo `act_`).
5. Redeploy (botão "Redeploy")

---

## 📊 Próxima Fase: Puxar Dados Reais

Depois que a conexão estiver funcionando, vamos:

1. **Criar rota `/campaign/:id`** — detalhe de uma campanha
2. **Substituir dados mock** — Dashboard puxará campanhas reais do `fetchFacebookCampaigns()`
3. **Atualizar insights** — Gráficos mostrarão métricas reais com `fetchCampaignInsights()`
4. **Sincronizar periódico** — Atualizar dados a cada X minutos

---

## 🔑 Estrutura de Dados (API Response)

### Campaign (após `fetchFacebookCampaigns()`)
```ts
{
  id: "123456",
  name: "Black Friday 2024",
  status: "ACTIVE" | "PAUSED" | "DELETED",
  objective: "CONVERSIONS" | "LINK_CLICKS" | "IMPRESSIONS",
  createdAt: "2024-05-29T10:30:00Z",
  dailyBudget: 50000, // em centavos
  lifetimeBudget: null,
  accountId: "act_123456",
  accountName: "Meu Anúncio",
}
```

### Insights (após `fetchCampaignInsights()`)
```ts
{
  campaign_id: "123456",
  campaign_name: "Black Friday 2024",
  spend: "1500.00", // em centavos
  impressions: 5000,
  clicks: 250,
  actions: [
    { action_type: "purchase", value: 50 },
    { action_type: "add_to_cart", value: 100 },
  ],
  purchase_roas: 4.2, // Return on Ad Spend
}
```

---

## 📝 Checklist

- [ ] Access token Facebook gerado
- [ ] Variáveis configuradas em `.env.local`
- [ ] Build local passa (`npm run build`)
- [ ] Dashboard abre e exibe componente de conexão
- [ ] Conexão validada com sucesso
- [ ] Variáveis adicionadas na Vercel
- [ ] Redeploy na Vercel bem-sucedido
- [ ] Dashboard ao vivo funciona (`https://studio-tracker-liard.vercel.app`)

---

## ❓ Problemas?

- **"Token inválido"** → Verifique se expirou (60 dias) ou se as permissões estão ativas
- **"Business Account ID não encontrado"** → Visite [business.facebook.com/settings](https://business.facebook.com/settings/info)
- **Build falha com "Cannot find module"** → Execute `npm install --legacy-peer-deps`

---

**Próximo passo:** Você consegue o token Facebook, fazemos o test local, e aí redeploy na Vercel. Avisa quando tiver o token! 🚀
