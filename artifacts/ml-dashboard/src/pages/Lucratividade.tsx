import { useState, useMemo, Fragment } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { SALES_PROFITABILITY, type SaleProfitability } from "@/mock/data";
import { TrendingUp, Download, ChevronDown, ChevronUp, ChevronsUpDown, Truck, Megaphone, Receipt } from "lucide-react";

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const PCT = (v: number) => `${v.toFixed(1)}%`;

function marginColor(m: number) {
  if (m > 10) return "text-teal-700";
  if (m >= 0) return "text-amber-600";
  return "text-red-600";
}
function marginBg(m: number) {
  if (m > 10) return "bg-teal-50 text-teal-700 border-teal-200";
  if (m >= 0) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

type SortKey = keyof SaleProfitability | null;
type SortDir = "asc" | "desc";


export default function Lucratividade() {
  const { selectedAccountId } = useGlobalContext();
  const [period, setPeriod]   = useState<7 | 15 | 30 | 60 | 90>(30);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const cutoff = useMemo(() => {
    const d = new Date(2026, 3, 8);
    d.setDate(d.getDate() - period);
    return d;
  }, [period]);

  const base = useMemo(() => {
    return SALES_PROFITABILITY.filter(s => {
      const [day, month, year] = s.date.split("/").map(Number);
      const saleDate = new Date(year, month - 1, day);
      if (saleDate < cutoff) return false;
      if (selectedAccountId && s.accountId !== selectedAccountId) return false;
      return true;
    });
  }, [cutoff, selectedAccountId]);

  const sorted = useMemo(() => {
    if (!sortKey) return base;
    return [...base].sort((a, b) => {
      const va = a[sortKey] as number | string;
      const vb = b[sortKey] as number | string;
      if (typeof va === "number" && typeof vb === "number")
        return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [base, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40 inline ml-1" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 inline ml-1 text-primary" />
      : <ChevronDown className="h-3 w-3 inline ml-1 text-primary" />;
  }

  const kpis = useMemo(() => {
    const revenue       = base.reduce((s, r) => s + r.revenue, 0);
    const cmv           = base.reduce((s, r) => s + r.cmv, 0);
    const mlComm        = base.reduce((s, r) => s + r.mlCommission, 0);
    const shipping      = base.reduce((s, r) => s + r.shippingCost, 0);
    const ads           = base.reduce((s, r) => s + r.adsCost, 0);
    const tax           = base.reduce((s, r) => s + r.taxAmount, 0);
    const packaging     = base.reduce((s, r) => s + r.packagingCost, 0);
    const netProfit     = base.reduce((s, r) => s + r.netProfit, 0);
    const grossProfit   = revenue - cmv;
    const avgNetMargin  = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const avgGrossMargin= revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    return { revenue, cmv, mlComm, shipping, ads, tax, packaging, netProfit, grossProfit, avgNetMargin, avgGrossMargin, count: base.length };
  }, [base]);

  const headerCls = "px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide select-none cursor-pointer hover:text-foreground transition-colors whitespace-nowrap";

  return (
    <Layout>
      <PageHeader
        title="Lucratividade por Venda"
        subtitle="Custo total, CMV e margem líquida por pedido"
        actions={[{ label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" }]}
      />

      {/* Period toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-muted-foreground font-medium">Período:</span>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {([7, 15, 30, 60, 90] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 font-medium transition-colors ${period === p ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards — linha 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
        <KpiCard label="Faturamento bruto"   value={BRL(kpis.revenue)}   icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="CMV — ERP"           value={BRL(kpis.cmv)}       icon={<TrendingUp className="h-4 w-4" />} subtext={`${PCT(kpis.cmv / kpis.revenue * 100)} da receita`} />
        <KpiCard label="Lucro líquido"       value={BRL(kpis.netProfit)} icon={<TrendingUp className="h-4 w-4" />} subtext={`Margem ${PCT(kpis.avgNetMargin)}`} />
        <KpiCard label="Pedidos analisados"  value={kpis.count}          icon={<TrendingUp className="h-4 w-4" />} subtext={`Margem bruta ${PCT(kpis.avgGrossMargin)}`} />
      </div>
      {/* KPI cards — linha 2: custos detalhados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Comissão — Mercado Livre" value={BRL(kpis.mlComm)}  icon={<TrendingUp className="h-4 w-4" />} subtext={PCT(kpis.mlComm / kpis.revenue * 100)} />
        <KpiCard label="Frete — Mercado Livre"    value={BRL(kpis.shipping)} icon={<Truck className="h-4 w-4" />}     subtext={PCT(kpis.shipping / kpis.revenue * 100)} />
        <KpiCard label="Ads — Mercado Livre"      value={BRL(kpis.ads)}      icon={<Megaphone className="h-4 w-4" />} subtext={PCT(kpis.ads / kpis.revenue * 100)} />
        <KpiCard label="ICMS — Calculado"         value={BRL(kpis.tax)}      icon={<Receipt className="h-4 w-4" />}   subtext={`${PCT(kpis.tax / kpis.revenue * 100)} · 2,6% + DIFAL`} />
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className={headerCls} onClick={() => toggleSort("date")}>Data<SortIcon k="date" /></th>
                <th className={headerCls} onClick={() => toggleSort("title")}>Produto<SortIcon k="title" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("revenue")}>Receita<SortIcon k="revenue" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("cmv")}>CMV<SortIcon k="cmv" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("mlCommission")}>Comissão<SortIcon k="mlCommission" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("shippingCost")}>Frete<SortIcon k="shippingCost" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("adsCost")}>Ads<SortIcon k="adsCost" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("taxAmount")}>ICMS<SortIcon k="taxAmount" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("netProfit")}>Lucro Líq.<SortIcon k="netProfit" /></th>
                <th className={`${headerCls} text-right`} onClick={() => toggleSort("netMargin")}>Margem<SortIcon k="netMargin" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map(s => (
                <Fragment key={s.id}>
                  <tr
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground truncate max-w-[220px]">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.id} · {s.accountName.split(" ")[1]} {s.qty > 1 && <span className="font-semibold text-primary">×{s.qty}</span>}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{BRL(s.revenue)}</td>
                    <td className="px-4 py-3 text-right text-indigo-600">{BRL(s.cmv)}</td>
                    <td className="px-4 py-3 text-right text-orange-500">{BRL(s.mlCommission)}</td>
                    <td className="px-4 py-3 text-right text-sky-600">{BRL(s.shippingCost)}</td>
                    <td className="px-4 py-3 text-right text-purple-600">{s.adsCost > 0 ? BRL(s.adsCost) : <span className="text-muted-foreground/50">—</span>}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{BRL(s.taxAmount)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${marginColor(s.netMargin)}`}>{BRL(s.netProfit)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-xs font-bold ${marginBg(s.netMargin)}`}>
                        {PCT(s.netMargin)}
                      </span>
                    </td>
                  </tr>

                  {expanded === s.id && (
                    <tr key={`${s.id}-exp`} className="bg-muted/20">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Produto</p>
                            <p><span className="text-muted-foreground">SKU:</span> <span className="font-medium">{s.sku}</span></p>
                            <p><span className="text-muted-foreground">Qtd:</span> <span className="font-medium">{s.qty} un</span></p>
                            <p><span className="text-muted-foreground">Preço unit.:</span> <span className="font-medium">{BRL(s.unitPrice)}</span></p>
                            <p><span className="text-muted-foreground">Custo unit. (ERP):</span> <span className="font-medium text-indigo-600">{BRL(s.unitCost)}</span></p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Custos ML</p>
                            <p><span className="text-muted-foreground">Comissão ({(s.mlCommissionRate * 100).toFixed(0)}%):</span> <span className="font-medium text-orange-500">{BRL(s.mlCommission)}</span></p>
                            <p><span className="text-muted-foreground">Frete (custo real):</span> <span className="font-medium text-sky-600">{BRL(s.shippingCost)}</span></p>
                            <p><span className="text-muted-foreground">Ads Product:</span> <span className="font-medium text-purple-600">{s.adsCost > 0 ? BRL(s.adsCost) : "Sem ads"}</span></p>
                            <p><span className="text-muted-foreground">Embalagem:</span> <span className="font-medium">{BRL(s.packagingCost)}</span></p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">ICMS</p>
                            <p><span className="text-muted-foreground">UF comprador:</span> <span className="font-bold">{s.buyerState}</span></p>
                            {s.buyerState === "SC" ? (
                              <p><span className="text-muted-foreground">ICMS interno SC:</span> <span className="font-medium text-amber-600">7,00%</span></p>
                            ) : (
                              <>
                                <p><span className="text-muted-foreground">Interestadual SC:</span> <span className="font-medium">2,60%</span></p>
                                <p><span className="text-muted-foreground">DIFAL {s.buyerState}:</span> <span className="font-medium">{(s.icmsDifal * 100).toFixed(1)}%</span></p>
                                <p><span className="text-muted-foreground">Total ICMS:</span> <span className="font-medium text-amber-600">{(s.taxRate * 100).toFixed(2)}%</span></p>
                              </>
                            )}
                            <p><span className="text-muted-foreground">Valor ICMS:</span> <span className="font-bold text-amber-600">{BRL(s.taxAmount)}</span></p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">Resultado</p>
                            <p><span className="text-muted-foreground">Margem bruta:</span> <span className={`font-bold ${marginColor(s.grossMargin)}`}>{PCT(s.grossMargin)}</span></p>
                            <p><span className="text-muted-foreground">Total deduções:</span> <span className="font-medium">{BRL(s.totalDeductions)}</span></p>
                            <p><span className="text-muted-foreground">Total custos:</span> <span className="font-medium">{BRL(s.totalCosts)}</span></p>
                            <p><span className="text-muted-foreground">Lucro líquido:</span> <span className={`font-bold ${marginColor(s.netMargin)}`}>{BRL(s.netProfit)} ({PCT(s.netMargin)})</span></p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>{sorted.length} pedido(s) · Clique na linha para expandir detalhes</span>
          <span className={`font-bold ${marginColor(kpis.avgNetMargin)}`}>
            Margem média: {PCT(kpis.avgNetMargin)}
          </span>
        </div>
      </div>
    </Layout>
  );
}
