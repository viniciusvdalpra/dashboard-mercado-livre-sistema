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

**Design:** Finance Management Dashboard (Dribbble/Shakuro) — dark sidebar #0A0B09, cream #F5F4EF, âmbar #C6A339, verde #539616, vermelho #A60808. IBM Plex Sans. Todo texto em pt-BR.

**Rotas:**
- `/login` — Login gate (usuário + senha, qualquer valor válido)
- `/` — T1: Dashboard Geral (4 contas, KPIs, gráfico de vendas)
- `/saude` — T2: Saúde dos Anúncios (lista com quick filters, batch select)
- `/saude/:itemId` — T2b: Detalhe do item (ficha técnica editável, compat., vendas, ações)
- `/estoque` — T3: Estoque (cobertura em dias, filtros, gráfico)
- `/ads` — T4: Ads (ROAS por item, recomendações)
- `/frete` — T5: Frete (custo por UF, % sobre vendas)
- `/correcoes` — T6: Correções (tabs pendente/executada/rejeitada, aprovação em lote)
- `/precos` — T7: Preços (sugestão ML, gap %, not_market_price, enviar pra fila)

**Dados:** Apenas mock data em `src/mock/data.ts`. Nunca conecta ao backend.

**Componentes:** Layout (sidebar + header + account selector), GlobalContext (isLoggedIn + selectedAccountId), KpiCard, ScoreBar, StatusBadge.

**Port:** 19109
