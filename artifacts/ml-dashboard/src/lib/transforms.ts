/**
 * Transform API responses to match mock data shapes.
 * This allows existing UI components to work unchanged.
 */

// Account slugs to IDs (frontend uses numeric IDs)
const SLUG_TO_ID: Record<string, number> = {
  toyo: 1, sac: 2, oficial: 3, denzel: 4,
};
const SLUG_TO_NAME: Record<string, string> = {
  toyo: "Conta Toyo (01)", sac: "Conta SAC (02)",
  oficial: "Conta Oficial (03)", denzel: "Conta Denzel (04)",
};

export function transformAccounts(apiAccounts: any[]) {
  return apiAccounts.map(a => ({
    id: SLUG_TO_ID[a.slug] ?? 0,
    name: SLUG_TO_NAME[a.slug] ?? a.name,
    slug: a.slug,
    // ML: reputation.level_id → ex: "5_green"
    level: a.reputation_level ?? a.level ?? "5_green",
    // ML: reputation.power_seller_status → ex: "platinum"
    powerSeller: a.power_seller_status ?? a.powerSeller ?? "gold",
    // ML: reputation.metrics.claims.rate
    claimsRate: a.claims_rate ?? a.claimsRate ?? 0,
    // ML: reputation.metrics.cancellations.rate
    cancellationsRate: a.cancellations_rate ?? a.cancellationsRate ?? 0,
    // ML: reputation.metrics.delayed_handling_time.rate
    delayedRate: a.delayed_rate ?? a.delayedRate ?? 0,
    // ML: pedidos ontem — fallback: média do mês
    salesYesterday: a.orders_yesterday ?? a.sales_yesterday ?? Math.round((a.orders_d30 ?? 0) / 30),
    // DB: meta configurável por conta — fallback: +10% da média
    salesTarget: a.sales_target ?? a.salesTarget ?? Math.round((a.orders_d30 ?? 0) / 30 * 1.1),
    revenue30d: a.revenue_d30 ?? a.revenue30d ?? 0,
    orders30d: a.orders_d30 ?? a.orders30d ?? 0,
    // ML: pedidos com order_status=paid e shipping_status=handling
    pendingDispatch: a.pending_dispatch ?? a.pendingDispatch ?? 0,
    // ML: anúncios com health.status=unhealthy
    unhealthy: a.unhealthy ?? 0,
    // ML: anúncios com health.status=warning
    warning: a.warning ?? 0,
  }));
}

export function transformKpis(apiKpis: any) {
  return {
    totalOrders30d: apiKpis.orders_d30 ?? apiKpis.totalOrders30d ?? 0,
    totalRevenue30d: apiKpis.revenue_d30 ?? apiKpis.totalRevenue30d ?? 0,
    // ML: média ponderada do score de saúde
    avgScore: Math.round(apiKpis.avg_score ?? apiKpis.avgScore ?? 0),
    // ML: unhealthy + warning
    itemsWithProblem: apiKpis.items_with_problem ?? apiKpis.itemsWithProblem ?? (apiKpis.unhealthy ?? 0) + (apiKpis.warning ?? 0),
    // ML: anúncios com compatibility_status=pending_suggestions
    compatPending: apiKpis.compat_pending ?? apiKpis.compatPending ?? 0,
    // ML: % de atributos obrigatórios preenchidos
    specsFillRate: Math.round(apiKpis.specs_fill_rate ?? apiKpis.specs_avg ?? apiKpis.specsFillRate ?? 0),
    // CALC: (custo_frete_total / faturamento_total) * 100
    freightOverSales: apiKpis.freight_over_sales ?? apiKpis.freightOverSales ?? 0,
    // CALC: itens com cobertura < 15 dias
    stockRisk: apiKpis.stock_risk ?? apiKpis.stockRisk ?? 0,
  };
}

const PROBLEM_LABELS: Record<string, string> = {
  compat: "Compatibilidades pendentes",
  dispatch: "Despacho atrasado",
  unhealthy: "Anúncios unhealthy",
  claims: "Reclamações abertas",
  warning: "Anúncios em warning",
  stock: "Risco de ruptura",
  returns: "Devoluções recorrentes",
  infractions: "Infrações ativas",
  negative_tags: "Tags negativas",
  low_score: "Score baixo",
  missing_specs: "Ficha incompleta",
  no_ean: "Sem EAN",
  stock_risk: "Risco de ruptura",
};

export function transformProblems(apiProblems: any[]) {
  // API returns pre-aggregated problems with a count field each
  // Shape: [{ type, label, count, severity }]
  return apiProblems
    .map(p => ({
      type: p.type,
      label: p.label ?? PROBLEM_LABELS[p.type] ?? p.type,
      count: p.count ?? 1,
      severity: p.severity === "critical" || p.severity === "red"
        ? "red"
        : p.severity === "warning" || p.severity === "yellow"
        ? "yellow"
        : "yellow",
    }))
    .sort((a, b) => b.count - a.count);
}

export function transformSalesChart(apiData: any[]) {
  return apiData.map(d => {
    // Date can come as "2025-12-08" (ISO) or "08/12" (already formatted)
    let formatted = d.date as string;
    if (formatted && formatted.includes("-")) {
      const parts = formatted.split("-");
      formatted = `${parts[2]}/${parts[1]}`;
    }

    const qty = d.qty ?? d.orders ?? 0;
    const revenue = d.revenue ?? 0;

    // Per-account breakdown via orders_by_account / revenue_by_account (keyed by slug)
    const oba = d.orders_by_account ?? {};
    const rba = d.revenue_by_account ?? {};

    const qty_1 = d.qty_1 ?? oba.toyo    ?? 0;
    const qty_2 = d.qty_2 ?? oba.sac     ?? 0;
    const qty_3 = d.qty_3 ?? oba.oficial  ?? 0;
    const qty_4 = d.qty_4 ?? oba.denzel   ?? 0;

    const revenue_1 = d.revenue_1 ?? rba.toyo    ?? 0;
    const revenue_2 = d.revenue_2 ?? rba.sac     ?? 0;
    const revenue_3 = d.revenue_3 ?? rba.oficial  ?? 0;
    const revenue_4 = d.revenue_4 ?? rba.denzel   ?? 0;

    return {
      date: formatted,
      qty_1, qty_2, qty_3, qty_4,
      qty,
      revenue_1, revenue_2, revenue_3, revenue_4,
      revenue,
    };
  });
}

export function transformItems(apiItems: any[]) {
  return apiItems.map(item => {
    const accountId = SLUG_TO_ID[item.account_slug] ?? 1;
    const status = item.health_status ?? "warning";
    return {
      id: item.ml_item_id,
      title: item.title,
      sku: item.sku ?? item.ml_item_id,
      accountId,
      accountName: SLUG_TO_NAME[item.account_slug] ?? item.account_slug,
      score: Math.round(item.health_score ?? 0),
      specsPercent: Math.round(item.specs_score ?? 0),
      price: item.price ?? 0,
      stock: item.available_quantity ?? 0,
      sales30d: item.sold_quantity_d30 ?? 0,
      revenue30d: item.revenue_d120 ?? 0,
      status,
      curve: item.abc_curve ?? "C",
      compatStatus: item.has_compatibilities ? "complete" : "incomplete",
      hasEan: item.has_ean ?? false,
      hasNegativeTag: (item.tags_negative ?? 0) > 0,
      thumbnail: item.thumbnail ?? "",
      conversionRate: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  });
}

export function transformStockItems(apiItems: any[]) {
  return apiItems.map(item => {
    const accountId = SLUG_TO_ID[item.account_slug] ?? 1;
    const salesPerDay = (item.sold_quantity_d30 ?? 0) / 30;
    return {
      id: item.ml_item_id,
      title: item.title,
      accountId,
      accountName: SLUG_TO_NAME[item.account_slug] ?? item.account_slug,
      curve: item.abc_curve ?? "C",
      stock: item.available_quantity ?? 0,
      salesPerDay,
      coverageDays: item.coverage_days ?? (salesPerDay > 0 ? Math.round((item.available_quantity ?? 0) / salesPerDay) : 999),
      sales30d: item.sold_quantity_d30 ?? 0,
      suggestedBuy: item.suggested_buy ?? 0,
    };
  });
}

export function transformCorrections(apiCorrections: any[]) {
  return apiCorrections.map(c => ({
    id: c.id,
    itemId: c.ml_item_id,
    itemTitle: c.item_title ?? "",
    type: c.correction_type ?? "specs",
    accountId: SLUG_TO_ID[c.account_slug] ?? 1,
    accountName: SLUG_TO_NAME[c.account_slug] ?? c.account_slug,
    oldValue: c.old_value ?? "",
    newValue: c.new_value ?? "",
    status: c.status === "executed" ? "executed" : c.status ?? "pending",
    fieldName: c.field_name ?? "",
  }));
}

export function transformPrices(apiPrices: any[]) {
  return apiPrices.map(p => {
    const price = p.current_price ?? 0;
    const suggested = p.ml_suggested_price ?? price;
    return {
      id: p.ml_item_id,
      title: p.title,
      accountId: SLUG_TO_ID[p.account_slug] ?? 1,
      accountName: SLUG_TO_NAME[p.account_slug] ?? p.account_slug,
      price,
      minPrice: Math.round(suggested * 0.85),
      maxPrice: Math.round(suggested * 1.3),
      suggestedPrice: suggested,
      competitors: 0,
    };
  });
}

export function transformCompatItems(apiItems: any[]) {
  return apiItems.map(item => ({
    id: item.ml_item_id,
    title: item.title,
    sku: item.sku ?? "",
    accountId: SLUG_TO_ID[item.account_slug] ?? 1,
    accountName: SLUG_TO_NAME[item.account_slug] ?? item.account_name ?? item.account_slug,
    compatCount: item.compatibilities_count ?? 0,
    needsCompat: !(item.has_compatibilities),
  }));
}

// Profitability already matches the mock shape exactly from the API
export function transformProfitability(apiItems: any[]) {
  return apiItems.map(item => ({
    ...item,
    accountId: SLUG_TO_ID[item.accountName?.toLowerCase().includes("toyo") ? "toyo"
      : item.accountName?.toLowerCase().includes("sac") ? "sac"
      : item.accountName?.toLowerCase().includes("oficial") ? "oficial"
      : "denzel"] ?? 1,
  }));
}
