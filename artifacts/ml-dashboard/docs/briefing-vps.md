# Briefing para o Claude Code — Integração Backend VPS

**Contexto:** Este documento é um briefing para o agente de IA (Claude Code) que irá construir e configurar o backend na VPS. Leia tudo antes de agir.

---

## O que já existe (não construa novamente)

Um frontend React/TypeScript completo está pronto no Replit. Ele contém **9 páginas totalmente construídas** com dados mock, pronto para receber dados reais de uma API:

| Rota | Página |
|------|--------|
| `/` | Dashboard Geral |
| `/saude` | Saúde dos Anúncios |
| `/saude/:itemId` | Detalhe do Anúncio |
| `/estoque` | Estoque |
| `/ads` | Ads & Campanhas |
| `/frete` | Frete |
| `/correcoes` | Correções automáticas |
| `/precos` | Monitoramento de preços |
| `/lucratividade` | Lucratividade por venda |
| `/compatibilidade` | Vínculos em massa |

**Stack do frontend:** React 18 + Vite + TypeScript + TailwindCSS + Recharts + React Query (TanStack Query)

**Como o frontend chega na VPS:**
1. No Replit roda-se: `pnpm --filter @workspace/ml-dashboard run build:deploy`
2. Isso gera a pasta `artifacts/ml-dashboard/dist/public/` (HTML + JS + CSS estáticos)
3. Essa pasta é copiada para a VPS (ex: `/var/www/ml-dashboard`)
4. Nginx serve os arquivos estáticos e faz proxy das chamadas de API para o backend

---

## O que você precisa construir na VPS

### 1. Backend API (Node.js/Express ou Python/FastAPI)

Você deve construir uma API REST que exponha os endpoints abaixo. O frontend chamará esses endpoints usando `fetch()` com `Authorization: Bearer {token}`.

**Todos os endpoints aceitam o parâmetro `?accountId=1|2|3|4|all`** (filtrar por conta Mercado Livre).

### 2. Nginx configurado para servir o frontend + fazer proxy da API

### 3. Sistema de autenticação com JWT ou sessão

---

## Contas Mercado Livre

São **4 contas** gerenciadas. O backend precisa saber em qual conta está operando em cada request:

```
Conta 1 — Toyo     (ID: 1)
Conta 2 — SAC      (ID: 2)
Conta 3 — Oficial  (ID: 3)
Conta 4 — Denzel   (ID: 4)
```

O frontend envia `X-Account-Id: {1..4 | "all"}` em todo request. Quando `"all"`, retorne dados de todas as contas consolidados.

---

## Fontes de dados

| Sigla | Fonte |
|-------|-------|
| **ML** | API Mercado Livre (OAuth 2.0) |
| **ERP** | Anymarket / Bling / TOTVS — CMV e estoque físico |
| **CALC** | Calculado no backend (margens, cobertura, ICMS) |
| **DB** | Banco de dados próprio (correções, histórico, config) |

---

## Endpoints obrigatórios

### Autenticação

```
POST /api/auth/login
Body: { username, password }
Response: { token: string, user: { name, role } }

POST /api/auth/logout
Authorization: Bearer {token}
```

---

### T1 — Dashboard (`GET /api/dashboard`)

```json
{
  "accounts": [
    {
      "id": 1,
      "name": "Conta Toyo (01)",
      "slug": "toyo",
      "level": "5_green",
      "powerSeller": "platinum",
      "claimsRate": 0.008,
      "cancellationsRate": 0.011,
      "delayedRate": 0.032,
      "salesYesterday": 48,
      "salesTarget": 50,
      "revenue30d": 142680,
      "orders30d": 412,
      "pendingDispatch": 2,
      "unhealthy": 3,
      "warning": 8
    }
  ],
  "kpis": {
    "totalOrders30d": 1518,
    "totalRevenue30d": 484490,
    "avgScore": 72,
    "itemsWithProblem": 74,
    "compatPending": 128,
    "specsFillRate": 67,
    "freightOverSales": 12.4,
    "stockRisk": 38
  },
  "problems": [
    { "type": "compat", "label": "Compatibilidades pendentes", "count": 128, "severity": "red" },
    { "type": "dispatch", "label": "Despacho atrasado", "count": 8, "severity": "red" },
    { "type": "unhealthy", "label": "Anúncios unhealthy", "count": 26, "severity": "red" },
    { "type": "claims", "label": "Reclamações abertas", "count": 11, "severity": "yellow" },
    { "type": "warning", "label": "Anúncios em warning", "count": 48, "severity": "yellow" },
    { "type": "stock", "label": "Risco de ruptura", "count": 38, "severity": "yellow" },
    { "type": "returns", "label": "Devoluções recorrentes", "count": 7, "severity": "yellow" },
    { "type": "infractions", "label": "Infrações ativas", "count": 2, "severity": "red" }
  ],
  "dailySales": [
    {
      "date": "18/10",
      "qty_1": 12, "qty_2": 8, "qty_3": 18, "qty_4": 7,
      "qty": 45,
      "revenue_1": 4152, "revenue_2": 2488, "revenue_3": 5760, "revenue_4": 1911,
      "revenue": 14311
    }
  ]
}
```

> **CRÍTICO:** `dailySales` deve conter **exatamente 180 dias** de histórico diário (não menos). O frontend calcula internamente os períodos de comparação 7d/15d/30d/60d/90d usando os últimos N dias vs os N dias anteriores — isso requer 180 dias de dados.

---

### T2 — Saúde dos Anúncios (`GET /api/items`)

Parâmetros: `?accountId=&status=unhealthy|warning|healthy&page=1&limit=50`

```json
{
  "items": [
    {
      "id": "MLB10000001",
      "title": "Pastilha de Freio Bosch Gol 2021",
      "sku": "SKU-00001",
      "accountId": 1,
      "accountName": "Conta Toyo (01)",
      "imageUrl": "https://...",
      "score": 30,
      "specsPercent": 85,
      "price": 89.90,
      "stock": 50,
      "sales30d": 12,
      "revenue30d": 1078.80,
      "status": "unhealthy",
      "curve": "B",
      "compatStatus": "pending",
      "hasEan": true,
      "hasNegativeTag": false,
      "conversionRate": 0.043,
      "avgRating": 4.2,
      "totalReviews": 34
    }
  ],
  "total": 80,
  "page": 1
}
```

---

### T2b — Detalhe do Anúncio (`GET /api/items/:mlbId`)

```json
{
  "id": "MLB10000001",
  "title": "...",
  "permalink": "https://www.mercadolivre.com.br/...",
  "sales": { "d30": 12, "d60": 24, "d90": 35, "d120": 48 },
  "priceCompetition": {
    "current": 89.90,
    "suggested": 84.50,
    "gap": 6.4
  },
  "specs": [
    { "id": "BRAND", "name": "Marca", "value_name": "Bosch" }
  ],
  "tags": ["good_quality_thumbnail"],
  "pendingActions": [
    { "type": "add_ean", "description": "Adicionar EAN/GTIN", "scoreGain": 8 }
  ],
  "dailySales": [
    { "date": "18/10", "qty": 2, "revenue": 179.80 }
  ]
}
```

---

### T3 — Estoque (`GET /api/stock`)

Parâmetros: `?accountId=&riskOnly=false`

```json
{
  "items": [
    {
      "id": "MLB10000001",
      "title": "...",
      "sku": "SKU-00001",
      "accountId": 1,
      "accountName": "Conta Toyo (01)",
      "stock": 41,
      "sales30d": 6,
      "salesPerDay": 0.2,
      "coverageDays": 205,
      "targetStock": 6,
      "suggestedBuy": 0,
      "curve": "B"
    }
  ]
}
```

Fórmulas calculadas no backend:
- `salesPerDay = sales30d / 30`
- `coverageDays = stock / salesPerDay` (use 999 quando salesPerDay = 0)
- `targetStock = Math.ceil(salesPerDay * 30)`
- `suggestedBuy = Math.max(0, targetStock - stock)`

---

### T4 — Ads (`GET /api/ads`)

```json
{
  "summary": {
    "cost": 36031,
    "revenue": 257600,
    "roas": 7.1,
    "acos": 14.0,
    "salesAds": 153,
    "clicks": 10280,
    "impressions": 248000
  },
  "campaigns": [
    {
      "id": "camp_001",
      "name": "OF - Premium 500+",
      "accountId": 3,
      "accountName": "Conta Oficial (03)",
      "status": "active",
      "dailyBudget": 150,
      "roasTarget": 6,
      "roas": 11.2,
      "acos": 8.9,
      "cost": 3800,
      "revenue": 42560,
      "clicks": 1240,
      "impressions": 31000,
      "salesProductAds": 18,
      "winRate": 62,
      "lostBudget": 28,
      "lostRanking": 10,
      "diagnosis": "excelente",
      "adsCount": 12
    }
  ],
  "recommendations": [
    {
      "type": "increase_budget",
      "title": "Aumentar orçamento",
      "description": "3 campanhas limitadas por orçamento com ROAS acima da meta",
      "impact": "alto",
      "campaigns": ["camp_001"]
    }
  ]
}
```

---

### T5 — Frete (`GET /api/freight`)

```json
{
  "items": [
    {
      "id": "MLB10000001",
      "title": "...",
      "accountId": 1,
      "accountName": "Conta Toyo (01)",
      "price": 336.00,
      "freightCost": 37.00,
      "freightPercent": 11.0,
      "freeShipping": false,
      "freightType": "fulfillment",
      "stock": 16
    }
  ]
}
```

- `freightPercent = (freightCost / price) * 100`
- Thresholds: OK ≤ 10%, Atenção 10–18%, Crítico > 18%

---

### T6 — Correções (`GET /api/corrections`)

Parâmetros: `?accountId=&status=pending|approved|executed&type=compat|specs|ean|price|title`

```json
{
  "corrections": [
    {
      "id": 1,
      "itemId": "MLB10000001",
      "itemTitle": "Pastilha de Freio...",
      "accountId": 1,
      "accountName": "Conta Toyo (01)",
      "type": "specs_fill",
      "oldValue": "Monroe Old",
      "newValue": "Monroe",
      "status": "pending",
      "createdAt": "2026-04-01"
    }
  ]
}
```

Tipos de correção: `specs_fill`, `specs_hidden`, `ean_fill`, `compat_fill`, `title_optimize`, `price_adjust`

---

### T7 — Preços (`GET /api/prices`)

```json
{
  "items": [
    {
      "id": "MLB10000001",
      "title": "...",
      "accountId": 1,
      "accountName": "Conta Toyo (01)",
      "price": 349.00,
      "minPrice": 297.00,
      "maxPrice": 419.00,
      "suggestedPrice": 348.00,
      "competitors": 12,
      "competitorPrices": [340, 345, 349, 352, 360]
    }
  ]
}
```

---

### T9 — Lucratividade (`GET /api/profitability`)

Parâmetros: `?accountId=&period=7|15|30|60|90`

```json
{
  "sales": [
    {
      "id": "ML2025000154",
      "date": "30/03/2026",
      "title": "Tensor Correia Bosch 1987946...",
      "sku": "SKU-00154",
      "accountId": 3,
      "accountName": "Conta Oficial (03)",
      "qty": 1,
      "unitPrice": 81.66,
      "revenue": 81.66,
      "unitCost": 34.02,
      "cmv": 34.02,
      "mlCommission": 9.80,
      "mlCommissionRate": 0.12,
      "shippingCost": 8.91,
      "adsCost": 4.32,
      "packagingCost": 1.50,
      "taxAmount": 15.19,
      "taxRate": 0.186,
      "buyerState": "SP",
      "icmsDifal": 0.06,
      "totalDeductions": 38.22,
      "totalCosts": 73.74,
      "grossProfit": 47.64,
      "grossMargin": 58.3,
      "netProfit": 7.92,
      "netMargin": 9.7
    }
  ]
}
```

**Cálculo de ICMS (vendedor em SC):**
- SC → SC: `taxRate = 7%` (intraestadual)
- SC → outro estado: `taxRate = 2.6% + DIFAL[estado_destino]`

Tabela DIFAL:
```
AC=12%, AL=13.5%, AM=13%, AP=11%, BA=13.5%, CE=13%, DF=13%, ES=10%,
GO=12%, MA=16%, MG=6%, MS=10%, MT=10%, PA=12%, PB=13%, PE=13.5%,
PI=15.5%, PR=7.5%, RJ=8%, RN=13%, RO=12.5%, RR=13%, RS=5%,
SE=12%, SP=6%, TO=13%
```

---

## Headers obrigatórios em todo request

```http
Authorization: Bearer {session_token}
X-Account-Id: {1|2|3|4|all}
Content-Type: application/json
```

---

## Configuração nginx na VPS

```nginx
server {
    listen 80;
    server_name seudominio.com.br;

    # Frontend estático
    root /var/www/ml-dashboard;
    index index.html;

    # SPA — todas as rotas retornam o index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy da API para o backend local
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

> Com esse setup, o frontend e backend ficam no mesmo domínio — **sem necessidade de configurar CORS**.

Para HTTPS (recomendado em produção):
```bash
certbot --nginx -d seudominio.com.br
```

---

## Como receber o build do frontend

Cada vez que o frontend for atualizado no Replit, o fluxo é:

**No Replit:**
```bash
pnpm --filter @workspace/ml-dashboard run build:deploy
# Gera: artifacts/ml-dashboard/dist/public/
```

**Copiar para a VPS:**
```bash
rsync -avz --delete \
  artifacts/ml-dashboard/dist/public/ \
  usuario@seuip:/var/www/ml-dashboard/
```

Ou via Git: o `dist/public/` pode ser comitado em um repositório separado e a VPS faz `git pull`.

---

## Variável de ambiente no frontend

O arquivo `src/lib/api.ts` lê `VITE_API_URL`. Como frontend e backend estão no mesmo domínio com nginx fazendo proxy, **não é necessário configurar essa variável** — as chamadas `/api/*` vão direto para o proxy.

Se em algum momento o backend estiver em subdomínio separado (ex: `api.dominio.com`), crie `.env.production` com:
```
VITE_API_URL=https://api.dominio.com
```
E faça o build novamente.

---

## Substituição de mock por API real (padrão)

Cada página importa dados de `src/mock/data.ts`. Para integrar, substitua por React Query:

**Antes (mock):**
```typescript
import { ITEMS } from "@/mock/data";
// usa ITEMS diretamente no componente
```

**Depois (API real):**
```typescript
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

const { data: items = [], isLoading } = useQuery({
  queryKey: ["/api/items", { accountId, status }],
  queryFn: () =>
    fetch(apiUrl(`/api/items?accountId=${accountId ?? "all"}&status=${status}`), {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => d.items),
});
```

React Query já está instalado e configurado no projeto (`App.tsx`). Os tipos TypeScript para todos os dados estão em `src/mock/data.ts` — a resposta da API deve respeitar esses tipos exatamente.

---

## Ordem sugerida de integração (por prioridade)

| Prioridade | Módulo | Endpoint |
|-----------|--------|---------|
| 1 | Dashboard Geral | `GET /api/dashboard` |
| 2 | Lucratividade | `GET /api/profitability` |
| 3 | Saúde dos Anúncios | `GET /api/items` |
| 4 | Ads | `GET /api/ads` |
| 5 | Estoque | `GET /api/stock` |
| 6 | Preços | `GET /api/prices` |
| 7 | Frete | `GET /api/freight` |
| 8 | Correções | `GET /api/corrections` |

---

## Referência completa

Para detalhes campo a campo de cada endpoint (com referência às APIs do Mercado Livre):

```
artifacts/ml-dashboard/docs/integracao-backend.md
```

Para os tipos TypeScript completos e dados mock de exemplo:

```
artifacts/ml-dashboard/src/mock/data.ts
```
