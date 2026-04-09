# Documento Técnico de Integração — Backend Accurack ML Manager

**Destinatário:** Desenvolvedor responsável pelo backend / Claude Code  
**Assunto:** Mapeamento completo de endpoints, campos e fontes de dados para integração do frontend  
**Projeto:** Accurack — Sistema de gestão automatizada Mercado Livre  
**Data:** Abril/2026  

---

## Contexto Geral

O frontend está 100% construído com dados mock em `src/mock/data.ts`.  
Todas as interfaces TypeScript e nomes de campos já estão definidos e servem como **contrato de dados**.  
A integração consiste em substituir os imports de `data.ts` por chamadas reais à API, sem alterar nenhum componente de UI.

**Contas gerenciadas:** 4 contas Mercado Livre (Toyo, SAC, Oficial, Denzel)  
**Volume:** ~15.000 anúncios ativos  
**Base de origem SC:** vendedor em Santa Catarina (impacta cálculo de ICMS interestadual)

---

## Arquitetura de Dados — Fontes

| Sigla | Fonte | Descrição |
|-------|-------|-----------|
| **ML** | API Mercado Livre | Dados de anúncios, pedidos, campanhas, saúde, frete |
| **ERP** | Sistema interno (Anymarket ou similar) | CMV, custo unitário, estoque físico |
| **CALC** | Calculado no backend | ICMS, margens, cobertura de estoque, sugestões |
| **DB** | Banco de dados próprio | Correções, histórico, configurações de conta |

---

## Módulo T1 — Dashboard Geral (`/`)

### Endpoint sugerido
```
GET /api/dashboard?period=30&accountId=all
```

### Campos e fontes — `ACCOUNTS[]`
| Campo | Tipo | Fonte | Campo ML / ERP |
|-------|------|-------|----------------|
| `id` | number | DB | ID interno da conta |
| `name` | string | DB | Nome da conta (ex: "Conta Toyo (01)") |
| `slug` | string | DB | Identificador interno |
| `level` | string | ML | `reputation.level_id` (ex: `5_green`) |
| `powerSeller` | string | ML | `reputation.power_seller_status` |
| `claimsRate` | number | ML | `reputation.metrics.claims.rate` |
| `cancellationsRate` | number | ML | `reputation.metrics.cancellations.rate` |
| `delayedRate` | number | ML | `reputation.metrics.delayed_handling_time.rate` |
| `salesYesterday` | number | ML | Soma de `orders` do dia anterior |
| `salesTarget` | number | DB | Meta diária configurável por conta |
| `revenue30d` | number | ML | Soma de `total_amount` nos últimos 30 dias |
| `orders30d` | number | ML | Contagem de pedidos nos últimos 30 dias |
| `pendingDispatch` | number | ML | Pedidos com `order_status=paid` e `shipping_status=handling` |
| `unhealthy` | number | ML | Anúncios com `health.status=unhealthy` |
| `warning` | number | ML | Anúncios com `health.status=warning` |

### Campos e fontes — `DASHBOARD_KPIS`
| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `totalOrders30d` | number | ML | Total de pedidos (todas as contas) |
| `totalRevenue30d` | number | ML | Faturamento bruto total |
| `avgScore` | number | ML | Média ponderada do score de saúde dos anúncios |
| `itemsWithProblem` | number | ML | Anúncios unhealthy + warning |
| `compatPending` | number | ML | Anúncios com `compatibility_status=pending_suggestions` |
| `specsFillRate` | number | ML | % de atributos obrigatórios preenchidos |
| `freightOverSales` | number | CALC | `(custo_frete_total / faturamento_total) * 100` |
| `stockRisk` | number | CALC | Itens com cobertura < 15 dias |

### Campos e fontes — `DAILY_SALES[]`
| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `date` | string | CALC | Data no formato `DD/MM` |
| `qty_1..4` | number | ML | Vendas por conta no dia |
| `revenue_1..4` | number | ML | Receita por conta no dia |
| `qty` / `revenue` | number | CALC | Totais consolidados |

### Campos e fontes — `PROBLEMS[]`
| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `type` | string | DB | Identificador do tipo de problema |
| `label` | string | DB | Texto exibido |
| `count` | number | ML/CALC | Contagem atual do problema |
| `severity` | string | CALC | `"red"` ou `"yellow"` conforme thresholds configuráveis |

---

## Módulo T2 — Saúde dos Anúncios (`/saude` e `/saude/:itemId`)

### Endpoint — Lista
```
GET /api/items?accountId=&status=&curve=&page=1&limit=50
```

### Endpoint — Detalhe
```
GET /api/items/:mlbId
```

### Campos — `ITEMS[]` (lista)
| Campo | Tipo | Fonte | Campo ML / ERP |
|-------|------|-------|----------------|
| `id` | string | ML | `item_id` (ex: `MLB10000001`) |
| `title` | string | ML | `title` |
| `sku` | string | ERP | SKU interno do produto |
| `accountId` | number | DB | ID interno da conta |
| `score` | number | ML | Score calculado pelo ML ou backend (0–100) |
| `specsPercent` | number | ML | % de atributos preenchidos |
| `price` | number | ML | `price` |
| `stock` | number | ERP | Estoque físico disponível |
| `sales30d` | number | ML | Vendas nos últimos 30 dias |
| `revenue30d` | number | ML | Receita nos últimos 30 dias |
| `status` | string | ML | `health.status`: `healthy`, `warning`, `unhealthy` |
| `curve` | string | CALC | Curva ABC por volume de venda: `A`, `B`, `C` |
| `compatStatus` | string | ML | `compatibility_status` |
| `hasEan` | boolean | ML | `gtin` preenchido |
| `conversionRate` | number | ML | Visitas / vendas |
| `avgRating` | number | ML | Avaliação média |
| `totalReviews` | number | ML | Quantidade de avaliações |

### Campos adicionais — `ITEM_DETAIL` (página de detalhe)
| Campo | Tipo | Fonte | Campo ML / ERP |
|-------|------|-------|----------------|
| `permalink` | string | ML | URL do anúncio |
| `sales.d30/d60/d90/d120` | number | ML | Vendas por período |
| `priceCompetition.current` | number | ML | Preço atual |
| `priceCompetition.suggested` | number | ML | `catalog_price` ou preço sugerido pelo ML |
| `priceCompetition.gap` | number | CALC | `(current - suggested) / suggested * 100` |
| `specs[]` | array | ML | `attributes[]` — `id`, `name`, `value_name` |
| `tags[]` | array | ML | `tags[]` do anúncio |
| `pendingActions[]` | array | CALC | Backend gera lista de ações com `scoreGain` estimado |
| `dailySales[]` | array | ML | Histórico diário de vendas |

---

## Módulo T3 — Estoque (`/estoque`)

### Endpoint sugerido
```
GET /api/stock?accountId=&riskOnly=false
```

### Campos — `STOCK_ITEMS[]`
Herda todos os campos de `ITEMS[]` mais:

| Campo | Tipo | Fonte | Cálculo |
|-------|------|-------|---------|
| `stock` | number | ERP | Estoque físico atual |
| `salesPerDay` | number | CALC | `sales30d / 30` |
| `coverageDays` | number | CALC | `stock / salesPerDay` (999 se sem venda) |
| `targetStock` | number | CALC | `Math.ceil(salesPerDay * 30)` — meta de 30 dias |
| `suggestedBuy` | number | CALC | `Math.max(0, targetStock - stock)` |

> **Nota ERP:** O campo `stock` deve vir do ERP (Anymarket/Bling/TOTVS) via sincronização. O ML não tem o estoque real, apenas o estoque publicado no anúncio.

---

## Módulo T4 — Ads / Campanhas (`/ads`)

### Endpoint sugerido
```
GET /api/ads/campaigns?accountId=&period=30
GET /api/ads/items?accountId=&campaignId=
```

### Campos — `CAMPAIGNS[]`
| Campo | Tipo | Fonte | Campo ML Ads API |
|-------|------|-------|-----------------|
| `id` | string | ML | `campaign_id` |
| `accountId` | number | DB | ID interno |
| `status` | string | ML | `status`: `active`, `paused` |
| `name` | string | ML | `name` |
| `dailyBudget` | number | ML | `daily_budget` |
| `roasTarget` | number | DB | Meta interna configurável |
| `impressions` | number | ML | `impressions` |
| `clicks` | number | ML | `clicks` |
| `cost` | number | ML | `spent` |
| `roas` | number | CALC | `revenue / cost` |
| `acos` | number | CALC | `cost / revenue * 100` |
| `salesProductAds` | number | ML | `units_sold_product_ads` |
| `salesNoProductAds` | number | ML | `units_sold_no_product_ads` |
| `revenue` | number | ML | `revenue` (total atribuído à campanha) |
| `cpc` | number | CALC | `cost / clicks` |
| `winRate` | number | ML | % de leilões ganhos |
| `lostBudget` | number | ML | % perdido por orçamento |
| `lostRanking` | number | ML | % perdido por posição |
| `adsCount` | number | ML | Quantidade de anúncios na campanha |
| `diagnosis` | string | CALC | Calculado: `roas >= roasTarget` → `excelente`, etc. |

---

## Módulo T5 — Frete (`/frete`)

### Endpoint sugerido
```
GET /api/freight?accountId=&period=30
```

### Campos — `FREIGHT_ITEMS[]`
Herda `ITEMS[]` mais:

| Campo | Tipo | Fonte | Campo ML |
|-------|------|-------|----------|
| `freightCost` | number | ML | Custo médio de frete por unidade vendida |
| `freightPercent` | number | CALC | `freightCost / price * 100` |
| `shippingMode` | string | ML | `shipping.mode`: `fulfillment`, `xd_drop_off`, `cross_docking` |
| `freeShipping` | boolean | ML | `shipping.free_shipping` |
| `freightChanged` | boolean | ML | Frete foi alterado pelo ML nos últimos 30 dias |
| `freightChangePct` | number | ML | `%` de variação no custo do frete |

### Campos — `FREIGHT_BY_STATE[]`
| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `state` | string | ML | UF do comprador (`buyer.address.state`) |
| `sales` | number | ML | Pedidos para aquela UF no período |
| `avgFreight` | number | ML | Custo médio de frete para a UF |
| `freightPct` | number | CALC | `avgFreight / avgRevenue * 100` |

---

## Módulo T6 — Correções Automáticas (`/correcoes`)

### Endpoint sugerido
```
GET  /api/corrections?status=&type=&accountId=
POST /api/corrections/:id/approve
POST /api/corrections/:id/reject
POST /api/corrections/:id/execute
```

### Campos — `CORRECTIONS[]`
| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `id` | number | DB | ID interno |
| `itemId` | string | ML | MLB do anúncio |
| `itemTitle` | string | ML | Título do anúncio |
| `type` | string | DB | `specs_fill`, `ean_fill`, `compat_fill`, `title_optimize`, `price_adjust` |
| `route` | string | DB | `anymarket` ou `ml_direct` — via onde aplica a correção |
| `fieldName` | string | ML | Campo a ser corrigido (ex: `GTIN`, `Marca`) |
| `oldValue` | string | ML | Valor atual |
| `newValue` | string | CALC/DB | Valor sugerido |
| `estimatedScoreGain` | number | CALC | Score gain estimado se aplicado |
| `status` | string | DB | `pending`, `approved`, `rejected`, `executed` |
| `executionMode` | string | DB | `auto` (executa sem aprovação) ou `approval` |
| `createdAt` | string | DB | ISO timestamp |
| `executedAt` | string\|null | DB | ISO timestamp da execução |

> **Fluxo de execução:** Correções com `executionMode=auto` são aplicadas automaticamente. As com `approval` ficam pendentes e aguardam clique do usuário na interface.

---

## Módulo T7 — Preços (`/precos`)

### Endpoint sugerido
```
GET  /api/prices?accountId=&suggestionStatus=
POST /api/prices/:itemId/apply-suggestion
```

### Campos — `PRICE_ITEMS[]`
Herda `ITEMS[]` mais:

| Campo | Tipo | Fonte | Campo ML |
|-------|------|-------|----------|
| `suggestedPrice` | number | ML | `catalog_price` ou sugestão do motor de precificação |
| `gap` | number | CALC | `(price - suggestedPrice) / suggestedPrice * 100` |
| `hasNotMarketPrice` | boolean | ML | `NOT_MARKET_PRICE` tag ativa |
| `minPrice` | number | ML | Menor preço do mercado para o mesmo catálogo |
| `maxPrice` | number | ML | Maior preço concorrente |
| `competitors` | number | ML | Qtd de vendedores no mesmo catálogo |
| `suggestionStatus` | string | CALC | `above_suggestion`, `below_suggestion`, `competitive` |
| `priceHistory[]` | array | ML | Histórico de preços dos últimos 30 dias |

### Campos — `PRICE_SUMMARY`
| Campo | Tipo | Fonte |
|-------|------|-------|
| `itemsWithSuggestion` | number | CALC |
| `aboveSuggestion` | number | CALC |
| `notMarketPrice` | number | ML |
| `avgGap` | number | CALC |

---

## Módulo T8 — Compatibilidades (`/compatibilidade`)

### Endpoint sugerido
```
GET  /api/compat?accountId=&status=
POST /api/compat/:itemId/apply
GET  /api/compat/vehicle-catalog
```

### Campos — `COMPATIBILITIES[]`
Herda `ITEMS[]` mais:

| Campo | Tipo | Fonte | Descrição |
|-------|------|-------|-----------|
| `suggestionsCount` | number | ML | Sugestões de compatibilidade pendentes |
| `vehicles[]` | string[] | ML | Veículos já associados |
| `compatStatus` | string | ML | `complete`, `pending_suggestions`, `incomplete` |

### Catálogo de veículos — `VEHICLE_CATALOG`
Estrutura: `{ Marca: { Modelo: [anos] } }`  
Fonte: ML API — `/categories/:catId/attributes` + base própria DENATRAN/SINDIPEÇAS

---

## Módulo T9 — Lucratividade por Venda (`/lucratividade`)

Este é o módulo mais complexo. Os dados cruzam **3 fontes diferentes**.

### Endpoint sugerido
```
GET /api/profitability?accountId=&dateFrom=&dateTo=
```

### Campos — `SALES_PROFITABILITY[]`

#### Dados do pedido — Fonte: **ML API**
| Campo | Tipo | Campo ML | Descrição |
|-------|------|----------|-----------|
| `id` | string | `order_id` | ID do pedido ML |
| `date` | string | `date_created` | Data da venda `DD/MM/YYYY` |
| `title` | string | `order_items[0].item.title` | Nome do produto |
| `sku` | string | `order_items[0].item.seller_sku` | SKU do produto |
| `accountId` | number | DB | Conta vendedora |
| `qty` | number | `order_items[0].quantity` | Quantidade vendida |
| `unitPrice` | number | `order_items[0].unit_price` | Preço unitário |
| `revenue` | number | `total_amount` | Receita bruta |
| `buyerState` | string | `shipping.receiver_address.state` | UF do comprador |

#### Dados financeiros ML — Fonte: **ML API (Payments / Billing)**
| Campo | Tipo | Campo ML | Descrição |
|-------|------|----------|-----------|
| `mlCommission` | number | `fee_details[type=ml_fee].amount` | Comissão cobrada pelo ML |
| `mlCommissionRate` | number | CALC | `mlCommission / revenue` |
| `shippingCost` | number | `fee_details[type=shipping].amount` | Custo real de frete cobrado pelo ML |
| `adsCost` | number | ML Ads API | Custo de Product Ads atribuído ao pedido |

#### Dados do ERP — Fonte: **ERP**
| Campo | Tipo | Origem | Descrição |
|-------|------|--------|-----------|
| `unitCost` | number | ERP | Custo unitário (CMV) do produto |
| `cmv` | number | CALC | `unitCost * qty` |
| `packagingCost` | number | ERP/DB | Custo de embalagem por unidade |

#### ICMS — Fonte: **Calculado (backend)**
| Campo | Tipo | Fórmula | Descrição |
|-------|------|---------|-----------|
| `icmsInterstateRate` | number | 0.026 fixo (SC) | Alíquota interestadual SC → destino |
| `icmsDifal` | number | `DIFAL_RATES[buyerState]` | DIFAL do estado destino |
| `taxRate` | number | SC interno=0.07; outros=0.026+DIFAL | Taxa total de ICMS |
| `taxAmount` | number | `revenue * taxRate` | Valor do ICMS |

**Tabela DIFAL por estado (base de cálculo):**
```
SP: 9%, MG: 10%, RJ: 10%, PR: 9%, RS: 9%, BA: 12%, GO: 11%,
PE: 11%, CE: 10%, MT: 11%, MS: 10%, DF: 10%, ES: 10%,
AM: 12%, PA: 11%, RN: 10%, PI: 10%, AL: 10%, SE: 10%,
MA: 12%, RO: 11%, AC: 12%, AP: 11%, RR: 12%, TO: 10%
SC (interno): 7% (não aplica interestadual+DIFAL)
```

#### Resultados calculados
| Campo | Tipo | Fórmula |
|-------|------|---------|
| `totalDeductions` | number | `mlCommission + shippingCost + adsCost + taxAmount` |
| `totalCosts` | number | `cmv + packagingCost + totalDeductions` |
| `grossProfit` | number | `revenue - cmv` |
| `grossMargin` | number | `grossProfit / revenue * 100` |
| `netProfit` | number | `revenue - totalCosts` |
| `netMargin` | number | `netProfit / revenue * 100` |

**Regras de cor de margem (frontend já implementado):**
- `netMargin > 10%` → Verde
- `netMargin 0% a 10%` → Amarelo
- `netMargin < 0%` → Vermelho

---

## Autenticação e Headers

Todas as chamadas ao backend devem incluir:

```http
Authorization: Bearer {session_token}
X-Account-Id: {accountId | "all"}
Content-Type: application/json
```

O frontend já possui `GlobalContext` com `selectedAccountId`. Quando o usuário seleciona uma conta no header, o valor é `1..4`. Quando "Todas as contas" está selecionado, o valor é `null` — o backend deve tratar `null` como "sem filtro de conta".

---

## Estrutura de substituição no frontend

Cada módulo importa seus dados de `data.ts`. Para integrar, basta substituir o import por um hook `useQuery`:

**Antes (mock):**
```typescript
import { ITEMS } from "@/mock/data";
// ... usar ITEMS diretamente
```

**Depois (real):**
```typescript
import { useQuery } from "@tanstack/react-query";
// React Query já está configurado no App.tsx

const { data: items = [], isLoading } = useQuery({
  queryKey: ["/api/items", { accountId, status, period }],
  queryFn: () => fetch(`/api/items?accountId=${accountId}&period=${period}`)
                   .then(r => r.json()),
});
```

Os tipos TypeScript já estão declarados — `SaleProfitability`, `Campaign`, etc. A resposta da API deve respeitar exatamente esses tipos.

---

## Ordem de prioridade de integração sugerida

| Prioridade | Módulo | Motivo |
|-----------|--------|--------|
| 1 | T1 — Dashboard Geral | Visão consolidada, mais usada |
| 2 | T9 — Lucratividade | Impacto financeiro direto |
| 3 | T2 — Saúde dos Anúncios | Volume alto de itens |
| 4 | T4 — Ads | Otimização de gasto |
| 5 | T3 — Estoque | Evitar ruptura |
| 6 | T7 — Preços | Competitividade |
| 7 | T5 — Frete | Controle de custo |
| 8 | T6 — Correções | Automação de qualidade |
| 9 | T8 — Compatibilidades | Melhoria de conversão |

---

## Contato técnico

Para dúvidas sobre os campos específicos de cada módulo, a referência completa está em:
- **Contrato de dados:** `artifacts/ml-dashboard/src/mock/data.ts`
- **Tipos TypeScript:** exportados junto dos dados no mesmo arquivo
- **Componentes de UI:** `artifacts/ml-dashboard/src/pages/` — cada arquivo corresponde a uma rota

Qualquer campo não listado neste documento que apareça no `data.ts` segue o mesmo padrão de fontes descrito acima.
