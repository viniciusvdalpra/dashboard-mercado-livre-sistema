import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { api } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Star, AlertTriangle,
  Car, FileText, Truck, Package, Download,
  TrendingUp, TrendingDown, ShoppingCart,
} from "lucide-react";

interface DashAccount {
  slug: string;
  name: string;
  total_items: number;
  healthy: number;
  warning: number;
  unhealthy: number;
  avg_score: number;
  revenue_d30: number;
  orders_d30: number;
  specs_avg: number;
}

interface DashKpis {
  total_items: number;
  healthy: number;
  warning: number;
  unhealthy: number;
  avg_score: number;
  revenue_d30: number;
  orders_d30: number;
  pending_corrections: number;
  specs_avg: number;
  curva_a_count: number;
  curva_b_count: number;
  curva_c_count: number;
}

interface DashProblem {
  id: number;
  type: string;
  severity: string;
  title: string;
  ml_item_id: string;
}

interface SalesEntry {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardData {
  accounts: DashAccount[];
  kpis: DashKpis;
  recent_problems: DashProblem[];
  revenue_by_day: SalesEntry[];
}

function AccountCard({ account }: { account: DashAccount }) {
  const health = account.unhealthy > 10 ? "danger" : account.warning > 15 ? "warn" : "ok";

  const healthColors = {
    ok:     { bg: "bg-teal-50",   text: "text-teal-700",  border: "border-teal-200" },
    warn:   { bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200" },
    danger: { bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200" },
  }[health];

  const metrics = [
    { label: "Score médio",   value: `${account.avg_score.toFixed(0)}`,  ok: account.avg_score >= 70 },
    { label: "Ficha %",       value: `${account.specs_avg.toFixed(0)}%`, ok: account.specs_avg >= 80 },
    { label: "Unhealthy",     value: `${account.unhealthy}`,             ok: account.unhealthy <= 10 },
  ];

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-border card-hover"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-foreground mb-2" title={account.name}>{account.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${healthColors.bg} ${healthColors.text} border ${healthColors.border}`}>
            {health === "ok" ? "Saudável" : health === "warn" ? "Atenção" : "Crítico"}
          </span>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Faturamento 30d</p>
            <p className="font-bold text-base text-foreground whitespace-nowrap leading-none">
              {account.revenue_d30.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </p>
          </div>
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
        <span className="font-medium">{account.orders_d30} pedidos</span>
        <span className="text-amber-600 font-semibold">{account.warning} warning</span>
        <span className="text-red-600 font-semibold">{account.unhealthy} unhealthy</span>
      </div>
    </div>
  );
}

function RevPeriodCard({ days, data }: { days: number; data: SalesEntry[] }) {
  const current  = data.slice(-days);
  const previous = data.slice(-days * 2, -days);

  const curRev  = current.reduce((s, d)  => s + d.revenue, 0);
  const prevRev = previous.reduce((s, d) => s + d.revenue, 0);
  const curQty  = current.reduce((s, d)  => s + d.orders, 0);
  const prevQty = previous.reduce((s, d) => s + d.orders, 0);

  const revPct = prevRev > 0 ? ((curRev - prevRev) / prevRev) * 100 : 0;
  const qtyPct = prevQty > 0 ? ((curQty - prevQty) / prevQty) * 100 : 0;
  const revUp  = revPct >= 0;
  const qtyUp  = qtyPct >= 0;

  const curStart  = current[0]?.date  ?? "";
  const curEnd    = current[current.length - 1]?.date ?? "";
  const prevStart = previous[0]?.date ?? "";
  const prevEnd   = previous[previous.length - 1]?.date ?? "";

  return (
    <div
      className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-1.5 min-w-0"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-primary">{days}d</span>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {curStart.slice(5)} – {curEnd.slice(5)}
        </span>
      </div>

      <p className="text-lg font-bold text-foreground leading-tight">
        {curRev.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
      </p>

      <div className={`flex items-center gap-1 text-[11px] font-semibold ${revUp ? "text-teal-600" : "text-red-500"}`}>
        {revUp ? <TrendingUp className="h-3 w-3 flex-shrink-0" /> : <TrendingDown className="h-3 w-3 flex-shrink-0" />}
        <span>{revUp ? "▲" : "▼"} {Math.abs(revPct).toFixed(1)}%</span>
      </div>

      <div className="border-t border-border my-0.5" />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <ShoppingCart className="h-3 w-3 inline mr-1 -mt-0.5" />
          {curQty.toLocaleString("pt-BR")} pedidos
        </span>
        <span className={`text-[11px] font-semibold ${qtyUp ? "text-teal-600" : "text-red-500"}`}>
          {qtyUp ? "▲" : "▼"} {Math.abs(qtyPct).toFixed(1)}%
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground">
        vs {prevStart.slice(5)} – {prevEnd.slice(5)}
      </p>
    </div>
  );
}

function SalesChart({ data }: { data: SalesEntry[] }) {
  const [period, setPeriod] = useState(30);
  const [mode, setMode] = useState<"orders" | "revenue">("orders");
  const sliced = data.slice(-period);

  const xInterval = period === 7 ? 0 : period <= 30 ? 4 : 9;
  const yFmt = (v: number) => mode === "revenue" ? `R$${(v / 1000).toFixed(0)}k` : String(v);
  const tooltipFmt = (v: number, name: string) =>
    mode === "revenue"
      ? [v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), name]
      : [v, name];

  const gridStroke = "hsl(var(--border))";
  const axisStyle  = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
  const tooltipStyle = {
    background: "white",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "0 4px 16px rgb(0 0 0 / .1)",
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-border h-full flex flex-col"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      <div className="flex items-center justify-between mb-4">
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
            {(["orders", "revenue"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 font-medium transition-colors ${mode === m ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
              >
                {m === "orders" ? "Pedidos" : "Receita"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} stroke="transparent" interval={xInterval} tickFormatter={v => v.slice(5)} />
            <YAxis tick={axisStyle} stroke="transparent" tickFormatter={yFmt} />
            <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} labelFormatter={l => `Data: ${l}`} />
            <Area
              type="monotone"
              dataKey={mode}
              name={mode === "orders" ? "Pedidos" : "Receita"}
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#chartGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "severity-red",
  warning: "severity-yellow",
  info: "severity-green",
  red: "severity-red",
  yellow: "severity-yellow",
  green: "severity-green",
};

export default function DashboardGeral() {
  const { selectedAccountId } = useGlobalContext();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<DashboardData>("/dashboard/v2"),
      api.get<SalesEntry[]>("/dashboard/sales-chart?days=180"),
    ]).then(([dash, sales]) => {
      setDashData(dash);
      setSalesData(sales);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const accounts = dashData?.accounts ?? [];
  const kpis = dashData?.kpis;
  const problems = dashData?.recent_problems ?? [];

  // Group problems by type for the panel
  const problemGroups = useMemo(() => {
    const groups: Record<string, { label: string; count: number; severity: string }> = {};
    problems.forEach(p => {
      if (!groups[p.type]) {
        groups[p.type] = { label: p.title.split(":")[0] || p.type, count: 0, severity: p.severity };
      }
      groups[p.type].count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [problems]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Action bar */}
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

      {/* Revenue period cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {([7, 15, 30, 60, 90] as const).map(d => (
          <RevPeriodCard key={d} days={d} data={salesData} />
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          label="Score médio"
          value={`${kpis?.avg_score?.toFixed(0) ?? 0}/100`}
          icon={<Star className="h-4 w-4" />}
          trend={{ value: 2.1, isPositive: false }}
        />
        <KpiCard
          label="Itens c/ problema"
          value={kpis?.unhealthy ?? 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          href="/saude?filter=unhealthy"
          variant="alert"
        />
        <KpiCard label="Correções pendentes" value={kpis?.pending_corrections ?? 0} icon={<Car className="h-4 w-4" />} href="/correcoes" variant="warn" />
        <KpiCard label="Ficha técnica %" value={`${kpis?.specs_avg?.toFixed(0) ?? 0}%`} icon={<FileText className="h-4 w-4" />} href="/saude?filter=specs" variant="warn" />
        <KpiCard label="Curva A" value={kpis?.curva_a_count ?? 0} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Estoque em risco" value={kpis?.warning ?? 0} icon={<Package className="h-4 w-4" />} href="/estoque?filter=lt30" variant="warn" />
      </div>

      {/* Chart + Problems */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-6" style={{ height: 400 }}>
        <div className="xl:col-span-3 h-full">
          <SalesChart data={salesData} />
        </div>
        <div
          className="bg-white rounded-2xl p-5 border border-border flex flex-col h-full min-h-0 overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
        >
          <h3 className="font-bold text-sm text-foreground mb-4 flex-shrink-0">Problemas Ativos</h3>
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {problemGroups.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum problema ativo</p>
              )}
              {problemGroups.map((p, i) => {
                const countSize =
                  p.count >= 100 ? "text-[22px]" :
                  p.count >= 50  ? "text-[19px]" :
                  p.count >= 20  ? "text-[17px]" :
                                   "text-[14px]";
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${SEVERITY_STYLES[p.severity] ?? "severity-yellow"}`}
                  >
                    <span className="font-medium text-[13px] leading-tight">{p.label}</span>
                    <span className={`font-black tabular-nums leading-none ${countSize}`}>{p.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Account cards */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Desempenho por Conta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {accounts.map(acc => <AccountCard key={acc.slug} account={acc} />)}
        </div>
      </div>
    </Layout>
  );
}
