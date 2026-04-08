import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { CAMPAIGNS, ADS_METRICS, type Campaign } from "@/mock/data";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, TrendingUp, MousePointerClick, BarChart2,
  ChevronDown, ChevronRight, Download,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const DIAG_STYLE: Record<string, string> = {
  excelente: "bg-teal-50 text-teal-700 border-teal-200",
  bom:       "bg-blue-50 text-blue-700 border-blue-200",
  regular:   "bg-amber-50 text-amber-700 border-amber-200",
  ruim:      "bg-red-50 text-red-700 border-red-200",
};
const DIAG_LABEL: Record<string, string> = {
  excelente: "Excelente",
  bom:       "Bom",
  regular:   "Regular",
  ruim:      "Ruim",
};

function roasBadge(roas: number, target: number) {
  const ratio = roas / target;
  if (ratio >= 1)   return "bg-teal-50 text-teal-700 border-teal-200";
  if (ratio >= 0.7) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

// ── Win-rate donut ────────────────────────────────────────────────────────────

function WinRateDonut({ campaign }: { campaign: Campaign }) {
  const data = [
    { name: "Ganhas",                 value: campaign.winRate,     color: "#0d9488" },
    { name: "Perdidas p/ orçamento",  value: campaign.lostBudget,  color: "#f97316" },
    { name: "Perdidas p/ classificação", value: campaign.lostRanking, color: "#94a3b8" },
  ];
  return (
    <div className="flex items-center gap-4 py-2">
      <ResponsiveContainer width={80} height={80}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={24} outerRadius={36} startAngle={90} endAngle={-270} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <ReTooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(v: number) => [`${v}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Competição por impressões</p>
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-semibold text-foreground ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Campaign row ─────────────────────────────────────────────────────────────

function CampaignRow({ campaign, isExpanded, onToggle }: {
  campaign: Campaign;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [active, setActive] = useState(campaign.status === "active");

  const relatedAds = useMemo(() =>
    ADS_METRICS.filter(a => a.accountId === campaign.accountId).slice(0, campaign.adsCount),
    [campaign]
  );

  return (
    <>
      <tr
        className={`cursor-pointer border-b border-border transition-colors ${isExpanded ? "bg-teal-50/40" : "hover:bg-muted/30"}`}
        onClick={onToggle}
      >
        {/* Toggle status */}
        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setActive(p => !p)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${active ? "bg-teal-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
          </button>
        </td>

        {/* Expand caret */}
        <td className="px-2 py-3.5 w-8 text-muted-foreground">
          {isExpanded
            ? <ChevronDown className="h-3.5 w-3.5" />
            : <ChevronRight className="h-3.5 w-3.5" />
          }
        </td>

        {/* Name */}
        <td className="px-3 py-3.5">
          <p className="font-semibold text-sm text-foreground">{campaign.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{campaign.adsCount} anúncio(s) · {campaign.accountName}</p>
        </td>

        {/* Diagnóstico */}
        <td className="px-4 py-3.5">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${DIAG_STYLE[campaign.diagnosis]}`}>
            {DIAG_LABEL[campaign.diagnosis]}
          </span>
        </td>

        {/* Budget */}
        <td className="px-4 py-3.5 text-sm text-foreground">
          {brl(campaign.dailyBudget)}
        </td>

        {/* ROAS Objetivo */}
        <td className="px-4 py-3.5 text-sm text-muted-foreground">
          {campaign.roasTarget}x
        </td>

        {/* ROAS Real */}
        <td className="px-4 py-3.5">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${roasBadge(campaign.roas, campaign.roasTarget)}`}>
            {campaign.roas.toFixed(2)}x
          </span>
        </td>

        {/* ACOS */}
        <td className="px-4 py-3.5 text-sm">
          <span className={campaign.acos > 30 ? "text-red-600 font-semibold" : campaign.acos > 20 ? "text-amber-600 font-semibold" : "text-teal-700 font-semibold"}>
            {campaign.acos.toFixed(1)}%
          </span>
        </td>

        {/* Vendas Ads */}
        <td className="px-4 py-3.5 text-sm font-semibold text-foreground">
          {campaign.salesProductAds}
        </td>

        {/* Cliques */}
        <td className="px-4 py-3.5 text-sm text-muted-foreground">
          {campaign.clicks.toLocaleString("pt-BR")}
        </td>

        {/* Impressões */}
        <td className="px-4 py-3.5 text-sm text-muted-foreground">
          {campaign.impressions.toLocaleString("pt-BR")}
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr className="border-b border-border">
          <td colSpan={11} className="p-0">
            <div className="bg-teal-50/20 px-8 py-5 border-t border-teal-100">
              <div className="flex gap-8">
                {/* Win rate */}
                <div className="bg-white rounded-xl border border-border p-4 flex-shrink-0" style={{ minWidth: 260, boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
                  <WinRateDonut campaign={campaign} />
                </div>

                {/* Ads table */}
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Anúncios desta campanha</p>
                    <span className="text-[10px] text-muted-foreground">{campaign.adsCount} item(s)</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: "hsl(var(--muted))" }} className="border-b border-border">
                        <th className="px-4 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wide">Título</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide">Impressões</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide">Cliques</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide">ROAS</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide">Custo/clique</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-foreground uppercase tracking-wide">Vendas Ads</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {relatedAds.map(ad => (
                        <tr key={ad.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-foreground truncate max-w-[260px]">{ad.title}</p>
                            <p className="text-[10px] text-muted-foreground">{ad.id}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{ad.impressions.toLocaleString("pt-BR")}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{ad.clicks.toLocaleString("pt-BR")}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`font-bold px-1.5 py-0.5 rounded-md border text-[10px] ${roasBadge(ad.roas, campaign.roasTarget)}`}>
                              {ad.roas.toFixed(1)}x
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">
                            {ad.cpc.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-teal-700">
                            {ad.directUnits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Ads() {
  const { selectedAccountId } = useGlobalContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const campaigns = useMemo(() => {
    let list = selectedAccountId
      ? CAMPAIGNS.filter(c => c.accountId === selectedAccountId)
      : CAMPAIGNS;
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    return list;
  }, [selectedAccountId, statusFilter]);

  const summary = useMemo(() => {
    const base = selectedAccountId ? CAMPAIGNS.filter(c => c.accountId === selectedAccountId) : CAMPAIGNS;
    return {
      cost:        base.reduce((s, c) => s + c.cost, 0),
      revenue:     base.reduce((s, c) => s + c.revenue, 0),
      clicks:      base.reduce((s, c) => s + c.clicks, 0),
      impressions: base.reduce((s, c) => s + c.impressions, 0),
      salesAds:    base.reduce((s, c) => s + c.salesProductAds, 0),
      roas:        base.reduce((s, c) => s + c.cost, 0) > 0
        ? base.reduce((s, c) => s + c.revenue, 0) / base.reduce((s, c) => s + c.cost, 0)
        : 0,
      acos:        base.reduce((s, c) => s + c.revenue, 0) > 0
        ? (base.reduce((s, c) => s + c.cost, 0) / base.reduce((s, c) => s + c.revenue, 0)) * 100
        : 0,
    };
  }, [selectedAccountId]);

  const counts = useMemo(() => {
    const base = selectedAccountId ? CAMPAIGNS.filter(c => c.accountId === selectedAccountId) : CAMPAIGNS;
    return {
      all:    base.length,
      active: base.filter(c => c.status === "active").length,
      paused: base.filter(c => c.status === "paused").length,
    };
  }, [selectedAccountId]);

  return (
    <Layout>
      <PageHeader
        title="Ads & Performance"
        subtitle="Campanhas por conta — métricas consolidadas de publicidade"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <div className="xl:col-span-2">
          <KpiCard accent label="Investimento total" value={brl(summary.cost)} icon={<DollarSign className="h-4 w-4" />} />
        </div>
        <div className="xl:col-span-2">
          <KpiCard label="Receita via Ads" value={brl(summary.revenue)} icon={<TrendingUp className="h-4 w-4" />} trend={{ value: 15, isPositive: true }} />
        </div>
        <KpiCard label="ROAS geral" value={`${summary.roas.toFixed(1)}x`} icon={<BarChart2 className="h-4 w-4" />} />
        <KpiCard label="ACOS geral" value={`${summary.acos.toFixed(1)}%`} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Cliques totais" value={summary.clicks.toLocaleString("pt-BR")} icon={<MousePointerClick className="h-4 w-4" />} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit mb-4">
        {([
          { key: "all",    label: `Todas (${counts.all})` },
          { key: "active", label: `Ativas (${counts.active})` },
          { key: "paused", label: `Pausadas (${counts.paused})` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === t.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign table */}
      <div
        className="bg-white rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted))" }} className="border-b border-border">
                <th className="px-4 py-3.5 w-12" />
                <th className="px-2 py-3.5 w-8"  />
                <th className="px-3 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campanha</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Diagnóstico</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Budget/dia</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">ROAS Obj.</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">ROAS Real</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">ACOS</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vendas Ads</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliques</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Impressões</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-sm text-muted-foreground">
                    Nenhuma campanha encontrada
                  </td>
                </tr>
              ) : campaigns.map(c => (
                <CampaignRow
                  key={c.id}
                  campaign={c}
                  isExpanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {campaigns.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center gap-6 text-xs text-muted-foreground">
            <span>{campaigns.length} campanha(s)</span>
            <span>·</span>
            <span>Investimento: <strong className="text-foreground">{brl(campaigns.reduce((s, c) => s + c.cost, 0))}</strong></span>
            <span>·</span>
            <span>Vendas Ads: <strong className="text-foreground">{campaigns.reduce((s, c) => s + c.salesProductAds, 0)}</strong></span>
          </div>
        )}
      </div>
    </Layout>
  );
}
