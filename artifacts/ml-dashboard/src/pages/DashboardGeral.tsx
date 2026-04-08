import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ACCOUNTS,
  DASHBOARD_KPIS,
  PROBLEMS,
  DAILY_SALES,
} from "@/mock/data";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart, DollarSign, Star, AlertTriangle,
  Car, FileText, Truck, Package, TrendingUp, TrendingDown,
} from "lucide-react";

const SEVERITY_STYLES: Record<string, string> = {
  red: "severity-red",
  yellow: "severity-yellow",
  green: "severity-green",
};

function AccountCard({ account }: { account: typeof ACCOUNTS[0] }) {
  const claimsColor = account.claimsRate <= 0.015 ? "text-green-600" : account.claimsRate <= 0.025 ? "text-amber-600" : "text-red-600";
  const cancelColor = account.cancellationsRate <= 0.015 ? "text-green-600" : account.cancellationsRate <= 0.020 ? "text-amber-600" : "text-red-600";
  const delayedColor = account.delayedRate <= 0.05 ? "text-green-600" : account.delayedRate <= 0.08 ? "text-amber-600" : "text-red-600";
  const borderColor = (account.unhealthy > 10 || account.claimsRate > 0.025) ? "border-red-300" : (account.warning > 15 || account.claimsRate > 0.015) ? "border-amber-300" : "border-green-300";

  return (
    <Card className={`border-l-4 ${borderColor} card-hover`} data-testid={`account-card-${account.id}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{account.name}</h3>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{account.powerSeller}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Faturamento 30d</div>
            <div className="font-bold text-foreground text-sm">
              {account.revenue30d.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div>
            <div className={`text-sm font-semibold ${claimsColor}`}>{(account.claimsRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Recl.</div>
          </div>
          <div>
            <div className={`text-sm font-semibold ${cancelColor}`}>{(account.cancellationsRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Cancel.</div>
          </div>
          <div>
            <div className={`text-sm font-semibold ${delayedColor}`}>{(account.delayedRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Atrasos</div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{account.orders30d} pedidos</span>
          <span className="text-amber-600 font-medium">{account.pendingDispatch} p/ despachar</span>
          <span className="text-red-600 font-medium">{account.unhealthy} unhealthy</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SaleChart({ data }: { data: typeof DAILY_SALES }) {
  const [mode, setMode] = useState<"qty" | "revenue">("qty");
  const [period, setPeriod] = useState(30);

  const sliced = data.slice(-period);

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Vendas Diárias</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            {[7, 30].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                data-testid={`period-${p}d`}
              >
                {p}d
              </button>
            ))}
          </div>
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button
              onClick={() => setMode("qty")}
              className={`px-3 py-1 transition-colors ${mode === "qty" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              data-testid="toggle-qty"
            >
              Quantidade
            </button>
            <button
              onClick={() => setMode("revenue")}
              className={`px-3 py-1 transition-colors ${mode === "revenue" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              data-testid="toggle-revenue"
            >
              Faturamento
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6A339" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C6A339" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent" interval={period === 7 ? 0 : 4} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent"
              tickFormatter={v => mode === "revenue" ? `R$${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => mode === "revenue" ? [v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Faturamento"] : [v, "Pedidos"]}
            />
            <Area
              type="monotone"
              dataKey={mode}
              name={mode === "qty" ? "Pedidos" : "Faturamento"}
              stroke="#C6A339"
              strokeWidth={2}
              fill="url(#colorGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardGeral() {
  const kpis = [
    { label: "Pedidos (30d)", value: DASHBOARD_KPIS.totalOrders30d.toLocaleString("pt-BR"), icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Faturamento (30d)", value: DASHBOARD_KPIS.totalRevenue30d.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), icon: <DollarSign className="h-4 w-4" /> },
    { label: "Score médio", value: DASHBOARD_KPIS.avgScore, icon: <Star className="h-4 w-4" /> },
    { label: "Itens com problema", value: DASHBOARD_KPIS.itemsWithProblem, icon: <AlertTriangle className="h-4 w-4" /> },
    { label: "Compat. pendentes", value: DASHBOARD_KPIS.compatPending, icon: <Car className="h-4 w-4" /> },
    { label: "Ficha técnica %", value: `${DASHBOARD_KPIS.specsFillRate}%`, icon: <FileText className="h-4 w-4" /> },
    { label: "Frete / vendas", value: `${DASHBOARD_KPIS.freightOverSales}%`, icon: <Truck className="h-4 w-4" /> },
    { label: "Estoque em risco", value: DASHBOARD_KPIS.stockRisk, icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <Layout>
      {/* Account cards */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Painel das 4 Contas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {ACCOUNTS.map(acc => <AccountCard key={acc.id} account={acc} />)}
        </div>
      </section>

      {/* KPI row */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Métricas Consolidadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {kpis.map((k, i) => (
            <KpiCard key={i} label={k.label} value={k.value} icon={k.icon} />
          ))}
        </div>
      </section>

      {/* Chart + Problems */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SaleChart data={DAILY_SALES} />
        </div>

        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">Problemas a Resolver</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-sm ${SEVERITY_STYLES[p.severity]}`}
                data-testid={`problem-${p.type}`}
              >
                <span className="font-medium">{p.label}</span>
                <span className="font-bold text-base">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
