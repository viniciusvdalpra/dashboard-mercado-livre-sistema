import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREIGHT_ITEMS, FREIGHT_BY_STATE } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Truck, DollarSign, Percent, TrendingUp } from "lucide-react";

type FreightFilter = "all" | "free_lt79" | "gt15pct" | "rose20" | "free" | "nofree";

const QUICK_FILTERS: { key: FreightFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "free_lt79", label: "Grátis < R$79" },
  { key: "gt15pct", label: "> 15% do preço" },
  { key: "rose20", label: "Custo subiu > 20%" },
  { key: "free", label: "Com frete grátis" },
  { key: "nofree", label: "Sem frete grátis" },
];

const MODE_LABELS: Record<string, string> = {
  fulfillment: "Full",
  xd_drop_off: "Flex",
  cross_docking: "Agência",
};

export default function Frete() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<FreightFilter>("all");

  const items = useMemo(() => {
    let list = selectedAccountId
      ? FREIGHT_ITEMS.filter(i => i.accountId === selectedAccountId)
      : FREIGHT_ITEMS;

    switch (activeFilter) {
      case "free_lt79": return list.filter(i => i.freeShipping && i.price < 79);
      case "gt15pct": return list.filter(i => i.freightPercent > 15);
      case "rose20": return list.filter(i => i.freightChanged && i.freightChangePct > 20);
      case "free": return list.filter(i => i.freeShipping);
      case "nofree": return list.filter(i => !i.freeShipping);
      default: return list;
    }
  }, [selectedAccountId, activeFilter]);

  const allItems = selectedAccountId ? FREIGHT_ITEMS.filter(i => i.accountId === selectedAccountId) : FREIGHT_ITEMS;

  const totalRevenue = allItems.reduce((s, i) => s + i.revenue30d, 0);
  const totalFreight = allItems.reduce((s, i) => s + i.freightCost, 0);
  const avgFreight = allItems.length > 0 ? totalFreight / allItems.length : 0;
  const freightPct = totalRevenue > 0 ? (totalFreight / totalRevenue) * 100 : 0;

  const stateData = FREIGHT_BY_STATE.sort((a, b) => b.sales - a.sales);

  return (
    <Layout>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Faturamento (30d)"
          value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Custo frete total"
          value={totalFreight.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<Truck className="h-4 w-4" />}
        />
        <KpiCard
          label="% sobre vendas"
          value={`${freightPct.toFixed(1)}%`}
          icon={<Percent className="h-4 w-4" />}
        />
        <KpiCard
          label="Frete médio/pedido"
          value={avgFreight.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* By state */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">Vendas por UF — Custo médio de frete</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stateData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent" />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(v: number, name: string) => [
                    name === "sales" ? v : `R$ ${v.toFixed(2)}`,
                    name === "sales" ? "Vendas" : "Frete médio"
                  ]}
                />
                <Bar dataKey="sales" fill="#565845" radius={[4, 4, 0, 0]} isAnimationActive={false} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Freight pct by state */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">% Frete sobre Vendas por UF</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {stateData.map(s => (
                <div key={s.state} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-muted-foreground">{s.state}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.freightPct > 15 ? "bg-red-500" : s.freightPct > 12 ? "bg-amber-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(100, (s.freightPct / 20) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-12 text-right ${s.freightPct > 15 ? "text-red-600" : s.freightPct > 12 ? "text-amber-600" : "text-green-600"}`}>
                    {s.freightPct.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    R$ {s.avgFreight.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Anúncio</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">Preço</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Custo frete</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">% Preço</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-24">Envio</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-28">Frete grátis</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">Variação</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground truncate max-w-[280px]">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.id}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {item.freightCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-semibold ${item.freightPercent > 15 ? "text-red-600" : item.freightPercent > 12 ? "text-amber-600" : "text-green-600"}`}>
                        {item.freightPercent}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs text-muted-foreground">{MODE_LABELS[item.shippingMode] || item.shippingMode}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {item.freeShipping ? (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">Grátis</span>
                      ) : (
                        <span className="text-xs bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">Pago</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {item.freightChanged ? (
                        <span className={`text-xs font-semibold ${item.freightChangePct > 0 ? "text-red-600" : "text-green-600"}`}>
                          {item.freightChangePct > 0 ? "+" : ""}{item.freightChangePct}%
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
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            {items.length} item(ns) exibido(s)
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
