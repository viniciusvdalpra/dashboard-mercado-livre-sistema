import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft, ArrowRight, ExternalLink, Star, TrendingUp,
  ShoppingCart, FileText, Car, Zap, Tag, DollarSign, Save, Wand2,
} from "lucide-react";

const SPEC_TYPE_STYLES: Record<string, string> = {
  required: "bg-red-50 text-red-700 border-red-200",
  hidden: "bg-amber-50 text-amber-700 border-amber-200",
  common: "bg-blue-50 text-blue-700 border-blue-200",
};
const SPEC_TYPE_LABELS: Record<string, string> = {
  required: "Obrigatório",
  hidden: "Oculto",
  common: "Comum",
};

interface ItemDetailData {
  id: number;
  ml_item_id: string;
  title: string;
  permalink: string;
  thumbnail: string;
  account_slug: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  health_status: string;
  health_score: number;
  abc_curve: string;
  specs_score: number;
  specs_total: number;
  specs_filled: number;
  tags_positive: number;
  tags_negative: number;
  has_compatibilities: boolean;
  compatibilities_count: number;
  ean: string | null;
  revenue_d120: number;
  units_d120: number;
}

interface SpecItem {
  attribute_id: string;
  attribute_name: string;
  value: string | null;
  is_required: boolean;
  is_hidden: boolean;
  weight: number;
}

interface SalesEntry {
  date: string;
  quantity: number;
  revenue: number;
}

export default function ItemDetail() {
  const params = useParams<{ itemId: string }>();
  const [, setLocation] = useLocation();
  const [item, setItem] = useState<ItemDetailData | null>(null);
  const [specs, setSpecs] = useState<(SpecItem & { editValue: string })[]>([]);
  const [dailySales, setDailySales] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSpecs, setSavedSpecs] = useState(false);

  useEffect(() => {
    if (!params.itemId) return;
    setLoading(true);

    // Find item by ml_item_id first
    api.get<{ items: any[] }>(`/items?per_page=1&search=${params.itemId}`).then(async data => {
      const found = data.items?.[0];
      if (!found) { setLoading(false); return; }
      const itemId = found.id;

      const [detail, specsData, salesData] = await Promise.all([
        api.get<ItemDetailData>(`/items/${itemId}`),
        api.get<SpecItem[]>(`/items/${itemId}/specs`).catch(() => []),
        api.get<SalesEntry[]>(`/items/${itemId}/daily-sales`).catch(() => []),
      ]);

      setItem(detail);
      setSpecs((specsData as SpecItem[]).map(s => ({
        ...s,
        editValue: s.value || "",
      })));
      setDailySales(salesData as SalesEntry[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.itemId]);

  const handleSaveSpecs = () => {
    setSavedSpecs(true);
    setTimeout(() => setSavedSpecs(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-sm text-muted-foreground">Item não encontrado</p>
          <button onClick={() => setLocation("/saude")} className="text-primary text-sm mt-2">Voltar à lista</button>
        </div>
      </Layout>
    );
  }

  const salesD30 = dailySales.slice(-30).reduce((s, d) => s + d.quantity, 0);
  const salesD60 = dailySales.slice(-60).reduce((s, d) => s + d.quantity, 0);
  const salesD90 = dailySales.slice(-90).reduce((s, d) => s + d.quantity, 0);
  const revD30 = dailySales.slice(-30).reduce((s, d) => s + d.revenue, 0);
  const revD60 = dailySales.slice(-60).reduce((s, d) => s + d.revenue, 0);
  const revD90 = dailySales.slice(-90).reduce((s, d) => s + d.revenue, 0);

  const salesPeriods = [
    { period: "30d", qty: salesD30, rev: revD30 },
    { period: "60d", qty: salesD60, rev: revD60 },
    { period: "90d", qty: salesD90, rev: revD90 },
    { period: "120d", qty: item.units_d120, rev: item.revenue_d120 },
  ];

  return (
    <Layout>
      {/* Navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setLocation("/saude")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="btn-back"
        >
          <ArrowLeft className="h-4 w-4" /> Lista de anúncios
        </button>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2 ml-auto">
          {item.permalink && (
            <a
              href={item.permalink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-md px-3 py-1.5 hover:bg-primary/5 transition-colors"
              data-testid="link-ml"
            >
              Abrir no ML <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Item header */}
      <div className="flex items-start gap-4 mb-6 p-5 bg-card rounded-xl border border-border">
        <img src={item.thumbnail} alt={item.title} className="h-20 w-20 rounded-lg object-cover bg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-bold text-lg text-foreground leading-tight mb-1">{item.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{item.ml_item_id}</span>
                <span>·</span>
                <span>{item.account_slug}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={item.health_status} />
              <span className={`text-sm font-bold ${item.abc_curve === "A" ? "curve-a" : item.abc_curve === "B" ? "curve-b" : "curve-c"}`}>
                Curva {item.abc_curve}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="font-bold text-xl text-foreground">
              {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span className="text-muted-foreground">{item.available_quantity} em estoque</span>
            {item.ean && <span className="text-muted-foreground">EAN: {item.ean}</span>}
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Score ML" value={`${item.health_score}/100`} icon={<Zap className="h-4 w-4" />} />
        <KpiCard label="Ficha técnica" value={`${item.specs_score}%`} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Vendas 120d" value={item.units_d120} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Compatibilidades" value={item.compatibilities_count} icon={<Car className="h-4 w-4" />} />
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Card 1: Ficha técnica */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> Ficha Técnica ({item.specs_filled}/{item.specs_total})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" data-testid="btn-claude">
                <Wand2 className="h-3 w-3" /> Pedir ao Claude
              </Button>
              <Button
                size="sm"
                className="gap-1.5 h-7 text-xs"
                onClick={handleSaveSpecs}
                data-testid="btn-save-specs"
              >
                <Save className="h-3 w-3" />
                {savedSpecs ? "Salvo!" : "Salvar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {specs.map((spec, i) => {
                const type = spec.is_required ? "required" : spec.is_hidden ? "hidden" : "common";
                return (
                  <div key={spec.attribute_id} className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 w-20 text-center ${SPEC_TYPE_STYLES[type]}`}>
                      {SPEC_TYPE_LABELS[type]}
                    </span>
                    <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{spec.attribute_name}</span>
                    {spec.value ? (
                      <span className="text-sm font-medium text-foreground">{spec.value}</span>
                    ) : (
                      <Input
                        className="h-7 text-xs flex-1"
                        placeholder="Preencher..."
                        value={spec.editValue}
                        onChange={e => {
                          const newSpecs = [...specs];
                          newSpecs[i] = { ...newSpecs[i], editValue: e.target.value };
                          setSpecs(newSpecs);
                        }}
                        data-testid={`spec-input-${spec.attribute_id}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Compatibilidades */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Compatibilidades
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Car className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-800">
                  {item.has_compatibilities ? `${item.compatibilities_count} cadastradas` : "Nenhuma compatibilidade"}
                </div>
                <div className="text-xs text-amber-600">
                  {!item.has_compatibilities && "Adicionar compatibilidades pode melhorar o score"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Vendas */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" /> Vendas e Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {salesPeriods.map(p => (
                <div key={p.period} className="text-center p-2 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">{p.period}</div>
                  <div className="font-bold text-base text-foreground">{p.qty}</div>
                  <div className="text-[10px] text-muted-foreground">{p.rev.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
              ))}
            </div>
            {dailySales.length > 0 && (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={dailySales.slice(-60)} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9CA3AF" }} stroke="transparent" interval={14} />
                  <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} stroke="transparent" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Line type="monotone" dataKey="quantity" stroke="#C6A339" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
            {dailySales.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sem dados de vendas diárias</p>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Tags */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> Tags do Anúncio
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg flex-1">
                <div className="font-bold text-lg text-green-700">{item.tags_positive}</div>
                <div className="text-xs text-green-600">Positivas</div>
              </div>
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg flex-1">
                <div className="font-bold text-lg text-red-700">{item.tags_negative}</div>
                <div className="text-xs text-red-600">Negativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
