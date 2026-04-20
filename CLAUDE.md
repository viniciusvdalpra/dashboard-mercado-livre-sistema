# ML Dashboard — Regras para Claude Code

## REGRA PRINCIPAL (INEGOCIAVEL)

**NAO MODIFICAR O FRONTEND.** Nenhum arquivo dentro de `artifacts/ml-dashboard/src/` pode ser editado, criado ou deletado por este agente. O frontend e responsabilidade EXCLUSIVA do Replit Agent.

### O que PODE fazer:
- Modificar o **backend** na VPS (`~/armazem-projects/ml-diagnostico/app/`)
- Criar/editar rotas, models, collectors, schemas, jobs no backend
- Rebuild do container API (`docker compose -f docker-compose.production.yml up -d --build api`)
- Consultar o banco PostgreSQL via `docker exec ml-diagnostico-db psql`
- Testar endpoints via curl/python
- Fazer git commit/push no repo do **backend** (`ml-diagnostico`)

### O que NAO pode fazer:
- Editar qualquer arquivo em `artifacts/ml-dashboard/src/`
- Alterar `package.json`, `vite.config.ts`, `tsconfig.json` do frontend
- Fazer build do frontend
- Alterar CSS, componentes, paginas, hooks, contexts, mock data
- Fazer push no repo do **dashboard** (`dashboard-mercado-livre-sistema`) sem autorizacao explicita

## Acesso VPS

- **IP:** 195.200.5.96
- **SSH:** `ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96`
- **Path backend:** `~/armazem-projects/ml-diagnostico/`
- **API porta:** 8002 (host) → 8000 (container)
- **DB porta:** 5433 (host) → 5432 (container)
- **URL producao:** https://ml.armazemautopecas.com.br

## Credenciais

- **Dashboard login:** admin / ArmazemML2026!
- **PostgreSQL:** ml_user / MlD1agn0st1c0_2026! (db: ml_diagnostico)
- **JWT:** gerado via POST /api/auth/login

## Stack Backend

- Python 3.11 + FastAPI + SQLAlchemy async + APScheduler
- PostgreSQL 16 + Redis 7
- Docker Compose (production)
- 4 contas ML: toyo, sac, oficial, denzel

## Endpoints da API

| Endpoint | Descricao |
|----------|-----------|
| POST /api/auth/login | Login JWT |
| GET /api/dashboard/v2 | Dashboard consolidado (accounts, kpis, problems, charts) |
| GET /api/dashboard/sales-chart?days=N | Vendas por dia (com breakdown por conta) |
| GET /api/items?per_page=N | Lista de itens com saude, score, specs |
| GET /api/stock | Estoque e cobertura |
| GET /api/freight | Custo de frete agregado |
| GET /api/corrections?per_page=N | Correcoes aplicadas/pendentes |
| GET /api/prices?per_page=N | Precos e sugestoes |
| GET /api/profitability?per_page=N | Lucratividade por pedido (P&L) |
| GET /api/compatibilities?per_page=N | Itens + catalogo de veiculos + engines |
| GET /api/ads | Metricas de Product Ads (aguardando scope advertising) |
| GET /api/alerts | Alertas ativos |

## Estrutura Backend

```
app/
├── main.py              # FastAPI app + routers
├── worker.py            # APScheduler jobs
├── core/
│   ├── auth.py          # JWT (verify_token)
│   ├── database.py      # SQLAlchemy async engine
│   └── redis.py         # Redis connection
├── config/
│   ├── settings.py      # Pydantic settings
│   └── taxes.py         # ICMS rates
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic response models
├── routes/              # FastAPI routers
├── collectors/          # Coletores ML API (25+)
├── jobs/                # Jobs agendados
├── services/            # ML API client, Slack, Claude
├── analyzers/           # Analisadores de saude
└── correctors/          # Corretores automaticos
```

## Contas ML

| Slug | User ID | Nome |
|------|---------|------|
| toyo | 104346614 | Toyo Auto Pecas |
| sac | 163495278 | Conta SAC |
| oficial | 1152803193 | Conta Oficial |
| denzel | 1167655904 | Conta Denzel |

## Banco de Dados (principais tabelas)

- `accounts` — 4 contas ML com tokens OAuth
- `items` — 10,076 anuncios ativos (health_score, specs_score, abc_curve, compatibilities_count)
- `orders` — Pedidos (total_amount, freight_cost, shipping_status)
- `item_compatibilities` — 398,549 vinculos veiculo-item
- `corrections` — Correcoes aplicadas/pendentes
- `ads_metrics` — Metricas de ads (vazio ate ativar scope)
- `order_profitability` — P&L por pedido
- `product_costs` — CMV por SKU
- `daily_metrics` — Revenue/orders por item por dia
- `alerts` — Alertas de saude

## Comandos uteis

```bash
# Rebuild API
ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96 "cd ~/armazem-projects/ml-diagnostico && docker compose -f docker-compose.production.yml up -d --build api"

# Logs
ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96 "docker logs ml-diagnostico-api --tail 50"

# SQL direto
ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96 "docker exec ml-diagnostico-db psql -U ml_user -d ml_diagnostico -c 'SELECT ...'"

# Testar endpoint
ssh -i ~/.ssh/id_deploy_campaign root@195.200.5.96 "python3 -c '...'"
```
