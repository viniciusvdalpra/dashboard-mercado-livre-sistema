# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## ML Dashboard (`artifacts/ml-dashboard`)

Frontend de gestão centralizada para Mercado Livre (4 contas, ~15.000 anúncios de autopeças).

**Stack:** React + Vite + TypeScript + shadcn/ui + Recharts + Wouter

**Design:** Accurack-inspired — sidebar branca, teal #0d9488 como primária, fundo cinza-azulado `hsl(210 25% 96%)`, cards brancos com sombras reais, Inter font. Todo texto em pt-BR.

**Rotas:**
- `/login` — Login gate split-panel: painel teal esquerdo (logo + stats) + formulário direito limpo
- `/` — T1: Dashboard Geral (4 contas, KPIs accent + standard, gráfico de área, problemas, cards de conta)
- `/saude` — T2: Saúde dos Anúncios (quick filter tabs com contagens, search, paginação 25/pág, batch select)
- `/saude/:itemId` — T2b: Detalhe do item (ficha técnica editável, compat., vendas, ações)
- `/estoque` — T3: Estoque (cobertura em dias, filtros laterais, gráfico horizontal, tabela)
- `/ads` — T4: Ads (ROAS por item, gráfico top 12, recomendações por faixa de ROAS, tabela)
- `/frete` — T5: Frete (incidência %, filtros, gráfico por conta, tabela com badge de situação)
- `/correcoes` — T6: Correções (tabs status + tipo, aprovação individual e em lote, paginação)
- `/precos` — T7: Preços (minPrice/maxPrice/competitors, enviar à fila, badge de situação)

**Dados:** Apenas mock data em `src/mock/data.ts`. Nunca conecta ao backend.

**Mock data — campos importantes:**
- `ITEMS`: id, accountId, accountName, title, sku, price, stock, sales30d, score, status, compatStatus, specsPercent, hasEan, hasNegativeTag, curve, thumbnail, totalReviews
- `FREIGHT_ITEMS`: spread de ITEMS + freightCost, freightPercent (inteiro 5-25), shippingMode, freeShipping, freightChanged, freightChangePct
- `PRICE_ITEMS`: spread de ITEMS + suggestedPrice, gap, minPrice, maxPrice, competitors, hasNotMarketPrice, suggestionStatus, priceHistory
- `CORRECTIONS`: id (number), itemId, itemTitle, accountId, accountName, type (specs_fill/ean_fill/etc), oldValue, newValue, status (pending/approved/executed/rejected)
- `ADS_METRICS`: id, accountId, title, cost, directUnits, directAmount, roas, ctr, clicks, impressions, campaignId

**Componentes:**
- `Layout` — sidebar branca com sections, header com search/bell/account selector/avatar, breadcrumb
- `PageHeader` — cabeçalho padronizado de página com título, subtítulo e ações
- `KpiCard` — dois modos: `accent` (gradiente teal escuro, glow) e standard (branco com badge colorida de ícone)
- `ScoreBar`, `StatusBadge` — indicadores de saúde de anúncio
- `GlobalContext` — isLoggedIn + selectedAccountId (null = todas as contas)
