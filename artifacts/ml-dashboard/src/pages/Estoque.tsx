import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOCK_ITEMS } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Package, AlertTriangle, Clock, Archive } from "lucide-react";

type StockFilter = "all" | "ruptura" | "lt30" | "30to60" | "60to90" | "gt90" | "parado" | "fora";

const COVERAGE_BUCKETS = [
  { label: "Ruptura", key: "ruptura", color: "#A60808", min: -1, max: 0 },
  { label: "< 30 dias", key: "lt30", color: "#DC7308", min: 0, max: 30 },
  { label: "30–60 dias", key: "30to60", color: "#C6A339", min: 30, max: 60 },
  { label: "60–90 dias", key: "60to90", color: "#539616", min: 60, max: 90 },
  { label: "> 90 dias", key: "gt90", color: "#A6A6A6", min: 90, max: 9999 },
];

function coverageColor(days: number) {
  if (days <= 0) return "bg-red-600";
  if (days < 30) return "bg-orange-500";
  if (days < 60) return "bg-amber-500";
  if (days < 90) return "bg-green-600";
  return "bg-gray-400";
}

export default function Estoque() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<StockFilter>("all");

  const items = useMemo(() => {
    let list = selectedAccountId
      ? STOCK_ITEMS.filter(i => i.accountId === selectedAccountId)
      : STOCK_ITEMS;
    switch (activeFilter) {
      case "ruptura": return list.filter(i => i.stock === 0);
      case "lt30": return list.filter(i => i.coverageDays > 0 && i.coverageDays < 30);
      case "30to60": return list.filter(i => i.coverageDays >= 30 && i.coverageDays < 60);
      case "60to90": return list.filter(i => i.coverageDays >= 60 && i.coverageDays < 90);
      case "gt90": return list.filter(i => i.coverageDays >= 90 && i.coverageDays < 999);
      case "parado": return list.filter(i => i.sales30d === 0 && i.stock > 0);
      case "fora": return list.filter(i => i.status === "unhealthy" && i.stock > 0);
      default: return list;
    }
  }, [selectedAccountId, activeFilter]);

  const allItems = selectedAccountId ? STOCK_ITEMS.filter(i => i.accountId === selectedAccountId) : STOCK_ITEMS;

  const kpis = {
    total: allItems.reduce((s, i) => s + i.stock, 0),
    lt30: allItems.filter(i => i.coverageDays < 30 && i.coverageDays > 0).length,
    range3060: allItems.filter(i => i.coverageDays >= 30 && i.coverageDays < 60).length,
    parado: allItems.filter(i => i.sales30d === 0 && i.stock > 0).length,
  };

  const chartData = COVERAGE_BUCKETS.map(b => ({
    label: b.label,
    color: b.color,
    count: allItems.filter(i =>
      b.key === "ruptura" ? i.stock === 0 :
      b.key === "gt90" ? i.coverageDays >= 90 && i.coverageDays < 999 :
      i.coverageDays > b.min && i.coverageDays <= b.max
    ).length,
  }));

  const QUICK_FILTERS: { key: StockFilter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: allItems.length },
    { key: "ruptura", label: "Ruptura", count: allItems.filter(i => i.stock === 0).length },
    { key: "lt30", label: "< 30 dias", count: allItems.filter(i => i.coverageDays > 0 && i.coverageDays < 30).length },
    { key: "30to60", label: "30–60 dias", count: allItems.filter(i => i.coverageDays >= 30 && i.coverageDays < 60).length },
    { key: "60to90", label: "60–90 dias", count: allItems.filter(i => i.coverageDays >= 60 && i.coverageDays < 90).length },
    { key: "gt90", label: "> 90 dias", count: allItems.filter(i => i.coverageDays >= 90 && i.coverageDays < 999).length },
    { key: "parado", label: "Parado +60d", count: kpis.parado },
    { key: "fora", label: "Fora de venda", count: allItems.filter(i => i.status === "unhealthy" && i.stock > 0).length },
  ];

  return (
    <Layout>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Estoque total (un)" value={kpis.total.toLocaleString("pt-BR")} icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Cobertura < 30d" value={kpis.lt30} icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Cobertura 30–60d" value={kpis.range3060} icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Parado +60d" value={kpis.parado} icon={<Archive className="h-4 w-4" />} />
      </div>

      {/* Chart + quick filters */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="xl:col-span-2">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">Distribuição de Cobertura</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent" />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent" width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: number) => [v, "Itens"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">Filtros Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                  activeFilter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
                data-testid={`filter-${f.key}`}
              >
                <span>{f.label}</span>
                <span className="font-bold">{f.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Anúncio</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-20">Curva</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">Estoque</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Vendas/dia</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground w-48">Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground text-sm">
                      Nenhum item encontrado.
                    </td>
                  </tr>
                )}
                {items.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground truncate max-w-[300px]">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.id} · {item.accountName.split(" ")[1]}</div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-bold text-sm ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>
                        {item.curve}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{item.stock}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{item.salesPerDay.toFixed(1)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${coverageColor(item.coverageDays)}`}
                            style={{ width: `${Math.min(100, (item.coverageDays / 90) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-16 text-right">
                          {item.coverageDays >= 999 ? "—" : item.coverageDays === 0 ? "Ruptura" : `${item.coverageDays}d`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            {items.length} item(ns) exibido(s)
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
