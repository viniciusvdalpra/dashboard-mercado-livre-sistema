export const VEHICLE_CATALOG: Record<string, Record<string, string[]>> = {
  "Chevrolet": {
    "Onix":    ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Cruze":   ["2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022"],
    "S10":     ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Tracker": ["2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Spin":    ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022"],
    "Montana": ["2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2022","2023"],
  },
  "Volkswagen": {
    "Gol":     ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Polo":    ["2017","2018","2019","2020","2021","2022","2023"],
    "T-Cross": ["2019","2020","2021","2022","2023"],
    "Virtus":  ["2018","2019","2020","2021","2022","2023"],
    "Tiguan":  ["2017","2018","2019","2020","2021","2022","2023"],
    "Voyage":  ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022"],
    "Saveiro": ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
  },
  "Toyota": {
    "Corolla": ["2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Hilux":   ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Yaris":   ["2018","2019","2020","2021","2022","2023"],
    "RAV4":    ["2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "SW4":     ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
  },
  "Honda": {
    "Civic":   ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "HR-V":    ["2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "City":    ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Fit":     ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021"],
    "WR-V":    ["2017","2018","2019","2020","2021","2022","2023"],
  },
  "Hyundai": {
    "HB20":   ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Creta":  ["2016","2017","2018","2019","2020","2021","2022","2023"],
    "Tucson": ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "i30":    ["2012","2013","2014","2015","2016","2017"],
    "Elantra":["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021"],
  },
  "Renault": {
    "Sandero": ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Duster":  ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Kwid":    ["2017","2018","2019","2020","2021","2022","2023"],
    "Logan":   ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021"],
    "Captur":  ["2017","2018","2019","2020","2021","2022","2023"],
  },
  "Fiat": {
    "Uno":     ["2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021"],
    "Argo":    ["2017","2018","2019","2020","2021","2022","2023"],
    "Cronos":  ["2018","2019","2020","2021","2022","2023"],
    "Strada":  ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Toro":    ["2016","2017","2018","2019","2020","2021","2022","2023"],
    "Pulse":   ["2021","2022","2023"],
  },
  "Ford": {
    "Ka":      ["2014","2015","2016","2017","2018","2019","2020","2021"],
    "EcoSport":["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022"],
    "Ranger":  ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Territory":["2020","2021","2022","2023"],
  },
  "Jeep": {
    "Renegade": ["2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Compass":  ["2017","2018","2019","2020","2021","2022","2023"],
    "Commander":["2022","2023"],
  },
  "Nissan": {
    "Versa":   ["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "Kicks":   ["2017","2018","2019","2020","2021","2022","2023"],
    "Frontier":["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
  },
};

export const ENGINE_OPTIONS = [
  "Todos os motores", "1.0", "1.0 Turbo", "1.0 TSI", "1.2", "1.4", "1.4 Turbo",
  "1.6", "1.8", "1.8 Flex", "2.0", "2.0 Turbo", "2.4", "2.5", "3.0", "Diesel",
];

export const COMPAT_ITEMS = ITEMS.map((item, i) => ({
  ...item,
  compatCount: item.compatStatus === "complete" ? Math.round(3 + Math.random() * 12) : 0,
  needsCompat: item.compatStatus !== "complete",
}));

// ── Lucratividade por Venda ───────────────────────────────────────────────────

function sf(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (x - Math.floor(x)) * (max - min);
}

const PROFIT_PRODUCTS = [
  { title: "Amortecedor Monroe Dianteiro",  sku: "AMO-MON-D", unitPrice: 289.90, unitCost: 128.00, mlCommRate: 0.12, weight: 2.4 },
  { title: "Filtro de Óleo Mann W712",       sku: "FIL-MAN-W", unitPrice: 44.90,  unitCost: 17.50,  mlCommRate: 0.12, weight: 0.3 },
  { title: "Correia Dentada Gates K016",     sku: "COR-GAT-K", unitPrice: 118.50, unitCost: 51.00,  mlCommRate: 0.12, weight: 0.5 },
  { title: "Vela Iridium NGK LKR7AIX",      sku: "VEL-NGK-L", unitPrice: 52.90,  unitCost: 22.00,  mlCommRate: 0.14, weight: 0.1 },
  { title: "Pastilha de Freio Bosch BB0990", sku: "PAS-BOS-B", unitPrice: 94.90,  unitCost: 38.00,  mlCommRate: 0.12, weight: 0.8 },
  { title: "Kit Embreagem Dayco KDC1422",    sku: "KIT-DAY-K", unitPrice: 418.00, unitCost: 195.00, mlCommRate: 0.12, weight: 4.2 },
  { title: "Tensor Correia Bosch 1987946318",sku: "TEN-BOS-1", unitPrice: 79.90,  unitCost: 33.00,  mlCommRate: 0.12, weight: 0.4 },
  { title: "Bomba D'água Gates WP0101",      sku: "BOM-GAT-W", unitPrice: 142.90, unitCost: 64.00,  mlCommRate: 0.12, weight: 1.1 },
];

// ICMS: origem SC — alíquota interna SC (PF dentro do estado) ou
// alíquota interestadual 2,6% + DIFAL do estado destino (PF fora de SC)
const DIFAL_RATES: Record<string, number> = {
  AC: 0.12,  AL: 0.135, AM: 0.13,  AP: 0.11,  BA: 0.135,
  CE: 0.13,  DF: 0.13,  ES: 0.10,  GO: 0.12,  MA: 0.16,
  MT: 0.10,  MS: 0.10,  MG: 0.06,  PA: 0.12,  PB: 0.13,
  PE: 0.135, PI: 0.155, PR: 0.075, RJ: 0.08,  RN: 0.13,
  RO: 0.125, RR: 0.13,  RS: 0.05,  SC: 0.00,  SE: 0.12,
  SP: 0.06,  TO: 0.13,
};

const BR_STATES = Object.keys(DIFAL_RATES);
const ICMS_INTERSTATE = 0.026; // alíquota interestadual SC → outros estados (PF)
const ICMS_INTRA_SC   = 0.07;  // alíquota interna SC (PF dentro de SC)

function icmsRate(state: string) {
  if (state === "SC") return ICMS_INTRA_SC;
  return ICMS_INTERSTATE + (DIFAL_RATES[state] ?? 0);
}

export interface SaleProfitability {
  id: string;
  date: string;
  title: string;
  sku: string;
  accountId: number;
  accountName: string;
  qty: number;
  unitPrice: number;
  revenue: number;
  mlCommissionRate: number;
  mlCommission: number;
  shippingCost: number;
  adsCost: number;
  buyerState: string;
  icmsInterstateRate: number;
  icmsDifal: number;
  taxRate: number;
  taxAmount: number;
  unitCost: number;
  cmv: number;
  packagingCost: number;
  totalDeductions: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
}

export const SALES_PROFITABILITY: SaleProfitability[] = Array.from({ length: 80 }, (_, i) => {
  const prod = PROFIT_PRODUCTS[i % PROFIT_PRODUCTS.length];
  const accountId = (i % 4) + 1;
  const accountName = ACCOUNTS[accountId - 1].name;
  const daysAgo = Math.floor(sf(i * 3, 0, 30));
  const d = new Date(2026, 3, 8);
  d.setDate(d.getDate() - daysAgo);
  const date = d.toLocaleDateString("pt-BR");
  const qty = i % 7 === 0 ? 2 : 1;

  const priceVariance = 1 + sf(i * 7, -0.05, 0.08);
  const unitPrice = Math.round(prod.unitPrice * priceVariance * 100) / 100;
  const revenue = Math.round(unitPrice * qty * 100) / 100;

  const buyerState = BR_STATES[Math.floor(sf(i * 19, 0, BR_STATES.length))];
  const rate = icmsRate(buyerState);
  const icmsInterstateRate = buyerState === "SC" ? ICMS_INTRA_SC : ICMS_INTERSTATE;
  const icmsDifal = buyerState === "SC" ? 0 : DIFAL_RATES[buyerState] ?? 0;
  const taxRate = rate;
  const taxAmount = Math.round(revenue * rate * 100) / 100;

  const mlCommission = Math.round(revenue * prod.mlCommRate * 100) / 100;
  const shippingCost = Math.round(sf(i * 11, 8, prod.weight * 8 + 6) * 100) / 100;
  const adsCost = i % 5 === 0 ? 0 : Math.round(revenue * sf(i * 13, 0.03, 0.07) * 100) / 100;
  const packagingCost = Math.round(sf(i * 17, 3, 7) * 100) / 100;

  const unitCost = Math.round(prod.unitCost * (1 + sf(i * 5, -0.03, 0.06)) * 100) / 100;
  const cmv = Math.round(unitCost * qty * 100) / 100;

  const totalDeductions = Math.round((mlCommission + shippingCost + adsCost + taxAmount + packagingCost) * 100) / 100;
  const totalCosts = Math.round((totalDeductions + cmv) * 100) / 100;
  const grossProfit = Math.round((revenue - cmv) * 100) / 100;
  const grossMargin = Math.round((grossProfit / revenue) * 10000) / 100;
  const netProfit = Math.round((revenue - totalCosts) * 100) / 100;
  const netMargin = Math.round((netProfit / revenue) * 10000) / 100;

  return {
    id: `ML${2025000100 + i}`,
    date,
    title: prod.title,
    sku: prod.sku,
    accountId,
    accountName,
    qty,
    unitPrice,
    revenue,
    mlCommissionRate: prod.mlCommRate,
    mlCommission,
    shippingCost,
    adsCost,
    buyerState,
    icmsInterstateRate,
    icmsDifal,
    taxRate,
    taxAmount,
    unitCost,
    cmv,
    packagingCost,
    totalDeductions,
    totalCosts,
    grossProfit,
    grossMargin,
    netProfit,
    netMargin,
  };
});
