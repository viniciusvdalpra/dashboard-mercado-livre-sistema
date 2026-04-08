import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { PRICE_ITEMS } from "@/mock/data";
import {
  DollarSign, TrendingDown, TrendingUp, ArrowUpDown,
  Send, CheckCircle, Search, ChevronLeft, ChevronRight, Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PriceFilter = "all" | "below_min" | "above_max" | "no_competitors" | "queued";

const FILTERS: { key: PriceFilter; label: string }[] = [
  { key: "all",            label: "Todos" },
  { key: "below_min",      label: "Abaixo do mínimo" },
  { key: "above_max",      label: "Acima do máximo" },
  { key: "no_competitors", label: "Sem concorrentes" },
  { key: "queued",         label: "Na fila" },
];

const PAGE_SIZE = 25;

function priceBadge(price: number, min: number, max: number) {
  if (price < min) return "bg-red-50 text-red-700 border border-red-200";
  if (price > max) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-teal-50 text-teal-700 border border-teal-200";
}
function priceBadgeLabel(price: number, min: number, max: number) {
  if (price < min) return "Abaixo";
  if (price > max) return "Acima";
  return "OK";
}

export default function Precos() {
  const { selectedAccountId } = useGlobalContext();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<PriceFilter>("all");
  const [search, setSearch] = useState("");
  const [queued, setQueued] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const base = useMemo(() =>
    selectedAccountId ? PRICE_ITEMS.filter(i => i.accountId === selectedAccountId) : PRICE_ITEMS,
    [selectedAccountId]
  );

  const filtered = useMemo(() => {
    let list = [...base];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    switch (activeFilter) {
      case "below_min":      list = list.filter(i => i.price < i.minPrice); break;
      case "above_max":      list = list.filter(i => i.price > i.maxPrice); break;
      case "no_competitors": list = list.filter(i => i.competitors === 0); break;
      case "queued":         list = list.filter(i => queued.has(i.id)); break;
    }
    return list;
  }, [base, search, activeFilter, queued]);

  const counts = useMemo(() => ({
    all:            base.length,
    below_min:      base.filter(i => i.price < i.minPrice).length,
    above_max:      base.filter(i => i.price > i.maxPrice).length,
    no_competitors: base.filter(i => i.competitors === 0).length,
    queued:         queued.size,
  }), [base, queued]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgPrice    = base.length ? base.reduce((s, i) => s + i.price, 0) / base.length : 0;
  const belowCount  = counts.below_min;
  const aboveCount  = counts.above_max;

  const sendToQueue = (id: string, title: string, newPrice: number) => {
    setQueued(prev => new Set([...prev, id]));
    toast({
      title: "Adicionado à fila",
      description: `"${title.slice(0, 40)}..." → R$ ${newPrice.toFixed(2)}`,
    });
  };

  const handleFilterChange = (key: PriceFilter) => { setActiveFilter(key); setPage(1); };

  return (
    <Layout>
      <PageHeader
        title="Preços"
        subtitle="Monitoramento de preços e envio à fila de atualização"
        actions={[
          { label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" },
          queued.size > 0
            ? { label: `Enviar fila (${queued.size})`, icon: <Send className="h-4 w-4" />, variant: "primary" }
            : undefined,
        ].filter(Boolean) as any}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard accent label="Preço médio" value={avgPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} icon={<DollarSign className="h-4 w-4" />} onClick={() => { setActiveFilter("all"); setPage(1); }} />
        <KpiCard label="Abaixo do mínimo" value={belowCount} icon={<TrendingDown className="h-4 w-4" />} trend={{ value: 5.1, isPositive: false }} onClick={() => { setActiveFilter("below_min"); setPage(1); }} />
        <KpiCard label="Acima do máximo" value={aboveCount} icon={<TrendingUp className="h-4 w-4" />} onClick={() => { setActiveFilter("above_max"); setPage(1); }} />
        <KpiCard label="Na fila de envio" value={queued.size} icon={<Send className="h-4 w-4" />} onClick={() => { setActiveFilter("queued"); setPage(1); }} />
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex p-1 bg-white border border-border rounded-xl gap-1" style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === f.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === f.key ? "bg-white/25" : "bg-muted"}`}>
                {counts[f.key as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por título ou MLB..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Preço atual</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Mínimo</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Máximo</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Sugerido</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Situação</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">
                  <ArrowUpDown className="h-3.5 w-3.5 inline" /> Concorrentes
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Nenhum item encontrado</p>
                      <p className="text-xs text-muted-foreground">Ajuste os filtros para ver resultados.</p>
                    </div>
                  </td>
                </tr>
              )}
              {paginated.map(item => {
                const isQueued = queued.has(item.id);
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground truncate max-w-[240px]">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.id} · {item.accountName.split(" ")[1]}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold">
                      {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      {item.minPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground">
                      {item.maxPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-teal-700">
                      {item.suggestedPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${priceBadge(item.price, item.minPrice, item.maxPrice)}`}>
                        {priceBadgeLabel(item.price, item.minPrice, item.maxPrice)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm">{item.competitors}</td>
                    <td className="px-5 py-3.5 text-center">
                      {isQueued ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Na fila
                        </span>
                      ) : (
                        <button
                          onClick={() => sendToQueue(item.id, item.title, item.suggestedPrice)}
                          className="flex items-center gap-1.5 h-7 px-3 text-xs font-semibold text-white rounded-lg mx-auto"
                          style={{ background: "hsl(174 55% 26%)" }}
                          data-testid={`queue-${item.id}`}
                        >
                          <Send className="h-3 w-3" /> Enviar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
    </Layout>
  );
}
