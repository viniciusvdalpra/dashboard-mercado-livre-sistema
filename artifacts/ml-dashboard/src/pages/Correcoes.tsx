import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CORRECTIONS } from "@/mock/data";
import { CheckCircle, XCircle, Edit3, Wrench } from "lucide-react";

type CorrectionStatus = "pending" | "approved" | "rejected" | "executed";
type TabKey = "pending" | "executed" | "rejected";

const TYPE_LABELS: Record<string, string> = {
  specs_fill: "Ficha técnica",
  specs_hidden: "Atrib. oculto",
  ean_fill: "EAN/GTIN",
  compat_fill: "Compatibilidade",
  title_optimize: "Título",
  price_adjust: "Preço",
};

const ROUTE_STYLES: Record<string, string> = {
  anymarket: "bg-blue-50 text-blue-700 border-blue-200",
  ml_direct: "bg-purple-50 text-purple-700 border-purple-200",
};
const ROUTE_LABELS: Record<string, string> = {
  anymarket: "ANY",
  ml_direct: "ML Direto",
};

export default function Correcoes() {
  const { selectedAccountId } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [filterType, setFilterType] = useState("all");
  const [localCorrections, setLocalCorrections] = useState(CORRECTIONS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const baseItems = useMemo(() => {
    let list = selectedAccountId
      ? localCorrections.filter(c => c.accountId === selectedAccountId)
      : localCorrections;

    if (filterType !== "all") list = list.filter(c => c.type === filterType);

    if (activeTab === "pending") return list.filter(c => c.status === "pending");
    if (activeTab === "executed") return list.filter(c => c.status === "executed" || c.status === "approved");
    if (activeTab === "rejected") return list.filter(c => c.status === "rejected");
    return list;
  }, [selectedAccountId, activeTab, filterType, localCorrections]);

  const tabCounts = useMemo(() => {
    const all = selectedAccountId
      ? localCorrections.filter(c => c.accountId === selectedAccountId)
      : localCorrections;
    return {
      pending: all.filter(c => c.status === "pending").length,
      executed: all.filter(c => c.status === "executed" || c.status === "approved").length,
      rejected: all.filter(c => c.status === "rejected").length,
    };
  }, [selectedAccountId, localCorrections]);

  const updateStatus = (id: number, status: CorrectionStatus) => {
    setLocalCorrections(prev =>
      prev.map(c => c.id === id ? { ...c, status } : c)
    );
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const batchApprove = () => {
    setLocalCorrections(prev =>
      prev.map(c => selectedIds.includes(c.id) ? { ...c, status: "approved" as CorrectionStatus } : c)
    );
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === baseItems.length ? [] : baseItems.map(i => i.id));

  const TABS: { key: TabKey; label: string }[] = [
    { key: "pending", label: `Pendentes (${tabCounts.pending})` },
    { key: "executed", label: `Executadas (${tabCounts.executed})` },
    { key: "rejected", label: `Rejeitadas (${tabCounts.rejected})` },
  ];

  return (
    <Layout>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-1">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue placeholder="Tipo de correção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && activeTab === "pending" && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <span className="font-medium">{selectedIds.length} selecionada(s)</span>
          <Button size="sm" onClick={batchApprove} className="gap-1.5" data-testid="btn-batch-approve">
            <CheckCircle className="h-3.5 w-3.5" /> Aprovar selecionadas
          </Button>
          <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedIds([])}>
            Limpar
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
                  {activeTab === "pending" && (
                    <th className="w-10 px-4 py-3">
                      <Checkbox
                        checked={selectedIds.length === baseItems.length && baseItems.length > 0}
                        onCheckedChange={toggleAll}
                        data-testid="checkbox-all"
                      />
                    </th>
                  )}
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Item</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground w-32">Tipo</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground w-28">Campo</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Valor anterior</th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Novo valor</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-24">Rota</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-20">Ganho</th>
                  {activeTab === "pending" && (
                    <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-36">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {baseItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-muted-foreground">
                      Nenhuma correção encontrada.
                    </td>
                  </tr>
                )}
                {baseItems.map(c => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`correction-${c.id}`}>
                    {activeTab === "pending" && (
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground text-xs truncate max-w-[220px]">{c.itemTitle}</div>
                      <div className="text-[10px] text-muted-foreground">{c.itemId} · {c.accountName.split(" ")[1]}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-muted-foreground">{c.typeLabel}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{c.fieldName}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-muted-foreground line-through">
                        {c.oldValue || "(vazio)"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-foreground">{c.newValue}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${ROUTE_STYLES[c.route]}`}>
                        {ROUTE_LABELS[c.route]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-bold text-green-600">+{c.estimatedScoreGain}</span>
                    </td>
                    {activeTab === "pending" && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateStatus(c.id, "approved")}
                            className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors"
                            title="Aprovar"
                            data-testid={`approve-${c.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Editar"
                            data-testid={`edit-${c.id}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(c.id, "rejected")}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                            title="Rejeitar"
                            data-testid={`reject-${c.id}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            {baseItems.length} correção(ões) exibida(s)
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
