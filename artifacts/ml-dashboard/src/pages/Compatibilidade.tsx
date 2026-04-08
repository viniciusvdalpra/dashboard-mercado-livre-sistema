import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { VEHICLE_CATALOG, ENGINE_OPTIONS, COMPAT_ITEMS } from "@/mock/data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Car, X, Search, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SelectedVehicle {
  id: string;
  marca: string;
  modelo: string;
  anoInicio: string;
  anoFim: string;
  motor: string;
  label: string;
}

const PAGE_SIZE = 20;

function VehicleTag({ vehicle, onRemove }: { vehicle: SelectedVehicle; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-sm">
      <Car className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
      <span className="text-teal-800 font-medium text-xs flex-1 min-w-0 truncate">{vehicle.label}</span>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-teal-500 hover:text-teal-800 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function Compatibilidade() {
  const { selectedAccountId } = useGlobalContext();
  const { toast } = useToast();

  const marcas = Object.keys(VEHICLE_CATALOG).sort();

  const [marca, setMarca]         = useState("");
  const [modelo, setModelo]       = useState("");
  const [anoInicio, setAnoInicio] = useState("");
  const [anoFim, setAnoFim]       = useState("");
  const [motor, setMotor]         = useState("");
  const [vehicles, setVehicles]   = useState<SelectedVehicle[]>([]);

  const [tab, setTab]           = useState<"needs" | "all">("needs");
  const [search, setSearch]     = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage]         = useState(1);
  const [applying, setApplying] = useState(false);

  const modelos = marca ? Object.keys(VEHICLE_CATALOG[marca]).sort() : [];
  const anos    = modelo && marca ? VEHICLE_CATALOG[marca][modelo] : [];

  const base = useMemo(() =>
    selectedAccountId
      ? COMPAT_ITEMS.filter(i => i.accountId === selectedAccountId)
      : COMPAT_ITEMS,
    [selectedAccountId]
  );

  const filtered = useMemo(() => {
    let list = tab === "needs" ? base.filter(i => i.needsCompat) : base;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    return list;
  }, [base, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    needs: base.filter(i => i.needsCompat).length,
    all:   base.length,
  }), [base]);

  const canAdd = marca && modelo && anoInicio && anoFim;

  const handleAddVehicle = () => {
    if (!canAdd) return;
    const motorLabel = motor && motor !== "Todos os motores" ? ` · ${motor}` : "";
    const label = `${marca} ${modelo} ${anoInicio}–${anoFim}${motorLabel}`;
    const id = `${marca}-${modelo}-${anoInicio}-${anoFim}-${motor}`;
    if (vehicles.find(v => v.id === id)) return;
    setVehicles(prev => [...prev, { id, marca, modelo, anoInicio, anoFim, motor, label }]);
    setMarca(""); setModelo(""); setAnoInicio(""); setAnoFim(""); setMotor("");
  };

  const removeVehicle = (id: string) =>
    setVehicles(prev => prev.filter(v => v.id !== id));

  const toggleItem = (id: string) =>
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () => {
    const pageIds = paginated.map(i => i.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (allSelected) pageIds.forEach(id => n.delete(id));
      else             pageIds.forEach(id => n.add(id));
      return n;
    });
  };

  const allPageSelected = paginated.length > 0 && paginated.every(i => selectedIds.has(i.id));
  const totalLinks = vehicles.length * selectedIds.size;

  const handleApply = () => {
    if (!totalLinks) return;
    setApplying(true);
    setTimeout(() => {
      toast({
        title: `${totalLinks} vínculos enviados para a fila`,
        description: `${vehicles.length} veículo(s) · ${selectedIds.size} anúncio(s) selecionado(s)`,
      });
      setSelectedIds(new Set());
      setVehicles([]);
      setApplying(false);
    }, 1200);
  };

  return (
    <Layout>
      <PageHeader
        title="Vínculos em Massa"
        subtitle="Selecione veículos compatíveis e aplique a múltiplos anúncios de uma vez"
      />

      <div className="flex gap-5 h-full" style={{ minHeight: "calc(100vh - 220px)" }}>

        {/* ── Left panel: vehicle selector ── */}
        <div
          className="w-72 flex-shrink-0 bg-white rounded-2xl border border-border p-5 flex flex-col gap-4"
          style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)", alignSelf: "start" }}
        >
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-0.5">Selecionar Veículo</h3>
            <p className="text-xs text-muted-foreground">Defina marca, modelo e faixa de anos</p>
          </div>

          {/* Marca */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Marca</label>
            <Select value={marca} onValueChange={v => { setMarca(v); setModelo(""); setAnoInicio(""); setAnoFim(""); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecionar marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modelo</label>
            <Select value={modelo} onValueChange={v => { setModelo(v); setAnoInicio(""); setAnoFim(""); }} disabled={!marca}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={marca ? "Selecionar modelo" : "Selecione a marca"} />
              </SelectTrigger>
              <SelectContent>
                {modelos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Ano De / Até */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ano de</label>
              <Select value={anoInicio} onValueChange={setAnoInicio} disabled={!modelo}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="De" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ano até</label>
              <Select value={anoFim} onValueChange={setAnoFim} disabled={!anoInicio}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Até" />
                </SelectTrigger>
                <SelectContent>
                  {anos.filter(a => a >= anoInicio).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Motorização */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Motorização <span className="normal-case font-normal">(opcional)</span>
            </label>
            <Select value={motor} onValueChange={setMotor} disabled={!modelo}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Todos os motores" />
              </SelectTrigger>
              <SelectContent>
                {ENGINE_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Add button */}
          <button
            onClick={handleAddVehicle}
            disabled={!canAdd}
            className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{
              background: canAdd
                ? "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 32%))"
                : undefined,
              backgroundColor: !canAdd ? "hsl(var(--muted))" : undefined,
            }}
          >
            <Car className="h-4 w-4" />
            Adicionar veículo
          </button>

          {/* Vehicle list */}
          {vehicles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Selecionados ({vehicles.length})
                </p>
                <button
                  onClick={() => setVehicles([])}
                  className="text-[10px] text-muted-foreground hover:text-red-600 transition-colors"
                >
                  Limpar tudo
                </button>
              </div>
              {vehicles.map(v => (
                <VehicleTag key={v.id} vehicle={v} onRemove={() => removeVehicle(v.id)} />
              ))}
            </div>
          )}

          {vehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Car className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum veículo adicionado</p>
            </div>
          )}
        </div>

        {/* ── Main: listing selector ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Tabs + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
              {([
                { key: "needs", label: `Sem compatibilidade (${counts.needs})` },
                { key: "all",   label: `Todos (${counts.all})` },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPage(1); setSelectedIds(new Set()); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === t.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar por título ou MLB..."
                className="h-9 pl-9 pr-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div
            className="bg-white rounded-2xl border border-border overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgb(0 0 0 / .05)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border" style={{ background: "hsl(var(--muted))" }}>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      className="rounded accent-teal-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">MLB</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conta</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Compat.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhum anúncio encontrado
                    </td>
                  </tr>
                ) : paginated.map(item => {
                  const checked = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`cursor-pointer transition-colors ${checked ? "bg-teal-50/60" : "hover:bg-muted/40"}`}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.id)}
                          className="rounded accent-teal-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs leading-snug line-clamp-2">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.sku}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground">{item.accountName}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {item.compatCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
                            <Car className="h-3 w-3" />
                            {item.compatCount}
                          </span>
                        ) : (
                          <span className="inline-flex text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            Sem compat.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} anúncios · página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div
        className="fixed bottom-0 right-0 z-30 flex items-center justify-between gap-6 px-8 py-4"
        style={{
          left: 224,
          background: "white",
          borderTop: "1px solid hsl(var(--border))",
          boxShadow: "0 -4px 16px rgb(0 0 0 / .06)",
        }}
      >
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="font-bold text-foreground">{vehicles.length}</span>
            <span className="text-muted-foreground ml-1">veículo(s)</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-sm">
            <span className="font-bold text-foreground">{selectedIds.size}</span>
            <span className="text-muted-foreground ml-1">anúncio(s) selecionado(s)</span>
          </div>
          {totalLinks > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="text-sm">
                <span className="font-bold text-primary">{totalLinks}</span>
                <span className="text-muted-foreground ml-1">vínculos a criar</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="h-9 px-4 text-sm font-semibold text-muted-foreground bg-muted rounded-xl border border-border hover:bg-muted/80 transition-colors"
            >
              Limpar seleção
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={!totalLinks || applying}
            className="h-9 px-6 flex items-center gap-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: totalLinks
                ? "linear-gradient(135deg, hsl(174 55% 26%), hsl(174 65% 32%))"
                : undefined,
              backgroundColor: !totalLinks ? "hsl(var(--muted))" : undefined,
            }}
          >
            <CheckSquare className="h-4 w-4" />
            {applying ? "Aplicando..." : "Aplicar vínculos"}
          </button>
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-20" />
    </Layout>
  );
}
