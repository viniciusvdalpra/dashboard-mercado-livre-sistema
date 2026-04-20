import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { api } from "@/lib/api";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import {
  DollarSign, TrendingUp, MousePointerClick, BarChart2,
  Download, Eye, Info, Search, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

interface AdsItemRaw {
  ml_item_id: string;
  title: string;
  account_slug: string;
  spend_d30: number;
  revenue_d30: number;
  roas: number;
  clicks_d30: number;
  impressions_d30: number;
  ctr: number;
  is_grant: boolean;
}

interface AdsSummaryRaw {
  total_spend: number;
  total_revenue: number;
  avg_roas: number;
  grant_items: number;
  items: AdsItemRaw[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function num(v: number) { return v.toLocaleString("pt-BR"); }

function roasBadge(roas: number) {
  if (roas >= 5) return "bg-teal-50 text-teal-700 border-teal-200";
  if (roas >= 2) return "bg-blue-50 text-blue-700 border-blue-200";
  if (roas >= 1) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

const PAGE_SIZE = 25;

// ── Visão Geral tab ───────────────────────────────────────────────────────────

function VisaoGeral({ data }: { data: AdsSummaryRaw }) {
  const { items } = data;

  const roasChartData = useMemo(() =>
    items
      .slice()
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 10)
      .map(item => ({
        name: item.title.length > 28 ? item.title.slice(0, 28) + "…" : item.title,
        roas: item.roas,
        fill: item.roas >= 5 ? "#0d9488" : item.roas >= 2 ? "#3b82f6" : item.roas >= 1 ? "#f59e0b" : "#ef4444",
      })),
    [items],
  );

  const grantData = useMemo(() => {
    const grant = items.filter(i => i.is_grant).length;
    const paid = items.length - grant;
    if (!items.length) return [];
    return [
      { name: "Grant (bonificado)", value: grant, color: "#0d9488" },
      { name: "Pago", value: paid, color: "#3b82f6" },
    ].filter(d => d.value > 0);
  }, [items]);

  const totalClicks = items.reduce((s, i) => s + i.clicks_d30, 0);
  const totalImpressions = items.reduce((s, i) => s + i.impressions_d30, 0);

  if (items.length === 0) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard accent label="Investimento" value="R$ 0" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Receita via Ads" value="R$ 0" icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard label="ROAS geral" value="0.0x" icon={<BarChart2 className="h-4 w-4" />} />
          <KpiCard label="ACOS geral" value="0.0%" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Grant Ads" value="0" icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard label="Cliques" value="0" icon={<MousePointerClick className="h-4 w-4" />} />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-800">Nenhum dado de Ads disponível</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              O coletor de métricas de Ads ainda não está ativo. Quando a coleta for configurada,
              os dados de investimento, cliques, impressões e ROAS por anúncio aparecerão aqui automaticamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const acos = data.total_revenue > 0 ? (data.total_spend / data.total_revenue) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="xl:col-span-1">
          <KpiCard accent label="Investimento" value={brl(data.total_spend)} icon={<DollarSign className="h-4 w-4" />} />
        </div>
        <div className="xl:col-span-1">
          <KpiCard label="Receita via Ads" value={brl(data.total_revenue)} icon={<TrendingUp className="h-4 w-4" />} />
        </div>
        <KpiCard label="ROAS geral" value={`${data.avg_roas.toFixed(1)}x`} icon={<BarChart2 className="h-4 w-4" />} />
        <KpiCard label="ACOS geral" value={`${acos.toFixed(1)}%`} icon={<DollarSign className="h-4 w-4" />} variant={acos > 20 ? "alert" : acos > 14 ? "warn" : "default"} />
        <KpiCard label="Grant Ads" value={num(data.grant_items)} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Cliques" value={num(totalClicks)} icon={<MousePointerClick className="h-4 w-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ROAS by item */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-5"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">ROAS por Anúncio</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top 10 anúncios por ROAS</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500 inline-block"/>{">=5x"}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block"/>{">=2x"}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block"/>{">=1x"}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block"/>{"<1x"}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={roasChartData} layout="vertical" margin={{ left: 8, right: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="transparent" tickFormatter={v => `${v}x`} />
              <YAxis type="category" dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                stroke="transparent" width={180} />
              <ReTooltip
                contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v.toFixed(2)}x`, "ROAS"]}
              />
              <Bar dataKey="roas" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {roasChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                <LabelList dataKey="roas" position="right"
                  formatter={(v: number) => `${v.toFixed(1)}x`}
                  style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grant vs Paid donut */}
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-1">Tipo de Ads</h3>
          <p className="text-xs text-muted-foreground mb-4">Grant (bonificado) vs Pago</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            {grantData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={grantData} dataKey="value" innerRadius={42} outerRadius={64}
                      startAngle={90} endAngle={-270} strokeWidth={2} stroke="white">
                      {grantData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 10 }}
                      formatter={(v: number, name: string) => [`${v} anúncio(s)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full mt-2">
                  {grantData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground flex-1">{d.name}</span>
                      <span className="font-bold text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Top items */}
      {items.length > 0 && (
        <div>
          <h3 className="font-bold text-sm text-foreground mb-3">Melhores anúncios (ROAS)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items
              .slice()
              .sort((a, b) => b.roas - a.roas)
              .slice(0, 3)
              .map((item, i) => (
                <div key={item.ml_item_id}
                  className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3"
                  style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-muted-foreground">#{i + 1} melhor ROAS</span>
                      <p className="font-bold text-sm text-foreground mt-0.5 leading-snug truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.account_slug}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${roasBadge(item.roas)}`}>
                      {item.roas.toFixed(1)}x
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Invest.", value: brl(item.spend_d30) },
                      { label: "Receita", value: brl(item.revenue_d30) },
                      { label: "CTR", value: `${item.ctr.toFixed(1)}%` },
                    ].map(m => (
                      <div key={m.label} className="bg-muted/40 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border">
                    <span>Cliques: <strong className="text-foreground">{num(item.clicks_d30)}</strong></span>
                    <span>Impr.: <strong className="text-foreground">{num(item.impressions_d30)}</strong></span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Anúncios tab (replaces Campanhas — backend has per-item data, not campaigns) ──

function AnunciosAds({ items }: { items: AdsItemRaw[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i => i.title.toLowerCase().includes(q) || i.ml_item_id.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (items.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-blue-800">Nenhuma métrica de Ads coletada</p>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            A tabela de métricas de Ads está vazia. Quando o coletor de Product Ads do Mercado Livre
            for ativado, os dados por anúncio aparecerão nesta listagem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Buscar por título ou MLB..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted))" }} className="border-b border-border">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Conta</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Investido</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Receita</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">ROAS</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Cliques</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Impressões</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">CTR</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map(item => (
                <tr key={item.ml_item_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[240px]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.ml_item_id}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{item.account_slug}</td>
                  <td className="px-4 py-3.5 text-right font-semibold">
                    {item.spend_d30.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-teal-700">
                    {item.revenue_d30.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${roasBadge(item.roas)}`}>
                      {item.roas.toFixed(1)}x
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-muted-foreground">{num(item.clicks_d30)}</td>
                  <td className="px-4 py-3.5 text-right text-muted-foreground">{num(item.impressions_d30)}</td>
                  <td className="px-4 py-3.5 text-center text-sm">{item.ctr.toFixed(1)}%</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.is_grant ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                      {item.is_grant ? "Grant" : "Pago"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 itens" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} itens`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  page === p ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "items";

export default function Ads() {
  const { selectedAccountId } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [data, setData] = useState<AdsSummaryRaw>({
    total_spend: 0, total_revenue: 0, avg_roas: 0, grant_items: 0, items: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = selectedAccountId ? `?account=${selectedAccountId}` : "";
    api.get<AdsSummaryRaw>(`/ads${params}`)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedAccountId]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Visão Geral", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "items",    label: "Anúncios",    icon: <BarChart2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <Layout>
      <PageHeader
        title="Ads & Performance"
        subtitle={`Publicidade patrocinada — ${data.items.length} anúncio(s) com Ads`}
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      {/* Tab nav */}
      <div className="flex items-center gap-0.5 border-b border-border mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {activeTab === "overview" && <VisaoGeral data={data} />}
          {activeTab === "items"    && <AnunciosAds items={data.items} />}
        </>
      )}
    </Layout>
  );
}
