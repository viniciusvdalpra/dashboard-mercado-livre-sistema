import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { FREIGHT_ITEMS } from "@/mock/data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Truck, DollarSign, Package, AlertTriangle, Download } from "lucide-react";

const THRESHOLDS = { ok: 10, warn: 18 };

type FreightFilter = "all" | "ok" | "warn" | "danger" | "free";

const FILTERS: { key: FreightFilter; label: string }[] = [
  { key: "all",    label: "Todos" },
  { key: "ok",     label: "OK (≤10%)" },
  { key: "warn",   label: "Atenção (10–18%)" },
  { key: "danger", label: "Crítico (>18%)" },
  { key: "free",   label: "Frete grátis" },
];

function freightBadge(pct: number, isFree: boolean) {
  if (isFree)                    return "bg-teal-50 text-teal-700 border border-teal-200";
  if (pct > THRESHOLDS.warn)     return "bg-red-50 text-red-700 border border-red-200";
  if (pct > THRESHOLDS.ok)       return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-muted text-muted-foreground border border-border";
}

export default function Frete() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<FreightFilter>("all");

  const base = useMemo(() =>
    selectedAccountId ? FREIGHT_ITEMS.filter(i => i.accountId === selectedAccountId) : FREIGHT_ITEMS,
    [selectedAccountId]
  );

  const counts = useMemo(() => ({
    all:    base.length,
    ok:     base.filter(i => !i.freeShipping && i.freightPercent <= THRESHOLDS.ok).length,
    warn:   base.filter(i => i.freightPercent > THRESHOLDS.ok && i.freightPercent <= THRESHOLDS.warn).length,
    danger: base.filter(i => i.freightPercent > THRESHOLDS.warn).length,
    free:   base.filter(i => i.freeShipping).length,
  }), [base]);

  const items = useMemo(() => {
    switch (activeFilter) {
      case "ok":     return base.filter(i => !i.freeShipping && i.freightPercent <= THRESHOLDS.ok);
      case "warn":   return base.filter(i => i.freightPercent > THRESHOLDS.ok && i.freightPercent <= THRESHOLDS.warn);
      case "danger": return base.filter(i => i.freightPercent > THRESHOLDS.warn);
      case "free":   return base.filter(i => i.freeShipping);
      default:       return base;
    }
  }, [base, activeFilter]);

  const totalCost  = base.reduce((s, i) => s + i.freightCost, 0);
  const avgPct     = base.length ? base.reduce((s, i) => s + i.freightPercent, 0) / base.length : 0;
  const freeCount  = base.filter(i => i.freeShipping).length;

  const accountChart = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    base.forEach(i => {
      const k = String(i.accountId);
      if (!map[k]) map[k] = { name: i.accountName.split(" ")[1] ?? i.accountName, total: 0, count: 0 };
      map[k].total += i.freightPercent;
      map[k].count += 1;
    });
    return Object.values(map).map(v => ({
      name: v.name,
      ratio: +(v.count > 0 ? v.total / v.count : 0).toFixed(1),
    }));
  }, [base]);

  return (
    <Layout>
      <PageHeader
        title="Frete"
        subtitle="Custo de frete por anúncio e incidência sobre vendas"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard accent label="Custo total de frete"
          value={totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
          icon={<Truck className="h-4 w-4" />}
        />
        <KpiCard label="Incidência média" value={`${avgPct.toFixed(1)}%`} icon={<DollarSign className="h-4 w-4" />} trend={{ value: 1.3, isPositive: false }} />
        <KpiCard label="Itens críticos (>18%)" value={counts.danger} icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Frete grátis" value={`${freeCount} itens`} icon={<Package className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-4">Incidência por Conta (%)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={accountChart} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Incidência"]}
              />
              <Bar dataKey="ratio" fill="hsl(174, 72%, 36%)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-3">Filtrar situação</h3>
          <div className="space-y-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f.key ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={activeFilter === f.key ? { background: "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 34%))" } : {}}
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

      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Preço</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Frete</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Incidência</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Unidades</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[280px]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.id} · {item.accountName.split(" ")[1]}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right">{item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-5 py-3.5 text-right">{item.freightCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${freightBadge(item.freightPercent, item.freeShipping)}`}>
                      {item.freeShipping ? "Grátis" : `${item.freightPercent}%`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">{item.sales30d}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      item.shippingMode === "fulfillment"
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {item.shippingMode}
                    </span>
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
