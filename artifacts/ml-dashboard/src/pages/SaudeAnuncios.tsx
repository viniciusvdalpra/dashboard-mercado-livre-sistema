import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ScoreBar } from "@/components/ScoreBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ITEMS } from "@/mock/data";
import { Search, ExternalLink, Wrench, Car, ChevronLeft, ChevronRight, Download } from "lucide-react";

type SortKey = "score_asc" | "score_desc" | "sales_desc" | "specs_desc";

const QUICK_FILTERS = [
  { key: "all",          label: "Todos" },
  { key: "unhealthy",    label: "Unhealthy" },
  { key: "warning",      label: "Warning" },
  { key: "compat",       label: "Compat. pendente" },
  { key: "specs",        label: "Ficha incompleta" },
  { key: "ean",          label: "Sem EAN" },
  { key: "negative_tag", label: "Tag negativa" },
  { key: "score_low",    label: "Score < 66" },
];

const PAGE_SIZE = 25;

export default function SaudeAnuncios() {
  const [, setLocation] = useLocation();
  const { selectedAccountId } = useGlobalContext();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score_asc");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const base = useMemo(() => {
    return selectedAccountId ? ITEMS.filter(i => i.accountId === selectedAccountId) : ITEMS;
  }, [selectedAccountId]);

  const filterCounts = useMemo(() => ({
    all: base.length,
    unhealthy:    base.filter(i => i.status === "unhealthy").length,
    warning:      base.filter(i => i.status === "warning").length,
    compat:       base.filter(i => i.compatStatus !== "complete").length,
    specs:        base.filter(i => i.specsPercent < 80).length,
    ean:          base.filter(i => !i.hasEan).length,
    negative_tag: base.filter(i => i.hasNegativeTag).length,
    score_low:    base.filter(i => i.score < 66).length,
  }), [base]);

  const filtered = useMemo(() => {
    let list = [...base];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    if (activeFilter === "unhealthy")    list = list.filter(i => i.status === "unhealthy");
    else if (activeFilter === "warning") list = list.filter(i => i.status === "warning");
    else if (activeFilter === "compat")  list = list.filter(i => i.compatStatus !== "complete");
    else if (activeFilter === "specs")   list = list.filter(i => i.specsPercent < 80);
    else if (activeFilter === "ean")     list = list.filter(i => !i.hasEan);
    else if (activeFilter === "negative_tag") list = list.filter(i => i.hasNegativeTag);
    else if (activeFilter === "score_low")    list = list.filter(i => i.score < 66);

    return list.sort((a, b) => {
      if (sortKey === "score_asc")  return a.score - b.score;
      if (sortKey === "score_desc") return b.score - a.score;
      if (sortKey === "sales_desc") return b.sales30d - a.sales30d;
      return b.specsPercent - a.specsPercent;
    });
  }, [base, search, activeFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(i => i.id));

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setPage(1);
  };

  return (
    <Layout>
      <PageHeader
        title="Saúde dos Anúncios"
        subtitle={`${filtered.length} anúncio(s) encontrado(s)`}
        actions={[
          { label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" },
          { label: "Gerar correções", icon: <Wrench className="h-4 w-4" />, variant: "primary" },
        ]}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 p-1 bg-white border border-border rounded-xl w-fit" style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === f.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === f.key ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"}`}>
              {filterCounts[f.key as keyof typeof filterCounts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar por título, SKU ou MLB..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            data-testid="search-items"
          />
        </div>
        <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
          <SelectTrigger className="h-10 w-52 rounded-xl bg-white border-border text-sm" data-testid="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_asc">Score: menor primeiro</SelectItem>
            <SelectItem value="score_desc">Score: maior primeiro</SelectItem>
            <SelectItem value="sales_desc">Vendas 30d: maior</SelectItem>
            <SelectItem value="specs_desc">Ficha %: maior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <span className="font-semibold text-primary">{selectedIds.length} selecionado(s)</span>
          <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg" style={{ background: "hsl(174 55% 26%)" }}>
            <Car className="h-3.5 w-3.5" /> Aplicar compat.
          </button>
          <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-foreground bg-white rounded-lg border border-border">
            <Wrench className="h-3.5 w-3.5" /> Gerar correções
          </button>
          <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedIds([])}>
            Limpar seleção
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))", borderBottom: "1px solid hsl(var(--border))" }}>
                <th className="w-10 px-4 py-3.5">
                  <Checkbox
                    checked={selectedIds.length === paginated.length && paginated.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Conta</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">Curva</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Score ML</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">Ficha</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Status</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Estoque</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Vendas 30d</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Nenhum anúncio encontrado</p>
                      <p className="text-xs text-muted-foreground">Ajuste os filtros ou a busca para ver resultados.</p>
                    </div>
                  </td>
                </tr>
              )}
              {paginated.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/saude/${item.id}`)}
                  data-testid={`item-row-${item.id}`}
                >
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={item.thumbnail} alt="" className="h-10 w-10 rounded-xl object-cover bg-muted flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate max-w-[260px] text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.id} · {item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">{item.accountName.split(" ")[1]}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-bold text-sm ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>
                      {item.curve}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <ScoreBar value={item.score} className="w-24" />
                      <span className="text-xs font-bold w-7 text-right text-muted-foreground">{item.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.specsPercent >= 80 ? "bg-primary" : item.specsPercent >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${item.specsPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.specsPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-sm">{item.stock}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-sm">{item.sales30d}</td>
                  <td className="px-4 py-3.5">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t border-border"
          style={{ background: "hsl(var(--muted) / .4)" }}
        >
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    page === p ? "bg-primary text-white" : "border border-border bg-white text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              );
            })}
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
