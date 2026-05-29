# Setup — Integração Facebook

## 🔧 Variáveis de Ambiente

1. Copie `.env.example` → `.env.local` (local) ou `.env.production` (Vercel)
2. Preencha com suas credenciais Meta/Facebook

```bash
# Local
cp .env.example .env.local
# Depois edite .env.local
```

## 🔐 Credenciais Meta/Facebook

### Onde Conseguir

1. **Meta Business Account ID**
   - [business.facebook.com](https://business.facebook.com)
   - Settings → Business Settings → Business Information
   - Copie "Business ID"

2. **Access Token**
   - [developers.facebook.com/docs/marketing-api/get-started](https://developers.facebook.com/docs/marketing-api/get-started)
   - Create App → Marketing API
   - Tools → Access Token Generator
   - Selecione suas páginas/contas
   - Gera um token válido por 60 dias

3. **App ID + App Secret**
   - [developers.facebook.com/apps](https://developers.facebook.com/apps)
   - Crie uma App (tipo "Business")
   - Basic Settings → copie App ID
   - App Roles → App Secret (mostrado em Settings)

### Permissões Necessárias

No Access Token Generator, ative:
- ✅ `ads_read` — ler campanhas
- ✅ `ads_management` — gerenciar (opcional se só ler)
- ✅ `read_insights` — ler métricas/conversões

## 📡 Endpoints Planejados

| Endpoint | Método | O que faz |
|----------|--------|----------|
| `/api/facebook/auth` | POST | Valida access token |
| `/api/facebook/campaigns` | GET | Lista campanhas do business account |
| `/api/facebook/campaign/:id/insights` | GET | Puxas métricas de uma campanha |
| `/api/facebook/insights/daily` | GET | Insighs consolidados (período) |

## 🚀 Próximos Passos

1. ✅ Instalar `lodash` (dependência Recharts)
2. ⬜ Criar endpoint `/api/facebook/auth` (validação)
3. ⬜ Criar endpoint `/api/facebook/campaigns` (lista)
4. ⬜ Conectar ao frontend (remover dados mock, usar API real)
5. ⬜ Salvar campaigns no localStorage/DB
6. ⬜ Atualizar Dashboard com dados reais

## 📝 Verificar Dados Localmente

```bash
npm run dev
# Vai rodar em http://localhost:5173
```

Na Vercel:
```bash
vercel dev
# Simula Vercel local, pode testar /api endpoints
```

## 🔗 Documentação Meta

- [Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Campaign API](https://developers.facebook.com/docs/marketing-api/campaign)
- [Insights](https://developers.facebook.com/docs/marketing-api/insights)
