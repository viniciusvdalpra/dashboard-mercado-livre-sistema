import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { STOCK_ITEMS } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Package, AlertTriangle, Clock, Archive, Download, ShoppingCart } from "lucide-react";
import { useApiData } from "@/hooks/useApiData";
import { transformStockItems } from "@/lib/transforms";

type StockFilter = "all" | "ruptura" | "lt30" | "30to60" | "60to90" | "gt90" | "parado";

const BUCKETS: { key: StockFilter; label: string; color: string }[] = [
  { key: "ruptura", label: "Ruptura",   color: "#dc2626" },
  { key: "lt30",    label: "< 30 dias", color: "#f97316" },
  { key: "30to60",  label: "30–60 dias",color: "#eab308" },
  { key: "60to90",  label: "60–90 dias",color: "#0d9488" },
  { key: "gt90",    label: "> 90 dias", color: "#9ca3af" },
];

function coverageBarColor(days: number) {
  if (days <= 0)   return "bg-red-500";
  if (days < 30)   return "bg-orange-400";
  if (days < 60)   return "bg-amber-400";
  if (days < 90)   return "bg-teal-500";
  return "bg-gray-300";
}

export default function Estoque() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<StockFilter>(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("filter") as StockFilter | null;
    const valid: StockFilter[] = ["all", "ruptura", "lt30", "30to60", "60to90", "gt90", "parado"];
    return f && valid.includes(f) ? f : "all";
  });

  const { data: apiStock } = useApiData("/stock?per_page=10000", null, (raw) =>
    transformStockItems(raw.items ?? [])
  );
  const allStock = apiStock ?? STOCK_ITEMS;

  const base = useMemo(() =>
    selectedAccountId ? allStock.filter(i => i.accountId === selectedAccountId) : allStock,
    [selectedAccountId, allStock]
  );

  const counts = useMemo(() => ({
    all:    base.length,
    ruptura: base.filter(i => i.stock === 0).length,
    lt30:   base.filter(i => i.coverageDays > 0 && i.coverageDays < 30).length,
    "30to60": base.filter(i => i.coverageDays >= 30 && i.coverageDays < 60).length,
    "60to90": base.filter(i => i.coverageDays >= 60 && i.coverageDays < 90).length,
    gt90:   base.filter(i => i.coverageDays >= 90 && i.coverageDays < 999).length,
    parado: base.filter(i => i.sales30d === 0 && i.stock > 0).length,
  }), [base]);

  const items = useMemo(() => {
    switch (activeFilter) {
      case "ruptura": return base.filter(i => i.stock === 0);
      case "lt30":    return base.filter(i => i.coverageDays > 0 && i.coverageDays < 30);
      case "30to60":  return base.filter(i => i.coverageDays >= 30 && i.coverageDays < 60);
      case "60to90":  return base.filter(i => i.coverageDays >= 60 && i.coverageDays < 90);
      case "gt90":    return base.filter(i => i.coverageDays >= 90 && i.coverageDays < 999);
      case "parado":  return base.filter(i => i.sales30d === 0 && i.stock > 0);
      default:        return base;
    }
  }, [base, activeFilter]);

  const chartData = BUCKETS.map(b => ({
    ...b,
    count: counts[b.key as keyof typeof counts] ?? 0,
  }));

  const kpis = {
    total:       base.reduce((s, i) => s + i.stock, 0),
    lt30:        counts.lt30,
    range60:     counts["30to60"],
    parado:      counts.parado,
    suggestedBuy: base.reduce((s, i) => s + i.suggestedBuy, 0),
    itemsNeedBuy: base.filter(i => i.suggestedBuy > 0).length,
  };

  const FILTERS: { key: StockFilter; label: string }[] = [
    { key: "all",    label: "Todos" },
    { key: "ruptura",label: "Ruptura" },
    { key: "lt30",   label: "< 30 dias" },
    { key: "30to60", label: "30–60 dias" },
    { key: "60to90", label: "60–90 dias" },
    { key: "gt90",   label: "> 90 dias" },
    { key: "parado", label: "Parado +60d" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Estoque"
        subtitle="Cobertura e risco de ruptura por item"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard label="Estoque total (un)" value={kpis.total.toLocaleString("pt-BR")} icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Cobertura < 30d" value={kpis.lt30} icon={<AlertTriangle className="h-4 w-4" />} trend={{ value: 8, isPositive: false }} variant="alert" />
        <KpiCard label="Cobertura 30–60d" value={kpis.range60} icon={<Clock className="h-4 w-4" />} variant="warn" />
        <KpiCard label="Parado +60d" value={kpis.parado} icon={<Archive className="h-4 w-4" />} variant="warn" />
        <KpiCard label="Sugestão de compra (un)" value={kpis.suggestedBuy.toLocaleString("pt-BR")} icon={<ShoppingCart className="h-4 w-4" />} />
        <KpiCard label="Itens p/ repor" value={kpis.itemsNeedBuy} icon={<ShoppingCart className="h-4 w-4" />} subtext="precisam de compra" variant="warn" />
      </div>

      {/* Chart + filters */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-4">Distribuição de Cobertura</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" width={75} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [v, "Itens"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-3">Filtrar por cobertura</h3>
          <div className="space-y-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={activeFilter === f.key ? {
                  background: "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 34%))",
                } : {}}
                data-testid={`filter-${f.key}`}
              >
                <span>{f.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeFilter === f.key ? "bg-white/20 text-white" : "bg-muted"}`}>
                  {counts[f.key as keyof typeof counts] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Curva</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Estoque</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Vendas/dia</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-48">Cobertura</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">Sugestão Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[300px]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.id} · {item.accountName.split(" ")[1]}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-bold text-sm ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>{item.curve}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold">{item.stock}</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{item.salesPerDay.toFixed(1)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${coverageBarColor(item.coverageDays)}`}
                          style={{ width: `${Math.min(100, (item.coverageDays / 90) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-16 text-right">
                        {item.coverageDays >= 999 ? "—" : item.coverageDays === 0 ? "Ruptura" : `${item.coverageDays}d`}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.suggestedBuy > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-sm px-2.5 py-1 rounded-lg"
                        style={{ background: "rgb(239 68 68 / .08)", color: "#b91c1c" }}>
                        <ShoppingCart className="h-3 w-3" />
                        {item.suggestedBuy}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          {items.length} item(ns) exibido(s)
        </div>
      </div>
    </Layout>
  );
}
