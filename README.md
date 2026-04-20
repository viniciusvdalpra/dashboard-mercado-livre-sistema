# ML Dashboard — Armazem Auto Pecas

Dashboard de gestao automatizada para 4 contas Mercado Livre da Armazem Auto Pecas (Chapeco/SC), distribuidora de autopecas com ~10.000 anuncios ativos.

## Visao Geral

Sistema completo de monitoramento e gestao que cobre:

- **Dashboard Geral** — KPIs consolidados, faturamento por conta, grafico de vendas 180 dias
- **Saude dos Anuncios** — Score de saude, tags negativas, ficha tecnica, status por item
- **Estoque** — Cobertura em dias, risco de ruptura, sugestao de compra
- **Frete** — Custo de frete vs receita, breakdown por estado e conta
- **Correcoes** — Historico de correcoes automaticas (fichas tecnicas, EAN, titulos)
- **Precos** — Monitoramento de precos vs concorrencia, fila de atualizacao
- **Lucratividade** — P&L por pedido (CMV, comissao ML, frete, ICMS, ads, margem)
- **Compatibilidade** — Vinculos veiculo-item em massa (44 marcas, 400k+ vinculos)
- **Ads** — Product Ads: ROAS, ACOS, diagnostico por campanha (pendente scope ML)

## Arquitetura

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   Frontend (Replit)      │  HTTPS  │   Backend (VPS 195.200.5.96) │
│   React 19 + Vite       │────────▶│   FastAPI + PostgreSQL 16    │
│   Tailwind + shadcn/ui  │         │   Docker Compose             │
│   Recharts              │         │   APScheduler (20+ jobs)     │
└─────────────────────────┘         └──────────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Mercado Livre    │
                                    │  API (4 contas)   │
                                    └──────────────────┘
```

### Frontend (este repositorio)

- **Stack:** React 19, TypeScript, Vite 7, Tailwind CSS, shadcn/ui, Recharts, Wouter
- **Hospedagem:** Replit
- **API:** Consome `https://ml.armazemautopecas.com.br/api/`
- **Auth:** JWT Bearer token (POST /api/auth/login)
- **Fallback:** Mock data quando API indisponivel (IS_MOCK pattern)

### Backend (VPS separada)

- **Stack:** Python 3.11, FastAPI, SQLAlchemy async, APScheduler, Redis
- **Banco:** PostgreSQL 16 (~10k itens, ~400k compatibilidades, ~50k orders)
- **Repositorio:** github.com/viniciusvdalpra/ml-diagnostico
- **URL:** https://ml.armazemautopecas.com.br
- **Coletores:** 25+ coletores que sincronizam dados da API do ML automaticamente

## Estrutura do Projeto

```
artifacts/ml-dashboard/
├── src/
│   ├── components/      # Componentes reutilizaveis (Layout, KpiCard, PageHeader, etc.)
│   ├── contexts/        # GlobalContext (auth + conta selecionada)
│   ├── hooks/           # useApiData (fetch + mock fallback), use-toast
│   ├── lib/             # api.ts (fetch helper), transforms.ts (API → mock shape)
│   ├── mock/            # data.ts (mock data completo para fallback)
│   └── pages/           # 11 paginas (Dashboard, Saude, Estoque, Frete, etc.)
├── public/
└── dist/                # Build de producao
```

## Contas Mercado Livre

| # | Slug | Nome | Itens |
|---|------|------|-------|
| 1 | toyo | Toyo Auto Pecas | ~3,700 |
| 2 | sac | Conta SAC | ~3,100 |
| 3 | oficial | Conta Oficial | ~2,900 |
| 4 | denzel | Conta Denzel | ~340 |

## Endpoints da API

| Metodo | Path | Descricao |
|--------|------|-----------|
| POST | /api/auth/login | Autenticacao (retorna JWT) |
| GET | /api/dashboard/v2 | Dashboard consolidado |
| GET | /api/dashboard/sales-chart?days=180 | Vendas por dia com breakdown por conta |
| GET | /api/items?per_page=10000 | Todos os itens (saude, score, specs) |
| GET | /api/stock?per_page=10000 | Estoque com cobertura |
| GET | /api/freight | Frete agregado por estado/conta |
| GET | /api/corrections?per_page=10000 | Correcoes automaticas |
| GET | /api/prices?per_page=10000 | Precos e gap vs sugerido |
| GET | /api/profitability?per_page=10000 | P&L por pedido |
| GET | /api/compatibilities?per_page=50000 | Itens + catalogo veicular |
| GET | /api/ads | Product Ads (pendente scope) |

## Padrao de Conexao API

Todas as paginas usam o hook `useApiData`:

```typescript
const { data, loading } = useApiData("/endpoint", mockFallback, transformFn);
```

- Se `IS_MOCK = true` (sem URL de API): usa mock data
- Se API responde: transforma via `transforms.ts` para shape do mock
- Se API falha: fallback para mock com warning no console

## Desenvolvimento

```bash
# Instalar dependencias (Replit faz automaticamente)
pnpm install

# Dev server
pnpm --filter @workspace/ml-dashboard dev

# Build
pnpm --filter @workspace/ml-dashboard build
```

## Deploy

O frontend roda no Replit (deploy automatico).
O backend roda na VPS (Docker Compose, rebuild manual).

## Credenciais

- **Login dashboard:** admin / ArmazemML2026!
- **VPS SSH:** `ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96`

## Responsabilidades

| Componente | Responsavel | Repo |
|-----------|-------------|------|
| Frontend (UI, componentes, paginas) | Replit Agent | dashboard-mercado-livre-sistema |
| Backend (API, DB, coletores, jobs) | Claude Code | ml-diagnostico |

**Regra:** Claude Code NAO modifica o frontend. Replit Agent NAO modifica o backend.
