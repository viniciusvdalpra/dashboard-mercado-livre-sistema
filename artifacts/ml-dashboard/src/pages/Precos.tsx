import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRICE_ITEMS, PRICE_SUMMARY, CORRECTIONS } from "@/mock/data";
import { DollarSign, AlertTriangle, TrendingDown, Info, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PriceFilter = "all" | "above" | "not_market";

const QUICK_FILTERS: { key: PriceFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "above", label: "Acima do sugerido" },
  { key: "not_market", label: "Com not_market_price" },
];

function gapBadge(gap: number) {
  if (gap > 15) return "text-red-600 bg-red-50 border-red-200";
  if (gap > 5) return "text-amber-600 bg-amber-50 border-amber-200";
  if (gap < 0) return "text-green-600 bg-green-50 border-green-200";
  return "text-muted-foreground bg-muted border-border";
}

export default function Precos() {
  const { selectedAccountId } = useGlobalContext();
  const [activeFilter, setActiveFilter] = useState<PriceFilter>("all");
  const [sentToQueue, setSentToQueue] = useState<string[]>([]);
  const { toast } = useToast();

  const items = useMemo(() => {
    let list = selectedAccountId
      ? PRICE_ITEMS.filter(i => i.accountId === selectedAccountId)
      : PRICE_ITEMS;

    if (activeFilter === "above") list = list.filter(i => i.gap > 5);
    if (activeFilter === "not_market") list = list.filter(i => i.hasNotMarketPrice);

    return list.sort((a, b) => b.gap - a.gap);
  }, [selectedAccountId, activeFilter]);

  const handleSendToQueue = (itemId: string) => {
    setSentToQueue(prev => [...prev, itemId]);
    toast({
      title: "Enviado para fila de correções",
      description: "O ajuste de preço foi adicionado à fila de aprovação.",
    });
  };

  return (
    <Layout>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard
          label="Itens com sugestão ML"
          value={PRICE_SUMMARY.itemsWithSuggestion}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Acima do sugerido"
          value={PRICE_SUMMARY.aboveSuggestion}
          subtext={`Gap médio: ${PRICE_SUMMARY.avgGap}%`}
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          label="Com not_market_price"
          value={PRICE_SUMMARY.notMarketPrice}
          subtext="Perdendo visibilidade agora"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5">
        <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Atenção:</strong> As sugestões de preço do ML podem comparar produtos incorretos ou categorias diferentes.
          Sempre valide o produto comparado antes de ajustar o preço. O ajuste é enviado para a fila de aprovação — nunca automático.
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 mb-4">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Anúncio</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-20">Curva</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Seu preço</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground w-28">Sugerido ML</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-24">Gap %</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-32">not_market_price</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground w-36">Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">
                      Nenhum item encontrado.
                    </td>
                  </tr>
                )}
                {items.map(item => {
                  const alreadySent = sentToQueue.includes(item.id);
                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground truncate max-w-[280px]">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.id} · {item.accountName.split(" ")[1]}</div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>
                          {item.curve}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {item.suggestedPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${gapBadge(item.gap)}`}>
                          {item.gap > 0 ? "+" : ""}{item.gap.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {item.hasNotMarketPrice ? (
                          <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                            Penalizado
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {alreadySent ? (
                          <span className="text-xs text-green-600 font-medium">Na fila</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleSendToQueue(item.id)}
                            data-testid={`send-queue-${item.id}`}
                          >
                            <ArrowUpRight className="h-3 w-3" /> Enviar pra fila
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            {items.length} item(ns) exibido(s)
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
