import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { CAMPAIGNS, ADS_METRICS, type Campaign } from "@/mock/data";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList,
} from "recharts";
import {
  DollarSign, TrendingUp, MousePointerClick, BarChart2,
  ChevronDown, ChevronRight, Download, TrendingDown,
  AlertTriangle, CheckCircle2, Zap, Eye,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function num(v: number) { return v.toLocaleString("pt-BR"); }

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
const DIAG_COLORS: Record<string, string> = {
  excelente: "#0d9488",
  bom:       "#3b82f6",
  regular:   "#f59e0b",
  ruim:      "#ef4444",
};

function roasBadge(roas: number, target: number) {
  const r = roas / target;
  if (r >= 1)   return "bg-teal-50 text-teal-700 border-teal-200";
  if (r >= 0.7) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

// ── Win-rate donut ────────────────────────────────────────────────────────────

function WinRateDonut({ campaign }: { campaign: Campaign }) {
  const data = [
    { name: "Ganhas",                    value: campaign.winRate,     color: "#0d9488" },
    { name: "Perdidas p/ orçamento",     value: campaign.lostBudget,  color: "#f97316" },
    { name: "Perdidas p/ classificação", value: campaign.lostRanking, color: "#94a3b8" },
  ];
  return (
    <div className="flex items-center gap-4 py-2">
      <ResponsiveContainer width={80} height={80}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={24} outerRadius={36}
            startAngle={90} endAngle={-270} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(v: number) => [`${v}%`]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Competição por impressões
        </p>
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

// ── Campaign row (in Campanhas tab) ──────────────────────────────────────────

function CampaignRow({
  campaign, isExpanded, onToggle,
}: { campaign: Campaign; isExpanded: boolean; onToggle: () => void }) {
  const [active, setActive] = useState(campaign.status === "active");
  const relatedAds = useMemo(
    () => ADS_METRICS.filter(a => a.accountId === campaign.accountId).slice(0, campaign.adsCount),
    [campaign],
  );

  return (
    <>
      <tr
        className={`cursor-pointer border-b border-border transition-colors ${isExpanded ? "bg-teal-50/40" : "hover:bg-muted/30"}`}
        onClick={onToggle}
      >
        {/* Toggle */}
        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setActive(p => !p)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${active ? "bg-teal-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
          </button>
        </td>
        <td className="px-2 py-3.5 w-8 text-muted-foreground">
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </td>
        <td className="px-3 py-3.5">
          <p className="font-semibold text-sm text-foreground">{campaign.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {campaign.adsCount} anúncio(s) · {campaign.accountName}
          </p>
        </td>
        <td className="px-4 py-3.5">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${DIAG_STYLE[campaign.diagnosis]}`}>
            {DIAG_LABEL[campaign.diagnosis]}
          </span>
        </td>
        <td className="px-4 py-3.5 text-sm text-foreground">{brl(campaign.dailyBudget)}</td>
        <td className="px-4 py-3.5 text-sm text-muted-foreground">{campaign.roasTarget}x</td>
        <td className="px-4 py-3.5">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${roasBadge(campaign.roas, campaign.roasTarget)}`}>
            {campaign.roas.toFixed(2)}x
          </span>
        </td>
        <td className="px-4 py-3.5 text-sm">
          <span className={campaign.acos > 30 ? "text-red-600 font-semibold" : campaign.acos > 20 ? "text-amber-600 font-semibold" : "text-teal-700 font-semibold"}>
            {campaign.acos.toFixed(1)}%
          </span>
        </td>
        <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{campaign.salesProductAds}</td>
        <td className="px-4 py-3.5 text-sm text-muted-foreground">{num(campaign.clicks)}</td>
        <td className="px-4 py-3.5 text-sm text-muted-foreground">{num(campaign.impressions)}</td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr className="border-b border-border">
          <td colSpan={11} className="p-0">
            <div className="bg-teal-50/20 px-8 py-5 border-t border-teal-100">
              <div className="flex gap-8">
                <div className="bg-white rounded-xl border border-border p-4 flex-shrink-0"
                  style={{ minWidth: 260, boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
                  <WinRateDonut campaign={campaign} />
                </div>
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-border overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
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
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{num(ad.impressions)}</td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">{num(ad.clicks)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`font-bold px-1.5 py-0.5 rounded-md border text-[10px] ${roasBadge(ad.roas, campaign.roasTarget)}`}>
                              {ad.roas.toFixed(1)}x
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-muted-foreground">
                            {ad.cpc.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-teal-700">{ad.directUnits}</td>
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

// ── Visão Geral tab ───────────────────────────────────────────────────────────

function VisaoGeral({ campaigns }: { campaigns: Campaign[] }) {
  const summary = useMemo(() => ({
    cost:        campaigns.reduce((s, c) => s + c.cost, 0),
    revenue:     campaigns.reduce((s, c) => s + c.revenue, 0),
    clicks:      campaigns.reduce((s, c) => s + c.clicks, 0),
    impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
    salesAds:    campaigns.reduce((s, c) => s + c.salesProductAds, 0),
    roas: campaigns.reduce((s, c) => s + c.cost, 0) > 0
      ? campaigns.reduce((s, c) => s + c.revenue, 0) / campaigns.reduce((s, c) => s + c.cost, 0)
      : 0,
    acos: campaigns.reduce((s, c) => s + c.revenue, 0) > 0
      ? (campaigns.reduce((s, c) => s + c.cost, 0) / campaigns.reduce((s, c) => s + c.revenue, 0)) * 100
      : 0,
  }), [campaigns]);

  const diagData = useMemo(() => {
    const counts: Record<string, number> = { excelente: 0, bom: 0, regular: 0, ruim: 0 };
    campaigns.forEach(c => counts[c.diagnosis]++);
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: DIAG_LABEL[k], value: v, color: DIAG_COLORS[k] }));
  }, [campaigns]);

  const roasChartData = useMemo(() =>
    campaigns
      .slice()
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 10)
      .map(c => ({
        name: c.name.length > 22 ? c.name.slice(0, 22) + "…" : c.name,
        roas: c.roas,
        target: c.roasTarget,
        fill: c.roas >= c.roasTarget ? "#0d9488" : c.roas >= c.roasTarget * 0.7 ? "#f59e0b" : "#ef4444",
      })),
    [campaigns],
  );

  const recos = useMemo(() => {
    const out: { icon: React.ReactNode; color: string; title: string; desc: string }[] = [];
    const highAcos = campaigns.filter(c => c.acos > 50 && c.status === "active");
    if (highAcos.length)
      out.push({ icon: <AlertTriangle className="h-4 w-4" />, color: "red",
        title: `${highAcos.length} campanha(s) com ACOS > 50%`,
        desc: `${highAcos.map(c => c.name).slice(0, 2).join(", ")} — revisar lances ou pausar` });

    const lostBudget = campaigns.filter(c => c.lostBudget > 10 && c.status === "active");
    if (lostBudget.length)
      out.push({ icon: <TrendingDown className="h-4 w-4" />, color: "amber",
        title: `${lostBudget.length} campanha(s) perdendo impressões por orçamento`,
        desc: `Aumentar budget diário em ${lostBudget.map(c => c.name).slice(0, 2).join(", ")}` });

    const overTarget = campaigns.filter(c => c.roas >= c.roasTarget * 1.3 && c.status === "active");
    if (overTarget.length)
      out.push({ icon: <Zap className="h-4 w-4" />, color: "teal",
        title: `${overTarget.length} campanha(s) superando a meta de ROAS`,
        desc: `${overTarget.map(c => c.name).slice(0, 2).join(", ")} — considere escalar o budget` });

    const excellent = campaigns.filter(c => c.diagnosis === "excelente").length;
    if (excellent)
      out.push({ icon: <CheckCircle2 className="h-4 w-4" />, color: "blue",
        title: `${excellent} campanha(s) com diagnóstico Excelente`,
        desc: "Mantenha a estratégia atual e monitore semanalmente" });

    return out;
  }, [campaigns]);

  const colorMap = {
    red:   { card: "bg-red-50 border-red-200",   icon: "bg-red-100 text-red-600",   title: "text-red-800",   desc: "text-red-600"   },
    amber: { card: "bg-amber-50 border-amber-200", icon: "bg-amber-100 text-amber-600", title: "text-amber-800", desc: "text-amber-600" },
    teal:  { card: "bg-teal-50 border-teal-200",  icon: "bg-teal-100 text-teal-600",  title: "text-teal-800",  desc: "text-teal-600"  },
    blue:  { card: "bg-blue-50 border-blue-200",  icon: "bg-blue-100 text-blue-600",  title: "text-blue-800",  desc: "text-blue-600"  },
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="xl:col-span-1">
          <KpiCard accent label="Investimento" value={brl(summary.cost)} icon={<DollarSign className="h-4 w-4" />} />
        </div>
        <div className="xl:col-span-1">
          <KpiCard label="Receita via Ads" value={brl(summary.revenue)} icon={<TrendingUp className="h-4 w-4" />} trend={{ value: 15, isPositive: true }} />
        </div>
        <KpiCard label="ROAS geral" value={`${summary.roas.toFixed(1)}x`} icon={<BarChart2 className="h-4 w-4" />} />
        <KpiCard label="ACOS geral" value={`${summary.acos.toFixed(1)}%`} icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Vendas via Ads" value={num(summary.salesAds)} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Cliques" value={num(summary.clicks)} icon={<MousePointerClick className="h-4 w-4" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ROAS by campaign */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border p-5"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-foreground">ROAS por Campanha</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real vs objetivo — top 10</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500 inline-block"/>Acima da meta</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block"/>Próximo</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block"/>Abaixo</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={roasChartData} layout="vertical" margin={{ left: 8, right: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="transparent" tickFormatter={v => `${v}x`} />
              <YAxis type="category" dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                stroke="transparent" width={160} />
              <ReTooltip
                contentStyle={{ background: "white", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, _name: string, props: { payload?: { target?: number } }) => [
                  `${v.toFixed(2)}x (meta: ${props.payload?.target ?? "?"}x)`, "ROAS",
                ]}
              />
              <ReferenceLine x={0} stroke="transparent" />
              <Bar dataKey="roas" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {roasChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                <LabelList dataKey="roas" position="right"
                  formatter={(v: number) => `${v.toFixed(1)}x`}
                  style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnóstico donut */}
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
          <h3 className="font-bold text-sm text-foreground mb-1">Saúde das Campanhas</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição por diagnóstico</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={diagData} dataKey="value" innerRadius={42} outerRadius={64}
                  startAngle={90} endAngle={-270} strokeWidth={2} stroke="white">
                  {diagData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 10 }}
                  formatter={(v: number, name: string) => [`${v} campanha(s)`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 w-full mt-2">
              {diagData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground flex-1">{d.name}</span>
                  <span className="font-bold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-border p-5"
        style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <h3 className="font-bold text-sm text-foreground mb-4">Recomendações automáticas</h3>
        {recos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma recomendação no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {recos.map((r, i) => {
              const s = colorMap[r.color as keyof typeof colorMap];
              return (
                <div key={i} className={`rounded-xl border p-4 ${s.card}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-3 ${s.icon}`}>
                    {r.icon}
                  </div>
                  <p className={`text-xs font-bold leading-snug mb-1.5 ${s.title}`}>{r.title}</p>
                  <p className={`text-[11px] leading-relaxed ${s.desc}`}>{r.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top 3 campaigns */}
      <div>
        <h3 className="font-bold text-sm text-foreground mb-3">Melhores campanhas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {campaigns
            .filter(c => c.status === "active")
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 3)
            .map((c, i) => (
              <div key={c.id}
                className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground">#{i + 1} melhor ROAS</span>
                    <p className="font-bold text-sm text-foreground mt-0.5 leading-snug">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.accountName}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${DIAG_STYLE[c.diagnosis]}`}>
                    {DIAG_LABEL[c.diagnosis]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "ROAS",       value: `${c.roas.toFixed(1)}x` },
                    { label: "ACOS",       value: `${c.acos.toFixed(1)}%` },
                    { label: "Vendas Ads", value: c.salesProductAds },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/40 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border">
                  <span>Investido: <strong className="text-foreground">{brl(c.cost)}</strong></span>
                  <span>Receita: <strong className="text-teal-700">{brl(c.revenue)}</strong></span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Campanhas tab ─────────────────────────────────────────────────────────────

function Campanhas({ campaigns }: { campaigns: Campaign[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter(c => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const counts = {
    all:    campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    paused: campaigns.filter(c => c.status === "paused").length,
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {([
          { key: "all",    label: `Todas (${counts.all})` },
          { key: "active", label: `Ativas (${counts.active})` },
          { key: "paused", label: `Pausadas (${counts.paused})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === t.key
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted))" }} className="border-b border-border">
                <th className="px-4 py-3.5 w-12" />
                <th className="px-2 py-3.5 w-8" />
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
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="py-14 text-center text-sm text-muted-foreground">Nenhuma campanha encontrada</td></tr>
              ) : filtered.map(c => (
                <CampaignRow key={c.id} campaign={c}
                  isExpanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center gap-6 text-xs text-muted-foreground">
            <span>{filtered.length} campanha(s)</span>
            <span>·</span>
            <span>Investimento: <strong className="text-foreground">{brl(filtered.reduce((s, c) => s + c.cost, 0))}</strong></span>
            <span>·</span>
            <span>Vendas Ads: <strong className="text-foreground">{filtered.reduce((s, c) => s + c.salesProductAds, 0)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "campaigns";

export default function Ads() {
  const { selectedAccountId } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const campaigns = useMemo(() =>
    selectedAccountId
      ? CAMPAIGNS.filter(c => c.accountId === selectedAccountId)
      : CAMPAIGNS,
    [selectedAccountId],
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview",   label: "Visão Geral",  icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "campaigns",  label: "Campanhas",    icon: <BarChart2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <Layout>
      <PageHeader
        title="Ads & Performance"
        subtitle="Publicidade patrocinada — visão consolidada por conta"
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

      {activeTab === "overview"  && <VisaoGeral campaigns={campaigns} />}
      {activeTab === "campaigns" && <Campanhas  campaigns={campaigns} />}
    </Layout>
  );
}
