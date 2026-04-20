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
    level: a.reputation_level ?? "5_green",
    powerSeller: a.power_seller_status ?? "gold",
    claimsRate: a.claims_rate ?? 0,
    cancellationsRate: a.cancellations_rate ?? 0,
    delayedRate: a.delayed_rate ?? 0,
    salesYesterday: Math.round((a.orders_d30 ?? 0) / 30),
    salesTarget: Math.round((a.orders_d30 ?? 0) / 30 * 1.1),
    revenue30d: a.revenue_d30 ?? 0,
    orders30d: a.orders_d30 ?? 0,
    pendingDispatch: 0,
    unhealthy: a.unhealthy ?? 0,
    warning: a.warning ?? 0,
  }));
}

export function transformKpis(apiKpis: any) {
  return {
    totalOrders30d: apiKpis.orders_d30 ?? 0,
    totalRevenue30d: apiKpis.revenue_d30 ?? 0,
    avgScore: Math.round(apiKpis.avg_score ?? 0),
    itemsWithProblem: (apiKpis.unhealthy ?? 0) + (apiKpis.warning ?? 0),
    compatPending: 0,
    specsFillRate: Math.round(apiKpis.specs_avg ?? 0),
    freightOverSales: 0,
    stockRisk: 0,
  };
}

export function transformProblems(apiProblems: any[]) {
  // Group by type and count
  const counts: Record<string, { count: number; severity: string; label: string }> = {};
  const typeLabels: Record<string, string> = {
    negative_tags: "Tags negativas",
    low_score: "Score baixo",
    missing_specs: "Ficha incompleta",
    no_ean: "Sem EAN",
    unhealthy: "Anúncios unhealthy",
    stock_risk: "Risco de ruptura",
    compat: "Compatibilidades pendentes",
  };
  apiProblems.forEach(p => {
    const t = p.type ?? "other";
    if (!counts[t]) counts[t] = { count: 0, severity: p.severity ?? "yellow", label: typeLabels[t] ?? t };
    counts[t].count++;
  });
  return Object.entries(counts)
    .map(([type, v]) => ({ type, label: v.label, count: v.count, severity: v.severity === "critical" ? "red" : v.severity === "warning" ? "yellow" : "green" }))
    .sort((a, b) => b.count - a.count);
}

export function transformSalesChart(apiData: any[]) {
  return apiData.map(d => {
    const dateStr = d.date; // "2025-12-08" format
    const parts = dateStr.split("-");
    const formatted = `${parts[2]}/${parts[1]}`; // "08/12"
    const revenue = d.revenue ?? 0;
    const qty = d.orders ?? 0;
    return {
      date: formatted,
      qty_1: 0, qty_2: 0, qty_3: 0, qty_4: 0,
      qty,
      revenue_1: 0, revenue_2: 0, revenue_3: 0, revenue_4: 0,
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
