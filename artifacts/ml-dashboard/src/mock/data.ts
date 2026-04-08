export const ACCOUNTS = [
  {
    id: 1,
    name: "Conta Toyo (01)",
    slug: "toyo",
    level: "5_green",
    powerSeller: "platinum",
    claimsRate: 0.008,
    cancellationsRate: 0.011,
    delayedRate: 0.032,
    salesYesterday: 48,
    salesTarget: 50,
    revenue30d: 142680,
    orders30d: 412,
    pendingDispatch: 2,
    unhealthy: 3,
    warning: 8,
  },
  {
    id: 2,
    name: "Conta SAC (02)",
    slug: "sac",
    level: "4_light_green",
    powerSeller: "gold",
    claimsRate: 0.019,
    cancellationsRate: 0.014,
    delayedRate: 0.061,
    salesYesterday: 31,
    salesTarget: 35,
    revenue30d: 89240,
    orders30d: 287,
    pendingDispatch: 5,
    unhealthy: 7,
    warning: 14,
  },
  {
    id: 3,
    name: "Conta Oficial (03)",
    slug: "oficial",
    level: "5_green",
    powerSeller: "platinum",
    claimsRate: 0.006,
    cancellationsRate: 0.009,
    delayedRate: 0.028,
    salesYesterday: 67,
    salesTarget: 60,
    revenue30d: 198450,
    orders30d: 621,
    pendingDispatch: 1,
    unhealthy: 1,
    warning: 4,
  },
  {
    id: 4,
    name: "Conta Denzel (04)",
    slug: "denzel",
    level: "3_yellow",
    powerSeller: "silver",
    claimsRate: 0.028,
    cancellationsRate: 0.022,
    delayedRate: 0.089,
    salesYesterday: 19,
    salesTarget: 30,
    revenue30d: 54120,
    orders30d: 198,
    pendingDispatch: 8,
    unhealthy: 15,
    warning: 22,
  },
];

export const DASHBOARD_KPIS = {
  totalOrders30d: 1518,
  totalRevenue30d: 484490,
  avgScore: 72,
  itemsWithProblem: 74,
  compatPending: 128,
  specsFillRate: 67,
  freightOverSales: 12.4,
  stockRisk: 38,
};

export const PROBLEMS = [
  { type: "compat", label: "Compatibilidades pendentes", count: 128, severity: "red" },
  { type: "dispatch", label: "Despacho atrasado", count: 8, severity: "red" },
  { type: "unhealthy", label: "Anúncios unhealthy", count: 26, severity: "red" },
  { type: "claims", label: "Reclamações abertas", count: 11, severity: "yellow" },
  { type: "warning", label: "Anúncios em warning", count: 48, severity: "yellow" },
  { type: "stock", label: "Risco de ruptura", count: 38, severity: "yellow" },
  { type: "returns", label: "Devoluções recorrentes", count: 7, severity: "yellow" },
  { type: "infractions", label: "Infrações ativas", count: 2, severity: "red" },
];

export const DAILY_SALES = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const base = 45 + Math.sin(i * 0.5) * 15;
  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    qty: Math.round(base + Math.random() * 20),
    revenue: Math.round((base + Math.random() * 20) * 320),
  };
});

export const ITEMS = Array.from({ length: 80 }, (_, i) => {
  const categories = ["Amortecedor", "Pastilha de Freio", "Filtro de Ar", "Correia Dentada", "Vela de Ignição", "Bomba d'Água"];
  const brands = ["Monroe", "Bosch", "Mann", "Gates", "NGK", "Dayco"];
  const curves = ["A", "A", "A", "B", "B", "C"];
  const statuses = ["healthy", "healthy", "healthy", "warning", "unhealthy"];
  const curve = curves[Math.floor(Math.random() * curves.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const score = status === "unhealthy" ? Math.floor(30 + Math.random() * 30) : status === "warning" ? Math.floor(50 + Math.random() * 20) : Math.floor(70 + Math.random() * 30);
  const cat = categories[i % categories.length];
  const brand = brands[i % brands.length];
  const accountId = (i % 4) + 1;
  return {
    id: `MLB${10000000 + i}`,
    title: `${cat} ${brand} ${["Civic", "Gol", "Corolla", "Onix", "HB20", "Sandero"][i % 6]} ${2018 + (i % 7)}`,
    sku: `SKU-${String(i + 1).padStart(5, "0")}`,
    accountId,
    accountName: ACCOUNTS[accountId - 1].name,
    score,
    specsPercent: Math.floor(50 + Math.random() * 50),
    price: Math.round(80 + Math.random() * 420),
    stock: Math.round(Math.random() * 50),
    sales30d: curve === "A" ? Math.round(20 + Math.random() * 80) : curve === "B" ? Math.round(5 + Math.random() * 20) : Math.round(Math.random() * 5),
    revenue30d: Math.round((20 + Math.random() * 80) * (100 + Math.random() * 300)),
    status,
    curve,
    compatStatus: ["complete", "pending_suggestions", "incomplete", "complete", "complete"][Math.floor(Math.random() * 5)],
    hasEan: Math.random() > 0.3,
    hasNegativeTag: Math.random() > 0.7,
    thumbnail: `https://picsum.photos/seed/${i + 1}/80/80`,
    conversionRate: Math.random() * 0.08,
    avgRating: 3.5 + Math.random() * 1.5,
    totalReviews: Math.round(Math.random() * 200),
  };
});

export const ITEM_DETAIL = {
  id: "MLB10000001",
  title: "Amortecedor Monroe Civic 2020 Dianteiro",
  sku: "SKU-00001",
  accountId: 1,
  accountName: "Conta Toyo (01)",
  score: 58,
  specsPercent: 63,
  price: 289.90,
  stock: 12,
  curve: "A",
  status: "warning",
  permalink: "https://www.mercadolivre.com.br/",
  thumbnail: "https://picsum.photos/seed/detail/200/200",
  sales: { d30: 42, d60: 89, d90: 127, d120: 168, rev30: 12175, rev60: 25780, rev90: 36808, rev120: 48711 },
  conversionRate: 0.034,
  avgRating: 4.2,
  totalReviews: 87,
  compatStatus: "pending_suggestions",
  compatTotal: 24,
  compatSuggestions: 18,
  priceCompetition: { current: 289.90, suggested: 259.90, gap: 11.5, status: "above_suggestion", hasNotMarketPrice: false },
  specs: [
    { id: "BRAND", name: "Marca", value: "Monroe", type: "required", filled: true },
    { id: "MODEL", name: "Modelo", value: "Sensatrac", type: "required", filled: true },
    { id: "PART_NUMBER", name: "Número do Fabricante", value: "G8165", type: "required", filled: true },
    { id: "GTIN", name: "GTIN/EAN", value: "", type: "required", filled: false },
    { id: "POSITION", name: "Posição de Montagem", value: "Dianteiro", type: "required", filled: true },
    { id: "QUANTITY_PER_KIT", name: "Quantidade por Kit", value: "", type: "hidden", filled: false },
    { id: "COMPATIBLE_MAKES", name: "Marcas Compatíveis", value: "", type: "hidden", filled: false },
    { id: "STROKE", name: "Curso (mm)", value: "", type: "common", filled: false },
    { id: "LOAD_CAPACITY", name: "Capacidade de Carga", value: "", type: "common", filled: false },
    { id: "WARRANTY", name: "Garantia do Vendedor", value: "12 meses", type: "common", filled: true },
  ],
  tags: [
    { tag: "good_seller", label: "Bom vendedor", type: "positive" },
    { tag: "cart_eligible", label: "Elegível para carrinho", type: "positive" },
    { tag: "free_shipping", label: "Frete grátis", type: "positive" },
    { tag: "incomplete_compatibilities", label: "Compatibilidades incompletas", type: "negative" },
    { tag: "catalog_forewarning", label: "Aviso de catálogo", type: "negative" },
  ],
  pendingActions: [
    { action: "ADD_GTIN", label: "Adicionar EAN/GTIN", scoreGain: 8, priority: "high" },
    { action: "FILL_COMPAT", label: "Preencher compatibilidades de veículos", scoreGain: 12, priority: "critical" },
    { action: "FILL_HIDDEN_ATTRS", label: "Preencher atributos ocultos (3 campos)", scoreGain: 6, priority: "medium" },
    { action: "ADD_VIDEO", label: "Adicionar vídeo ao anúncio", scoreGain: 5, priority: "low" },
  ],
  dailySales: Array.from({ length: 120 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (119 - i));
    return {
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      qty: Math.max(0, Math.round(1.5 + Math.sin(i * 0.2) * 1.2 + Math.random() * 2)),
    };
  }),
};

export const STOCK_ITEMS = ITEMS.map(item => ({
  ...item,
  salesPerDay: item.sales30d / 30,
  coverageDays: item.stock > 0 && item.sales30d > 0 ? Math.round(item.stock / (item.sales30d / 30)) : 999,
}));

export const ADS_METRICS = ITEMS.slice(0, 40).map((item, i) => ({
  ...item,
  impressions: Math.round(1000 + Math.random() * 9000),
  clicks: Math.round(50 + Math.random() * 450),
  ctr: 0.03 + Math.random() * 0.07,
  cost: Math.round(50 + Math.random() * 500),
  cpc: Math.round((2 + Math.random() * 8) * 100) / 100,
  directUnits: Math.round(1 + Math.random() * 20),
  directAmount: Math.round((100 + Math.random() * 2000)),
  roas: Math.round((1 + Math.random() * 9) * 100) / 100,
  campaignId: `CAMP_${i + 1}`,
}));

export const ADS_SUMMARY = {
  totalCost: 28450,
  totalSales: 142300,
  roas: 5.0,
  avgCtr: 0.048,
  totalClicks: 12840,
  totalImpressions: 267500,
};

export const FREIGHT_ITEMS = ITEMS.slice(0, 60).map((item) => ({
  ...item,
  freightCost: Math.round(10 + Math.random() * 40),
  freightPercent: Math.round(5 + Math.random() * 20),
  shippingMode: ["fulfillment", "xd_drop_off", "cross_docking"][Math.floor(Math.random() * 3)],
  freeShipping: Math.random() > 0.4,
  freightChanged: Math.random() > 0.8,
  freightChangePct: Math.round((Math.random() * 30) - 5),
}));

export const FREIGHT_BY_STATE = [
  { state: "SP", sales: 412, avgFreight: 18.5, freightPct: 9.2 },
  { state: "MG", sales: 234, avgFreight: 22.8, freightPct: 11.4 },
  { state: "RJ", sales: 189, avgFreight: 21.3, freightPct: 10.7 },
  { state: "PR", sales: 156, avgFreight: 24.1, freightPct: 12.1 },
  { state: "RS", sales: 134, avgFreight: 28.6, freightPct: 14.3 },
  { state: "SC", sales: 98, avgFreight: 26.4, freightPct: 13.2 },
  { state: "BA", sales: 87, avgFreight: 31.2, freightPct: 15.6 },
  { state: "GO", sales: 76, avgFreight: 29.8, freightPct: 14.9 },
];

export const CORRECTIONS = Array.from({ length: 45 }, (_, i) => {
  const types = ["specs_fill", "specs_hidden", "ean_fill", "compat_fill", "title_optimize", "price_adjust"];
  const statuses = ["pending", "pending", "pending", "approved", "rejected", "executed"];
  const routes = ["anymarket", "ml_direct"];
  const type = types[i % types.length];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const item = ITEMS[i % ITEMS.length];
  return {
    id: i + 1,
    itemId: item.id,
    itemTitle: item.title,
    accountId: item.accountId,
    accountName: item.accountName,
    type,
    typeLabel: {
      specs_fill: "Ficha técnica",
      specs_hidden: "Atributo oculto",
      ean_fill: "EAN/GTIN",
      compat_fill: "Compatibilidade",
      title_optimize: "Título",
      price_adjust: "Preço",
    }[type],
    route: routes[Math.floor(Math.random() * routes.length)],
    fieldName: ["GTIN", "Marca", "Compatibilidade", "Título", "Preço", "Quantidade por Kit"][i % 6],
    oldValue: ["", "Monroe Old", "0 veículos", "Amortecedor Monroe", "R$ 320,00", ""][i % 6],
    newValue: ["7891234567890", "Monroe", "24 veículos", "Amortecedor Monroe Civic 2020 Dianteiro", "R$ 289,90", "2"][i % 6],
    estimatedScoreGain: Math.round(2 + Math.random() * 12),
    status,
    executionMode: ["auto", "approval", "approval"][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    executedAt: status === "executed" ? new Date().toISOString() : null,
  };
});

export const PRICE_ITEMS = ITEMS.slice(0, 50).map(item => {
  const hasNotMarketPrice = Math.random() > 0.85;
  const gap = Math.round((Math.random() * 30 - 5) * 10) / 10;
  const minPrice = Math.round(item.price * 0.85);
  const maxPrice = Math.round(item.price * 1.20);
  const competitors = Math.floor(Math.random() * 15);
  return {
    ...item,
    suggestedPrice: Math.round(item.price * (1 - gap / 100)),
    gap,
    hasNotMarketPrice,
    minPrice,
    maxPrice,
    competitors,
    suggestionStatus: gap > 15 ? "above_suggestion" : gap < 0 ? "below_suggestion" : "competitive",
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      price: Math.round(item.price * (0.9 + Math.random() * 0.2)),
    })),
  };
});

export const PRICE_SUMMARY = {
  itemsWithSuggestion: 312,
  aboveSuggestion: 87,
  notMarketPrice: 23,
  avgGap: 8.4,
};

export const COMPATIBILITIES = ITEMS.filter(i => i.compatStatus !== "complete").slice(0, 30).map(item => ({
  ...item,
  suggestionsCount: Math.round(5 + Math.random() * 30),
  vehicles: ["VW Gol 2018-2024", "VW Voyage 2018-2024", "VW Saveiro 2018-2024", "Honda Civic 2016-2021", "Toyota Corolla 2015-2019"].slice(0, Math.round(1 + Math.random() * 4)),
}));
