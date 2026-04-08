import { useState, useEffect, useRef } from "react";
import { 
  useGetIssueStats, 
  useGetIssuesByCategory, 
  useGetIssuesByPriority, 
  useGetIssuesTrend, 
  useListIssues 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, ChevronDown, Sun, Moon, Printer, Download, Plus
} from "lucide-react";
import { useIsDark } from "@/hooks/use-is-dark";
import { CHART_COLORS, CHART_COLOR_LIST, DATA_SOURCES } from "@/lib/constants";
import { IssueTable } from "@/components/IssueTable";
import { IssueForm } from "@/components/IssueForm";
import { format } from "date-fns";

const INTERVAL_OPTIONS = [
  { label: "A cada 5 min", ms: 5 * 60 * 1000 },
  { label: "A cada 15 min", ms: 15 * 60 * 1000 },
  { label: "A cada 1 hora", ms: 60 * 60 * 1000 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "10px 14px",
        border: "1px solid #e0e0e0",
        color: "#1a1a1a",
        fontSize: "13px",
      }}
    >
      <div style={{ marginBottom: "6px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
        {payload.length === 1 && payload[0].color && payload[0].color !== "#ffffff" && (
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: payload[0].color, flexShrink: 0 }} />
        )}
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
          {payload.length > 1 && entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#444" }}>{entry.name === "value" ? "Quantidade" : entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", fontSize: "13px" }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span>{entry.value === "value" ? "Quantidade" : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { isDark, toggleDark } = useIsDark();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [formOpen, setFormOpen] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<any>(null);

  const statsQuery = useGetIssueStats();
  const catQuery = useGetIssuesByCategory();
  const prioQuery = useGetIssuesByPriority();
  const trendQuery = useGetIssuesTrend();
  const listQuery = useListIssues();

  const loading = statsQuery.isLoading || statsQuery.isFetching || 
                  catQuery.isLoading || catQuery.isFetching ||
                  prioQuery.isLoading || prioQuery.isFetching ||
                  trendQuery.isLoading || trendQuery.isFetching ||
                  listQuery.isLoading || listQuery.isFetching;

  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (!autoRefreshInterval) return;
    const i = setInterval(() => handleRefresh(), autoRefreshInterval);
    return () => clearInterval(i);
  }, [autoRefreshInterval]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const lastRefreshed = statsQuery.dataUpdatedAt
    ? (() => {
        const d = new Date(statsQuery.dataUpdatedAt);
        const time = d.toLocaleTimeString("pt-BR", { hour: "numeric", minute: "2-digit" });
        return `${time}`;
      })()
    : null;

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const stats = statsQuery.data || { total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 };
  const categories = catQuery.data || [];
  const priorities = prioQuery.data || [];
  const trends = trendQuery.data || [];
  const issues = listQuery.data || [];

  const statusData = [
    { name: "Aberto", value: stats.open, fill: CHART_COLORS.blue },
    { name: "Em Andamento", value: stats.inProgress, fill: CHART_COLORS.amber },
    { name: "Resolvido", value: stats.resolved, fill: CHART_COLORS.green },
  ];

  const priorityDataForPie = priorities.map(p => ({
    name: p.priority === 'critical' ? 'Crítico' : p.priority === 'high' ? 'Alta' : p.priority === 'medium' ? 'Média' : 'Baixa',
    value: p.count,
    originalPriority: p.priority
  }));

  const handleEditIssue = (issue: any) => {
    setIssueToEdit(issue);
    setFormOpen(true);
  };

  const handleNewIssue = () => {
    setIssueToEdit(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background px-5 py-4 pt-[32px] pb-[32px] pl-[24px] pr-[24px]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="pt-2">
            <h1 className="font-bold text-[32px]">Dashboard ML Issues</h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">Acompanhamento de problemas do Mercado Livre</p>
            
            {DATA_SOURCES.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[12px] text-muted-foreground shrink-0">
                  Data Sources:
                </span>
                {DATA_SOURCES.map((source) => (
                  <span
                    key={source}
                    className="text-[12px] font-bold rounded px-2 py-0.5 truncate print:!bg-[rgb(229,231,235)] print:!text-[rgb(75,85,99)]"
                    title={source}
                    style={{
                      maxWidth: "20ch",
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgb(229, 231, 235)",
                      color: isDark ? "#c8c9cc" : "rgb(75, 85, 99)",
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
            
            {lastRefreshed && <p className="text-[12px] text-muted-foreground mt-3">Última atualização: {lastRefreshed}</p>}
          </div>
          
          <div className="flex items-center gap-3 pt-2 print:hidden">
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center rounded-[6px] overflow-hidden h-[26px] text-[12px]"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2",
                  color: isDark ? "#c8c9cc" : "#4b5563",
                }}
              >
                <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1 px-2 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
                  Atualizar
                </button>
                <div className="w-px h-4 shrink-0" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                <button onClick={() => setDropdownOpen((o) => !o)} className="flex items-center justify-center px-1.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-md z-50 py-1 text-sm">
                  <div className="px-3 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Auto-Atualizar</div>
                  <button 
                    className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center justify-between"
                    onClick={() => { setAutoRefreshInterval(null); setDropdownOpen(false); }}
                  >
                    <span>Desligado</span>
                    {autoRefreshInterval === null && <span className="text-primary text-xs">✓</span>}
                  </button>
                  {INTERVAL_OPTIONS.map(opt => (
                    <button 
                      key={opt.ms}
                      className="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center justify-between"
                      onClick={() => { setAutoRefreshInterval(opt.ms); setDropdownOpen(false); }}
                    >
                      <span>{opt.label}</span>
                      {autoRefreshInterval === opt.ms && <span className="text-primary text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
              aria-label="Export as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleDark}
              className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            
            <Button onClick={handleNewIssue} size="sm" className="h-[26px] ml-2">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Novo Problema
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Total de Problemas</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{stats.total}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Em Aberto</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{stats.open}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{stats.inProgress}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.green }}>{stats.resolved}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* Trend Area Chart */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Evolução (Últimos 30 dias)</CardTitle>
              {!loading && trends.length > 0 && (
                <CSVLink data={trends} filename="tendencia-problemas.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300} debounce={0}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(d) => {
                        try {
                          const [y,m,day] = d.split('-');
                          return format(new Date(Number(y), Number(m)-1, Number(day)), "dd/MM");
                        } catch { return d; }
                      }} 
                      tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} 
                    />
                    <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                    <Legend content={<CustomLegend />} />
                    <Area type="monotone" dataKey="created" name="Criados" stroke={CHART_COLORS.red} fillOpacity={1} fill="url(#colorCreated)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="resolved" name="Resolvidos" stroke={CHART_COLORS.green} fillOpacity={1} fill="url(#colorResolved)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Bar Chart */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Por Categoria</CardTitle>
              {!loading && categories.length > 0 && (
                <CSVLink data={categories} filename="por-categoria.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300} debounce={0}>
                  <BarChart data={categories} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} width={80} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={false} />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="open" name="Aberto/Em Andamento" stackId="a" fill={CHART_COLORS.blue} isAnimationActive={false} />
                    <Bar dataKey="resolved" name="Resolvido" stackId="a" fill={CHART_COLORS.green} isAnimationActive={false} radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Priority Donut Chart */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Distribuição por Prioridade</CardTitle>
              {!loading && priorityDataForPie.length > 0 && (
                <CSVLink data={priorities} filename="por-prioridade.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300} debounce={0}>
                  <PieChart>
                    <Pie 
                      data={priorityDataForPie} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80}
                      outerRadius={120} 
                      cornerRadius={2} 
                      paddingAngle={2} 
                      isAnimationActive={false} 
                      stroke="none"
                    >
                      {priorityDataForPie.map((entry, index) => {
                        let fill = CHART_COLORS.gray;
                        if (entry.originalPriority === 'critical') fill = CHART_COLORS.red;
                        if (entry.originalPriority === 'high') fill = CHART_COLORS.orange;
                        if (entry.originalPriority === 'medium') fill = CHART_COLORS.yellow;
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Bar Chart */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Resumo de Status</CardTitle>
              {!loading && statusData.length > 0 && (
                <CSVLink data={statusData} filename="resumo-status.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export chart data as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300} debounce={0}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                    <YAxis tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={false} />
                    <Bar dataKey="value" name="Quantidade" fillOpacity={0.8} activeBar={{ fillOpacity: 1 }} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Full Detail Table */}
        <div className="mt-8 mb-12">
          <h2 className="text-xl font-bold mb-4">Todos os Problemas</h2>
          {loading ? (
             <div className="space-y-2">
               <Skeleton className="h-10 w-full" />
               {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
          ) : (
            <IssueTable data={issues} onEdit={handleEditIssue} />
          )}
        </div>

      </div>
      
      <IssueForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        issueToEdit={issueToEdit} 
      />
    </div>
  );
}
