import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ADS_METRICS, ADS_SUMMARY } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { DollarSign, TrendingUp, MousePointerClick, BarChart2, Download } from "lucide-react";

function roasColor(roas: number) {
  if (roas >= 5) return "#0d9488";
  if (roas >= 2) return "#eab308";
  return "#dc2626";
}
function roasBadge(roas: number) {
  if (roas >= 5) return "bg-teal-50 text-teal-700 border border-teal-200";
  if (roas >= 2) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-red-50 text-red-700 border border-red-200";
}

export default function Ads() {
  const { selectedAccountId } = useGlobalContext();
  const metrics = useMemo(() => {
    const list = selectedAccountId ? ADS_METRICS.filter(i => i.accountId === selectedAccountId) : ADS_METRICS;
    return [...list].sort((a, b) => b.roas - a.roas);
  }, [selectedAccountId]);

  const top12 = metrics.slice(0, 12);

  const recos = [
    { label: "Aumentar budget", items: metrics.filter(i => i.roas >= 5).length, variant: "teal",   desc: "ROAS ≥ 5x — excelente retorno" },
    { label: "Revisar campanhas", items: metrics.filter(i => i.roas >= 2 && i.roas < 3).length, variant: "amber", desc: "ROAS 2–3x — pode melhorar" },
    { label: "Reduzir budget", items: metrics.filter(i => i.roas < 2).length, variant: "red",    desc: "ROAS < 2x — custo alto" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Ads & Performance"
        subtitle="ROAS e métricas de campanha por item"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard accent label="Investimento total" value={ADS_SUMMARY.totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Vendas via Ads" value={ADS_SUMMARY.totalSales.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} icon={<TrendingUp className="h-4 w-4" />} trend={{ value: 15, isPositive: true }} />
        <KpiCard label="ROAS geral" value={`${ADS_SUMMARY.roas.toFixed(1)}x`} icon={<BarChart2 className="h-4 w-4" />} trend={{ value: 3.2, isPositive: true }} />
        <KpiCard label="CTR médio" value={`${(ADS_SUMMARY.avgCtr * 100).toFixed(1)}%`} icon={<MousePointerClick className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-4">ROAS por Item — Top 12</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top12} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" tickFormatter={v => `${v}x`} />
              <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" width={160}
                tickFormatter={(v: string) => v.length > 24 ? v.slice(0, 24) + "…" : v}
              />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v.toFixed(1)}x`, "ROAS"]}
              />
              <Bar dataKey="roas" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {top12.map((e, i) => <Cell key={i} fill={roasColor(e.roas)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recos */}
        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-4">Recomendações</h3>
          <div className="space-y-3">
            {recos.map(r => (
              <div key={r.label} className={`p-4 rounded-xl border ${
                r.variant === "teal"  ? "bg-teal-50 border-teal-200" :
                r.variant === "amber" ? "bg-amber-50 border-amber-200" :
                "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${r.variant === "teal" ? "text-teal-800" : r.variant === "amber" ? "text-amber-800" : "text-red-800"}`}>
                    {r.label}
                  </span>
                  <span className={`text-lg font-bold ${r.variant === "teal" ? "text-teal-700" : r.variant === "amber" ? "text-amber-700" : "text-red-700"}`}>
                    {r.items}
                  </span>
                </div>
                <p className={`text-xs ${r.variant === "teal" ? "text-teal-600" : r.variant === "amber" ? "text-amber-600" : "text-red-600"}`}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-sm text-foreground">Detalhamento por Item</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">ROAS</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Custo</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Vendas Ads</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Cliques</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">CTR</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Impressões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.map(item => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[280px]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.id}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${roasBadge(item.roas)}`}>{item.roas.toFixed(1)}x</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">{item.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-teal-700">{item.directAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-5 py-3.5 text-right">{item.clicks.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3.5 text-right">{(item.ctr * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{item.impressions.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
