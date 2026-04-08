import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ScoreBar } from "@/components/ScoreBar";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ITEMS } from "@/mock/data";
import { Search, ExternalLink, ChevronUp, ChevronDown, Wrench, Car } from "lucide-react";

type SortKey = "score_asc" | "score_desc" | "sales_desc" | "specs_desc";

const QUICK_FILTERS = [
  { key: "unhealthy", label: "Unhealthy" },
  { key: "warning", label: "Warning" },
  { key: "compat", label: "Compat. pendente" },
  { key: "specs", label: "Ficha incompleta" },
  { key: "ean", label: "Sem EAN" },
  { key: "negative_tag", label: "Tag negativa" },
  { key: "score_low", label: "Score < 66" },
];

export default function SaudeAnuncios() {
  const [, setLocation] = useLocation();
  const { selectedAccountId } = useGlobalContext();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score_asc");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const items = useMemo(() => {
    let list = selectedAccountId
      ? ITEMS.filter(i => i.accountId === selectedAccountId)
      : ITEMS;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "unhealthy") list = list.filter(i => i.status === "unhealthy");
    else if (activeFilter === "warning") list = list.filter(i => i.status === "warning");
    else if (activeFilter === "compat") list = list.filter(i => i.compatStatus !== "complete");
    else if (activeFilter === "specs") list = list.filter(i => i.specsPercent < 80);
    else if (activeFilter === "ean") list = list.filter(i => !i.hasEan);
    else if (activeFilter === "negative_tag") list = list.filter(i => i.hasNegativeTag);
    else if (activeFilter === "score_low") list = list.filter(i => i.score < 66);

    return list.sort((a, b) => {
      switch (sortKey) {
        case "score_asc": return a.score - b.score;
        case "score_desc": return b.score - a.score;
        case "sales_desc": return b.sales30d - a.sales30d;
        case "specs_desc": return b.specsPercent - a.specsPercent;
        default: return 0;
      }
    });
  }, [selectedAccountId, search, activeFilter, sortKey]);

  const filterCounts: Record<string, number> = useMemo(() => {
    const base = selectedAccountId ? ITEMS.filter(i => i.accountId === selectedAccountId) : ITEMS;
    return {
      unhealthy: base.filter(i => i.status === "unhealthy").length,
      warning: base.filter(i => i.status === "warning").length,
      compat: base.filter(i => i.compatStatus !== "complete").length,
      specs: base.filter(i => i.specsPercent < 80).length,
      ean: base.filter(i => !i.hasEan).length,
      negative_tag: base.filter(i => i.hasNegativeTag).length,
      score_low: base.filter(i => i.score < 66).length,
    };
  }, [selectedAccountId]);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === items.length ? [] : items.map(i => i.id));

  return (
    <Layout>
      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeFilter === f.key ? "bg-white/20 text-inherit" : "bg-muted text-muted-foreground"
            }`}>
              {filterCounts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, SKU ou MLB..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="search-items"
          />
        </div>
        <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-52" data-testid="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_asc">Score: menor primeiro</SelectItem>
            <SelectItem value="score_desc">Score: maior primeiro</SelectItem>
            <SelectItem value="sales_desc">Vendas D-30: maior</SelectItem>
            <SelectItem value="specs_desc">Ficha %: maior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <span className="font-medium">{selectedIds.length} item(ns) selecionado(s)</span>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Car className="h-3.5 w-3.5" /> Aplicar compat. em lote
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Wrench className="h-3.5 w-3.5" /> Gerar correções
          </Button>
          <button className="ml-auto text-muted-foreground hover:text-foreground text-xs" onClick={() => setSelectedIds([])}>
            Limpar seleção
          </button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={selectedIds.length === items.length && items.length > 0}
                      onCheckedChange={toggleAll}
                      data-testid="checkbox-all"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Anúncio</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-24">Conta</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-16">Curva</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-36">Score ML</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-32">Ficha</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-24">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-20">Estoque</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-24">Vendas 30d</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-muted-foreground text-sm">
                      Nenhum anúncio encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/saude/${item.id}`)}
                    data-testid={`item-row-${item.id}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                        data-testid={`checkbox-${item.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail} alt="" className="h-9 w-9 rounded-md object-cover bg-muted flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[260px]">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.id} · {item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.accountName.split(" ")[1]}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>
                        {item.curve}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ScoreBar value={item.score} />
                        <span className="text-xs font-semibold w-8 text-right">{item.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.specsPercent >= 80 ? "bg-green-500" : item.specsPercent >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${item.specsPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.specsPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{item.stock}</td>
                    <td className="px-4 py-3 text-right font-semibold">{item.sales30d}</td>
                    <td className="px-4 py-3">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            {items.length} anúncio(s) exibido(s)
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
