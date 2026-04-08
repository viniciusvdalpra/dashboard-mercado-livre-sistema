import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADS_METRICS, ADS_SUMMARY } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { DollarSign, TrendingUp, MousePointerClick, BarChart2, AlertCircle, ArrowUpRight } from "lucide-react";

function roasColor(roas: number) {
  if (roas >= 5) return "text-green-600 bg-green-50 border-green-200";
  if (roas >= 2) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function roasBarColor(roas: number) {
  if (roas >= 5) return "#539616";
  if (roas >= 2) return "#C6A339";
  return "#A60808";
}

type RecoType = { label: string; items: typeof ADS_METRICS; description: string; variant: string };

export default function Ads() {
  const { selectedAccountId } = useGlobalContext();

  const metrics = useMemo(() => {
    const list = selectedAccountId
      ? ADS_METRICS.filter(i => i.accountId === selectedAccountId)
      : ADS_METRICS;
    return list.sort((a, b) => b.roas - a.roas);
  }, [selectedAccountId]);

  const top15 = metrics.slice(0, 15);

  const recos: RecoType[] = [
    {
      label: "Aumentar budget",
      items: metrics.filter(i => i.roas >= 5),
      description: "ROAS ≥ 5x — excelente retorno, vale investir mais",
      variant: "green",
    },
    {
      label: "Reduzir budget",
      items: metrics.filter(i => i.roas < 2),
      description: "ROAS < 2x — custo alto, retorno baixo",
      variant: "red",
    },
    {
      label: "Revisar campanhas",
      items: metrics.filter(i => i.roas >= 2 && i.roas < 3),
      description: "ROAS entre 2x e 3x — oportunidade de otimização",
      variant: "yellow",
    },
  ];

  return (
    <Layout>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Investimento total"
          value={ADS_SUMMARY.totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Vendas via Ads"
          value={ADS_SUMMARY.totalSales.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="ROAS geral"
          value={`${ADS_SUMMARY.roas.toFixed(1)}x`}
          icon={<BarChart2 className="h-4 w-4" />}
        />
        <KpiCard
          label="CTR médio"
          value={`${(ADS_SUMMARY.avgCtr * 100).toFixed(1)}%`}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* ROAS chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base">ROAS por Item — Top 15</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={top15} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} stroke="transparent"
                  tickFormatter={v => `${v}x`}
                />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  stroke="transparent"
                  width={160}
                  tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "…" : v}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(v: number) => [`${v.toFixed(1)}x`, "ROAS"]}
                />
                <Bar dataKey="roas" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {top15.map((entry, i) => <Cell key={i} fill={roasBarColor(entry.roas)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" /> Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {recos.map(r => (
              <div key={r.label} className={`p-3 rounded-lg border ${
                r.variant === "green" ? "bg-green-50 border-green-200" :
                r.variant === "red" ? "bg-red-50 border-red-200" :
                "bg-amber-50 border-amber-200"
              }`}>
                <div className={`text-sm font-semibold ${
                  r.variant === "green" ? "text-green-800" :
                  r.variant === "red" ? "text-red-800" :
                  "text-amber-800"
                }`}>
                  {r.label} <span className="font-bold">({r.items.length})</span>
                </div>
                <div className={`text-xs mt-1 ${
                  r.variant === "green" ? "text-green-600" :
                  r.variant === "red" ? "text-red-600" :
                  "text-amber-600"
                }`}>{r.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base">Detalhamento por Item</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Anúncio</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-20">ROAS</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Custo</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Vendas Ads</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">Cliques</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-24">CTR</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Impressões</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(item => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground truncate max-w-[280px]">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.id}</div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${roasColor(item.roas)}`}>
                        {item.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm">
                      {item.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-green-700">
                      {item.directAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3 text-right text-sm">{item.clicks.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3 text-right text-sm">{(item.ctr * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right text-sm text-muted-foreground">{item.impressions.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
