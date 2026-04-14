import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { Checkbox } from "@/components/ui/checkbox";
import { CORRECTIONS } from "@/mock/data";
import {
  CheckCircle, Clock, AlertCircle, Wrench, Check, ChevronLeft, ChevronRight, Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Status = "pending" | "approved" | "applied";
type TypeFilter = "all" | "compat" | "specs" | "ean" | "price" | "title";

const TYPE_LABELS: Record<string, string> = {
  compat: "Compatibilidade",
  specs:  "Ficha técnica",
  ean:    "EAN / GTIN",
  price:  "Preço",
  title:  "Título",
};

const TYPE_COLORS: Record<string, string> = {
  compat: "bg-purple-50 text-purple-700 border border-purple-200",
  specs:  "bg-blue-50 text-blue-700 border border-blue-200",
  ean:    "bg-amber-50 text-amber-700 border border-amber-200",
  price:  "bg-teal-50 text-teal-700 border border-teal-200",
  title:  "bg-rose-50 text-rose-700 border border-rose-200",
};

const PAGE_SIZE = 25;

const STATUS_STYLE: Record<Status, string> = {
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-blue-50 text-blue-700 border border-blue-200",
  applied:  "bg-teal-50 text-teal-700 border border-teal-200",
};
const STATUS_LABEL: Record<Status, string> = {
  pending:  "Pendente",
  approved: "Aprovada",
  applied:  "Aplicada",
};
const STATUS_ICON: Record<Status, React.ReactNode> = {
  pending:  <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  applied:  <Check className="h-3 w-3" />,
};

export default function Correcoes() {
  const { selectedAccountId } = useGlobalContext();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localStatuses, setLocalStatuses] = useState<Record<string, Status>>({});
  const [page, setPage] = useState(1);

  const TYPE_MAP: Record<string, string> = {
    specs_fill: "specs", specs_hidden: "specs",
    ean_fill: "ean", compat_fill: "compat",
    title_optimize: "title", price_adjust: "price",
  };
  const STATUS_MAP_RAW: Record<string, Status> = {
    pending: "pending", approved: "approved",
    executed: "applied", rejected: "approved",
  };

  const base = useMemo(() => {
    const raw = selectedAccountId
      ? CORRECTIONS.filter(c => c.accountId === selectedAccountId)
      : CORRECTIONS;
    return raw.map(c => ({
      id: String(c.id),
      itemId: c.itemId,
      title: (c as any).itemTitle ?? "",
      accountId: c.accountId,
      accountName: c.accountName,
      type: TYPE_MAP[(c.type as string)] ?? "specs",
      from: (c as any).oldValue ?? "",
      to: (c as any).newValue ?? "",
      status: STATUS_MAP_RAW[(c.status as string)] ?? "pending",
    }));
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAccountId]
  );

  const filtered = useMemo(() => {
    let list = base.map(c => ({
      ...c,
      status: (localStatuses[c.id] ?? c.status) as Status,
    }));
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    if (typeFilter   !== "all") list = list.filter(c => c.type  === typeFilter);
    return list;
  }, [base, statusFilter, typeFilter, localStatuses]);

  const counts = useMemo(() => {
    const all = base.map(c => ({ ...c, status: (localStatuses[c.id] ?? c.status) as Status }));
    return {
      all:      all.length,
      pending:  all.filter(c => c.status === "pending").length,
      approved: all.filter(c => c.status === "approved").length,
      applied:  all.filter(c => c.status === "applied").length,
    };
  }, [base, localStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingPage = paginated.filter(c => c.status === "pending");

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === pendingPage.length ? [] : pendingPage.map(c => c.id));

  const approveSelected = () => {
    if (!selectedIds.length) return;
    const upd: Record<string, Status> = { ...localStatuses };
    selectedIds.forEach(id => { upd[id] = "approved"; });
    setLocalStatuses(upd);
    toast({ title: `${selectedIds.length} correção(ões) aprovada(s)`, description: "Aguardando aplicação pelo sistema." });
    setSelectedIds([]);
  };

  const handleFilterStatus = (v: "all" | Status) => { setStatusFilter(v); setPage(1); };
  const handleFilterType   = (v: TypeFilter)     => { setTypeFilter(v);   setPage(1); };

  const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
    { key: "all",    label: "Todos" },
    { key: "compat", label: "Compatibilidade" },
    { key: "specs",  label: "Ficha técnica" },
    { key: "ean",    label: "EAN" },
    { key: "price",  label: "Preço" },
    { key: "title",  label: "Título" },
  ];

  return (
    <Layout>
      <PageHeader
        title="Correções"
        subtitle={`${counts.pending} correção(ões) pendente(s) de aprovação`}
        actions={[
          { label: "Exportar", icon: <Download className="h-4 w-4" />, variant: "outline" },
          { label: "Gerar novas", icon: <Wrench className="h-4 w-4" />, variant: "primary" },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total" value={counts.all} icon={<Wrench className="h-4 w-4" />} onClick={() => { setStatusFilter("all"); setPage(1); }} />
        <KpiCard label="Pendentes" value={counts.pending} icon={<Clock className="h-4 w-4" />} onClick={() => { setStatusFilter("pending"); setPage(1); }} />
        <KpiCard label="Aprovadas" value={counts.approved} icon={<CheckCircle className="h-4 w-4" />} onClick={() => { setStatusFilter("approved"); setPage(1); }} />
        <KpiCard accent label="Aplicadas" value={counts.applied} icon={<Check className="h-4 w-4" />} onClick={() => { setStatusFilter("applied"); setPage(1); }} />
      </div>

      {/* Status tabs + type filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex p-1 bg-white border border-border rounded-xl gap-1" style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
          {(["all", "pending", "approved", "applied"] as const).map(s => (
            <button
              key={s}
              onClick={() => handleFilterStatus(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`status-${s}`}
            >
              {s === "all" ? "Todos" : STATUS_LABEL[s]}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === s ? "bg-white/25" : "bg-muted"}`}>
                {s === "all" ? counts.all : counts[s as Status]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex p-1 bg-white border border-border rounded-xl gap-1" style={{ boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterType(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === f.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">{selectedIds.length} selecionada(s)</span>
          <button
            onClick={approveSelected}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg"
            style={{ background: "hsl(174 55% 26%)" }}
          >
            <Check className="h-3.5 w-3.5" /> Aprovar selecionadas
          </button>
          <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedIds([])}>
            Limpar
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
                    checked={selectedIds.length === pendingPage.length && pendingPage.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anúncio</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">Tipo</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">De</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Para</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Nenhuma correção encontrada</p>
                      <p className="text-xs text-muted-foreground">Ajuste os filtros para ver resultados.</p>
                    </div>
                  </td>
                </tr>
              )}
              {paginated.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    {c.status === "pending" && (
                      <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground truncate max-w-[200px]">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.itemId}</div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${TYPE_COLORS[c.type] ?? "bg-muted"}`}>
                      {TYPE_LABELS[c.type] ?? c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[140px] truncate">{c.from}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-foreground max-w-[140px] truncate">{c.to}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_STYLE[c.status]}`}>
                      {STATUS_ICON[c.status]}
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {c.status === "pending" && (
                      <button
                        onClick={() => {
                          setLocalStatuses(p => ({ ...p, [c.id]: "approved" }));
                          toast({ title: "Correção aprovada", description: c.title });
                        }}
                        className="h-7 px-3 text-xs font-semibold text-white rounded-lg transition-all"
                        style={{ background: "hsl(174 55% 26%)" }}
                        data-testid={`approve-${c.id}`}
                      >
                        Aprovar
                      </button>
                    )}
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
    </Layout>
  );
}
