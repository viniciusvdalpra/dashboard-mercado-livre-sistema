export const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
  orange: "#ea580c",
  yellow: "#ca8a04",
  gray: "#4b5563",
  amber: "#d97706",
};

export const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.red,
  CHART_COLORS.pink,
];

export const DATA_SOURCES: string[] = ["App DB"];

export const CATEGORIES = [
  "Pagamentos",
  "Catálogo",
  "Logística",
  "Performance",
  "Pós-venda",
  "Reputação",
  "App Mobile",
  "Autenticação",
  "Reportes",
];

export const PRIORITIES = [
  { value: "critical", label: "Crítico", color: "red" },
  { value: "high", label: "Alta", color: "orange" },
  { value: "medium", label: "Média", color: "yellow" },
  { value: "low", label: "Baixa", color: "gray" },
];

export const STATUSES = [
  { value: "open", label: "Aberto", color: "blue" },
  { value: "in_progress", label: "Em Andamento", color: "amber" },
  { value: "resolved", label: "Resolvido", color: "green" },
];

export function getPriorityLabel(val: string) {
  return PRIORITIES.find((p) => p.value === val)?.label || val;
}

export function getStatusLabel(val: string) {
  return STATUSES.find((s) => s.value === val)?.label || val;
}
