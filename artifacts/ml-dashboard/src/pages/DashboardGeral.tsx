import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import {
  ACCOUNTS, DASHBOARD_KPIS, PROBLEMS, DAILY_SALES,
} from "@/mock/data";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart, DollarSign, Star, AlertTriangle,
  Car, FileText, Truck, Package, Download,
  ArrowUpRight,
} from "lucide-react";

function AccountCard({ account }: { account: typeof ACCOUNTS[0] }) {
  const health = account.unhealthy > 10 || account.claimsRate > 0.025
    ? "danger"
    : account.warning > 15 || account.claimsRate > 0.015
    ? "warn"
    : "ok";

  const healthColors = {
    ok:     { bar: "#0d9488", bg: "bg-teal-50",   text: "text-teal-700",  border: "border-teal-200" },
    warn:   { bar: "#d97706", bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200" },
    danger: { bar: "#dc2626", bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200" },
  }[health];

  const metrics = [
    { label: "Reclamações",   value: `${(account.claimsRate * 100).toFixed(1)}%`,       ok: account.claimsRate <= 0.015 },
    { label: "Cancelamentos", value: `${(account.cancellationsRate * 100).toFixed(1)}%`, ok: account.cancellationsRate <= 0.020 },
    { label: "Atrasos",       value: `${(account.delayedRate * 100).toFixed(1)}%`,       ok: account.delayedRate <= 0.05 },
  ];

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-border card-hover"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{account.name}</h3>
          <span
            className={`inline-flex items-center mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${healthColors.bg} ${healthColors.text} border ${healthColors.border}`}
          >
            {account.powerSeller}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Faturamento 30d</p>
          <p className="font-bold text-base text-foreground mt-0.5">
            {account.revenue30d.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {metrics.map(m => (
          <div
            key={m.label}
            className="text-center py-2 rounded-xl"
            style={{ background: "hsl(var(--muted))" }}
          >
            <p className={`text-sm font-bold ${m.ok ? "text-teal-600" : "text-red-600"}`}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <span className="font-medium">{account.orders30d} pedidos</span>
        <span className="text-amber-600 font-semibold">{account.pendingDispatch} p/ despachar</span>
        <span className="text-red-600 font-semibold">{account.unhealthy} unhealthy</span>
      </div>
    </div>
  );
}

function SalesChart({ data }: { data: typeof DAILY_SALES }) {
  const [period, setPeriod] = useState(30);
  const [mode, setMode] = useState<"qty" | "revenue">("qty");
  const sliced = data.slice(-period);

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-border"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-base text-foreground">Vendas Diárias</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos {period} dias</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {[7, 30, 60, 90].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 font-medium transition-colors ${period === p ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
              >
                {p}d
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {(["qty", "revenue"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 font-medium transition-colors ${mode === m ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
              >
                {m === "qty" ? "Pedidos" : "Receita"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 36%)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="hsl(174, 72%, 36%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" interval={period === 7 ? 0 : period <= 30 ? 4 : 9} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent"
            tickFormatter={v => mode === "revenue" ? `R$${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 16px rgb(0 0 0 / .1)" }}
            formatter={(v: number) => mode === "revenue" ? [v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Receita"] : [v, "Pedidos"]}
          />
          <Area
            type="monotone"
            dataKey={mode}
            stroke="hsl(174, 72%, 36%)"
            strokeWidth={2.5}
            fill="url(#tealGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  red: "severity-red",
  yellow: "severity-yellow",
  green: "severity-green",
};

export default function DashboardGeral() {
  return (
    <Layout>
      {/* ── Action bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-foreground">Visão Geral</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Consolidado das 4 contas Mercado Livre</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-foreground bg-white rounded-xl border border-border hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          accent
          label="Pedidos (30d)"
          value={DASHBOARD_KPIS.totalOrders30d.toLocaleString("pt-BR")}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <KpiCard
          label="Faturamento (30d)"
          value={DASHBOARD_KPIS.totalRevenue30d.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 8.3, isPositive: true }}
        />
        <KpiCard
          label="Score médio"
          value={`${DASHBOARD_KPIS.avgScore}/100`}
          icon={<Star className="h-4 w-4" />}
          trend={{ value: 2.1, isPositive: false }}
          href="/saude?filter=score_low"
        />
        <KpiCard
          label="Itens c/ problema"
          value={DASHBOARD_KPIS.itemsWithProblem}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 4.2, isPositive: false }}
          href="/saude?filter=unhealthy"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Compat. pendentes" value={DASHBOARD_KPIS.compatPending}     icon={<Car className="h-4 w-4" />}    href="/saude?filter=compat" />
        <KpiCard label="Ficha técnica %"   value={`${DASHBOARD_KPIS.specsFillRate}%`}  icon={<FileText className="h-4 w-4" />} href="/saude?filter=specs" />
        <KpiCard label="Frete / vendas"    value={`${DASHBOARD_KPIS.freightOverSales}%`} icon={<Truck className="h-4 w-4" />}   href="/frete?filter=danger" />
        <KpiCard label="Estoque em risco"  value={DASHBOARD_KPIS.stockRisk}          icon={<Package className="h-4 w-4" />} href="/estoque?filter=lt30" />
      </div>

      {/* ── Chart + Problems ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2">
          <SalesChart data={DAILY_SALES} />
        </div>
        <div
          className="bg-white rounded-2xl p-5 border border-border"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
        >
          <h3 className="font-bold text-sm text-foreground mb-4">Problemas Ativos</h3>
          <div className="space-y-2">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${SEVERITY_STYLES[p.severity]}`}
              >
                <span className="font-medium text-xs">{p.label}</span>
                <span className="font-bold text-base">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account cards ── */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Desempenho por Conta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {ACCOUNTS.map(acc => <AccountCard key={acc.id} account={acc} />)}
        </div>
      </div>
    </Layout>
  );
}
