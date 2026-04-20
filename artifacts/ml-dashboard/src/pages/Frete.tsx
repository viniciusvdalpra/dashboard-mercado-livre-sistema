import { useMemo, useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Truck, DollarSign, Package, AlertTriangle, Download } from "lucide-react";

type FreightFilter = "all" | "free" | "not_free" | "fulfillment" | "xd_drop_off";

const FILTERS: { key: FreightFilter; label: string }[] = [
  { key: "all",         label: "Todos" },
  { key: "free",        label: "Frete grátis" },
  { key: "not_free",    label: "Sem frete grátis" },
  { key: "fulfillment", label: "Fulfillment" },
  { key: "xd_drop_off", label: "Cross Docking" },
];

interface RawItem {
  ml_item_id: string;
  title: string;
  account_slug: string;
  price: number;
  available_quantity: number;
  health_score: number;
  abc_curve: string;
  free_shipping?: boolean;
  logistic_type?: string;
}

interface FreightItem {
  id: string;
  title: string;
  accountName: string;
  price: number;
  freeShipping: boolean;
  shippingMode: string;
  curve: string;
}

export default function Frete() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<FreightFilter>("all");
  const [freightItems, setFreightItems] = useState<FreightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ per_page: "2000" });
    if (selectedAccountId) params.set("account", selectedAccountId);
    api.get<{ items: RawItem[] }>(`/items?${params}`).then(data => {
      setFreightItems((data.items || []).map(raw => ({
        id: raw.ml_item_id,
        title: raw.title,
        accountName: "Conta " + raw.account_slug,
        price: raw.price,
        freeShipping: raw.free_shipping ?? true,
        shippingMode: raw.logistic_type || "xd_drop_off",
        curve: raw.abc_curve || "C",
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedAccountId]);

  const base = freightItems;

  const counts = useMemo(() => ({
    all:         base.length,
    free:        base.filter(i => i.freeShipping).length,
    not_free:    base.filter(i => !i.freeShipping).length,
    fulfillment: base.filter(i => i.shippingMode === "fulfillment").length,
    xd_drop_off: base.filter(i => i.shippingMode === "xd_drop_off").length,
  }), [base]);

  const items = useMemo(() => {
    switch (activeFilter) {
      case "free":        return base.filter(i => i.freeShipping);
      case "not_free":    return base.filter(i => !i.freeShipping);
      case "fulfillment": return base.filter(i => i.shippingMode === "fulfillment");
      case "xd_drop_off": return base.filter(i => i.shippingMode === "xd_drop_off");
      default:            return base;
    }
  }, [base, activeFilter]);

  const chartData = [
    { label: "Frete grátis", count: counts.free, color: "#0d9488" },
    { label: "Sem frete grátis", count: counts.not_free, color: "#f97316" },
    { label: "Fulfillment", count: counts.fulfillment, color: "#3b82f6" },
    { label: "Cross Docking", count: counts.xd_drop_off, color: "#8b5cf6" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Frete"
        subtitle="Análise de modos de envio por anúncio"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total de itens" value={counts.all} icon={<Package className="h-4 w-4" />} />
        <KpiCard accent label="Frete grátis" value={counts.free} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Sem frete grátis" value={counts.not_free} icon={<AlertTriangle className="h-4 w-4" />} variant={counts.not_free > 0 ? "warn" : "default"} />
        <KpiCard label="Fulfillment (Full)" value={counts.fulfillment} icon={<DollarSign className="h-4 w-4" />} />
      </div>

      {/* Info banner */}
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Dados de custo de frete indisponíveis</p>
          <p className="text-xs text-amber-600 mt-0.5">O collector de frete ainda não foi implementado. Exibindo apenas modo de envio e status de frete grátis.</p>
        </div>
      </div>

      {/* Chart + filters */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-6" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-4">Distribuição por Modo de Envio</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="transparent" width={120} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [v, "Itens"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive={false} fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-3">Filtrar</h3>
          <div className="space-y-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f.key ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={activeFilter === f.key ? { background: "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 34%))" } : {}}
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
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Preço</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Frete grátis</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">Modo envio</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Curva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr><td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">Carregando...</td></tr>
              )}
              {!loading && items.slice(0, 50).map(item => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[300px]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.id} · {item.accountName.split(" ")[1]}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold">
                    {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {item.freeShipping ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">Sim</span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">Não</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted text-muted-foreground">
                      {item.shippingMode === "fulfillment" ? "Full" : item.shippingMode === "xd_drop_off" ? "Cross Dock" : item.shippingMode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-bold text-sm ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>{item.curve}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          {items.length} item(ns) · exibindo {Math.min(50, items.length)}
        </div>
      </div>
    </Layout>
  );
}
