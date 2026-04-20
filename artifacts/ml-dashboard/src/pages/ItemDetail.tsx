import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ITEM_DETAIL, ITEMS } from "@/mock/data";
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

const TAG_STYLES: Record<string, string> = {
  positive: "bg-green-50 text-green-700 border border-green-200",
  negative: "bg-red-50 text-red-700 border border-red-200",
  neutral: "bg-muted text-muted-foreground border border-border",
};

export default function ItemDetail() {
  const params = useParams<{ itemId: string }>();
  const [, setLocation] = useLocation();

  const item = ITEM_DETAIL;
  const allItems = ITEMS;
  const currentIndex = allItems.findIndex(i => i.id === params.itemId);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const [specs, setSpecs] = useState(
    item.specs.map(s => ({ ...s, editValue: s.value }))
  );
  const [savedSpecs, setSavedSpecs] = useState(false);

  const handleSaveSpecs = () => {
    setSavedSpecs(true);
    setTimeout(() => setSavedSpecs(false), 2000);
  };

  const sales = item.sales;
  const salesPeriods = [
    { period: "30d", qty: sales.d30, rev: sales.rev30 },
    { period: "60d", qty: sales.d60, rev: sales.rev60 },
    { period: "90d", qty: sales.d90, rev: sales.rev90 },
    { period: "120d", qty: sales.d120, rev: sales.rev120 },
  ];

  const priceGap = item.priceCompetition.gap;
  const gapColor = priceGap > 15 ? "text-red-600" : priceGap > 5 ? "text-amber-600" : "text-green-600";

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
          {prevItem && (
            <button
              onClick={() => setLocation(`/saude/${prevItem.id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors"
              data-testid="btn-prev"
            >
              <ArrowLeft className="h-3 w-3" /> Anterior
            </button>
          )}
          {nextItem && (
            <button
              onClick={() => setLocation(`/saude/${nextItem.id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors"
              data-testid="btn-next"
            >
              Próximo <ArrowRight className="h-3 w-3" />
            </button>
          )}
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-md px-3 py-1.5 hover:bg-primary/5 transition-colors"
            data-testid="link-ml"
          >
            Abrir no ML <ExternalLink className="h-3 w-3" />
          </a>
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
                <span>{item.id}</span>
                <span>·</span>
                <span>{item.sku}</span>
                <span>·</span>
                <span>{item.accountName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={item.status} />
              <span className={`text-sm font-bold ${item.curve === "A" ? "curve-a" : item.curve === "B" ? "curve-b" : "curve-c"}`}>
                Curva {item.curve}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="font-bold text-xl text-foreground">
              {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span className="text-muted-foreground">{item.stock} em estoque</span>
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Score ML" value={`${item.score}/100`} icon={<Zap className="h-4 w-4" />} />
        <KpiCard label="Ficha técnica" value={`${item.specsPercent}%`} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Conversão" value={`${(item.conversionRate * 100).toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard
          label="Avaliação"
          value={`${item.avgRating.toFixed(1)} ★`}
          subtext={`${item.totalReviews} avaliações`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Card 1: Ficha técnica */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> Ficha Técnica
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
              {specs.map((spec, i) => (
                <div key={spec.id} className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 w-20 text-center ${SPEC_TYPE_STYLES[spec.type]}`}>
                    {SPEC_TYPE_LABELS[spec.type]}
                  </span>
                  <span className="text-xs text-muted-foreground w-32 flex-shrink-0 truncate">{spec.name}</span>
                  {spec.filled ? (
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
                      data-testid={`spec-input-${spec.id}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Compatibilidades */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Compatibilidades
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" data-testid="btn-accept-compat">
              Aceitar sugestões ML
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Car className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-800">Compatibilidades pendentes</div>
                <div className="text-xs text-amber-600">
                  {item.compatTotal} cadastradas · {item.compatSuggestions} sugestões do ML disponíveis
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2 font-medium">Sugestões de compatibilidade:</div>
            <div className="flex flex-wrap gap-2">
              {["VW Gol 2018-2024", "VW Voyage 2018-2022", "VW Saveiro 2020-2024", "Honda Civic 2017-2021", "Toyota Corolla 2015-2019", "Hyundai HB20 2019-2023"].map(v => (
                <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors">
                  + {v}
                </Badge>
              ))}
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
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={item.dailySales.slice(-60)} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9CA3AF" }} stroke="transparent" interval={14} />
                <YAxis tick={{ fontSize: 9, fill: "#9CA3AF" }} stroke="transparent" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Line type="monotone" dataKey="qty" stroke="#C6A339" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card 4: Ações pendentes */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" /> Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {item.pendingActions.map((action, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
                <div>
                  <div className="text-sm font-medium text-foreground">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Prioridade: {action.priority}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded">
                    +{action.scoreGain} pts
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 5: Tags */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> Tags do Anúncio
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span
                  key={tag.tag}
                  className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium ${TAG_STYLES[tag.type]}`}
                  data-testid={`tag-${tag.tag}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Preço e competitividade */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Preço e Competitividade
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Seu preço</div>
                <div className="text-xl font-bold text-foreground">
                  {item.priceCompetition.current.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Sugerido pelo ML</div>
                <div className="text-xl font-bold text-foreground">
                  {item.priceCompetition.suggested.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-700">
                Seu preço está <span className={`font-bold ${gapColor}`}>{priceGap.toFixed(1)}% acima</span> do sugerido pelo ML.
                {priceGap > 15 && " Risco de penalização de visibilidade."}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ⚠️ Sugestões do ML podem comparar produtos diferentes. Sempre valide antes de ajustar.
            </p>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
