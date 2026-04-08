import { useState } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import {
  ACCOUNTS, DASHBOARD_KPIS, PROBLEMS, DAILY_SALES,
} from "@/mock/data";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Star, AlertTriangle,
  Car, FileText, Truck, Package, Download,
  TrendingUp, TrendingDown, ShoppingCart,
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

// ── Revenue period cards ─────────────────────────────────────────────────────

type DailySalesEntry = typeof DAILY_SALES[0];

function RevPeriodCard({
  days, data, selectedAccountId,
}: {
  days: number;
  data: DailySalesEntry[];
  selectedAccountId: number | null;
}) {
  const revKey = selectedAccountId
    ? (`revenue_${selectedAccountId}` as keyof DailySalesEntry)
    : "revenue";
  const qtyKey = selectedAccountId
    ? (`qty_${selectedAccountId}` as keyof DailySalesEntry)
    : "qty";

  const current  = data.slice(-days);
  const previous = data.slice(-days * 2, -days);

  const curRev  = current.reduce((s, d)  => s + (d[revKey] as number), 0);
  const prevRev = previous.reduce((s, d) => s + (d[revKey] as number), 0);
  const curQty  = current.reduce((s, d)  => s + (d[qtyKey] as number), 0);
  const prevQty = previous.reduce((s, d) => s + (d[qtyKey] as number), 0);

  const revPct = prevRev > 0 ? ((curRev - prevRev) / prevRev) * 100 : 0;
  const qtyPct = prevQty > 0 ? ((curQty - prevQty) / prevQty) * 100 : 0;
  const revUp  = revPct >= 0;
  const qtyUp  = qtyPct >= 0;

  // Date labels from the data entries
  const curStart  = current[0]?.date  ?? "";
  const curEnd    = current[current.length - 1]?.date ?? "";
  const prevStart = previous[0]?.date ?? "";
  const prevEnd   = previous[previous.length - 1]?.date ?? "";

  return (
    <div
      className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-1.5 min-w-0"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      {/* Period header */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-primary">{days}d</span>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {curStart} – {curEnd}
        </span>
      </div>

      {/* Revenue */}
      <p className="text-lg font-bold text-foreground leading-tight">
        {curRev.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
      </p>

      {/* Revenue trend */}
      <div className={`flex items-center gap-1 text-[11px] font-semibold ${revUp ? "text-teal-600" : "text-red-500"}`}>
        {revUp
          ? <TrendingUp className="h-3 w-3 flex-shrink-0" />
          : <TrendingDown className="h-3 w-3 flex-shrink-0" />
        }
        <span>{revUp ? "▲" : "▼"} {Math.abs(revPct).toFixed(1)}%</span>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-0.5" />

      {/* Orders */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <ShoppingCart className="h-3 w-3 inline mr-1 -mt-0.5" />
          {curQty.toLocaleString("pt-BR")} pedidos
        </span>
        <span className={`text-[11px] font-semibold ${qtyUp ? "text-teal-600" : "text-red-500"}`}>
          {qtyUp ? "▲" : "▼"} {Math.abs(qtyPct).toFixed(1)}%
        </span>
      </div>

      {/* Comparison period */}
      <p className="text-[10px] text-muted-foreground">
        vs {prevStart} – {prevEnd}
      </p>
    </div>
  );
}

const ACCOUNT_LINES = [
  { id: 1, shortName: "Toyo (01)",    color: "#0d9488", qtyKey: "qty_1",     revKey: "revenue_1" },
  { id: 2, shortName: "SAC (02)",     color: "#3b82f6", qtyKey: "qty_2",     revKey: "revenue_2" },
  { id: 3, shortName: "Oficial (03)", color: "#8b5cf6", qtyKey: "qty_3",     revKey: "revenue_3" },
  { id: 4, shortName: "Denzel (04)",  color: "#f97316", qtyKey: "qty_4",     revKey: "revenue_4" },
] as const;

const TOTAL_LINE = { shortName: "Total", color: "#1f2937", qtyKey: "qty", revKey: "revenue" } as const;

function SalesChart({ data }: { data: typeof DAILY_SALES }) {
  const [period, setPeriod] = useState(30);
  const [mode, setMode] = useState<"qty" | "revenue">("qty");
  const { selectedAccountId } = useGlobalContext();
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

  // Single account view
  const singleLine = selectedAccountId
    ? ACCOUNT_LINES.find(a => a.id === selectedAccountId) ?? null
    : null;

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-border"
      style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
    >
      {/* Header */}
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

      {/* Legend — only when showing all accounts */}
      {!singleLine && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
          {ACCOUNT_LINES.map(a => (
            <span key={a.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-5 rounded-full" style={{ background: a.color }} />
              {a.shortName}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span className="inline-block h-2 w-5 rounded-full" style={{ background: TOTAL_LINE.color }} />
            {TOTAL_LINE.shortName}
          </span>
        </div>
      )}

      {/* Chart */}
      {singleLine ? (
        // Single account — AreaChart com preenchimento
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="singleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={singleLine.color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={singleLine.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} stroke="transparent" interval={xInterval} />
            <YAxis tick={axisStyle} stroke="transparent" tickFormatter={yFmt} />
            <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
            <Area
              type="monotone"
              dataKey={mode === "qty" ? singleLine.qtyKey : singleLine.revKey}
              name={singleLine.shortName}
              stroke={singleLine.color}
              strokeWidth={2.5}
              fill="url(#singleGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        // Todas as contas — LineChart com 5 linhas (4 contas + total)
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} stroke="transparent" interval={xInterval} />
            <YAxis tick={axisStyle} stroke="transparent" tickFormatter={yFmt} />
            <Tooltip contentStyle={tooltipStyle} formatter={tooltipFmt} />
            {ACCOUNT_LINES.map(a => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={mode === "qty" ? a.qtyKey : a.revKey}
                name={a.shortName}
                stroke={a.color}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            {/* Total — linha mais grossa e escura, acima das contas */}
            <Line
              type="monotone"
              dataKey={mode === "qty" ? TOTAL_LINE.qtyKey : TOTAL_LINE.revKey}
              name={TOTAL_LINE.shortName}
              stroke={TOTAL_LINE.color}
              strokeWidth={2.8}
              strokeDasharray="6 3"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  red: "severity-red",
  yellow: "severity-yellow",
  green: "severity-green",
};

export default function DashboardGeral() {
  const { selectedAccountId } = useGlobalContext();

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

      {/* ── Faturamento por período (5 cards) ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {([7, 15, 30, 60, 90] as const).map(d => (
          <RevPeriodCard key={d} days={d} data={DAILY_SALES} selectedAccountId={selectedAccountId} />
        ))}
      </div>

      {/* ── KPIs operacionais ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          label="Score médio"
          value={`${DASHBOARD_KPIS.avgScore}/100`}
          icon={<Star className="h-4 w-4" />}
          trend={{ value: 2.1, isPositive: false }}
        />
        <KpiCard
          label="Itens c/ problema"
          value={DASHBOARD_KPIS.itemsWithProblem}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 4.2, isPositive: false }}
          href="/saude?filter=unhealthy"
        />
        <KpiCard label="Compat. pendentes" value={DASHBOARD_KPIS.compatPending}        icon={<Car className="h-4 w-4" />}     href="/saude?filter=compat" />
        <KpiCard label="Ficha técnica %"   value={`${DASHBOARD_KPIS.specsFillRate}%`}  icon={<FileText className="h-4 w-4" />} href="/saude?filter=specs" />
        <KpiCard label="Frete / vendas"    value={`${DASHBOARD_KPIS.freightOverSales}%`} icon={<Truck className="h-4 w-4" />}  href="/frete?filter=danger" />
        <KpiCard label="Estoque em risco"  value={DASHBOARD_KPIS.stockRisk}            icon={<Package className="h-4 w-4" />} href="/estoque?filter=lt30" />
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
