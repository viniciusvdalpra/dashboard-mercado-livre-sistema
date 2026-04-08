import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Activity, Package, Megaphone,
  Truck, Wrench, Tags, LogOut, ShoppingBag, Bell, ChevronDown,
} from "lucide-react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ACCOUNTS } from "@/mock/data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const NAV_ITEMS = [
  { path: "/",          label: "Dashboard",           icon: LayoutDashboard, section: null },
  { path: "/saude",     label: "Saúde dos Anúncios",  icon: Activity,        section: "Anúncios" },
  { path: "/estoque",   label: "Estoque",             icon: Package,         section: null },
  { path: "/ads",       label: "Ads",                 icon: Megaphone,       section: null },
  { path: "/frete",     label: "Frete",               icon: Truck,           section: null },
  { path: "/correcoes", label: "Correções",            icon: Wrench,          section: "Automação" },
  { path: "/precos",    label: "Preços",              icon: Tags,            section: null },
];

function SidebarLink({
  item, isActive,
}: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
}) {
  return (
    <Link
      href={item.path}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-white/10 text-white"
          : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
      }`}
      data-testid={`nav-${item.path}`}
    >
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-white/5 text-sidebar-foreground group-hover:bg-white/10 group-hover:text-white"
        }`}
      >
        <item.icon className="h-4 w-4" />
      </div>
      {item.label}
      {isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { selectedAccountId, setSelectedAccountId, setIsLoggedIn } = useGlobalContext();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const currentPage = NAV_ITEMS.find(i => isActive(i.path));

  const sections: { label: string | null; items: typeof NAV_ITEMS }[] = [
    { label: null, items: NAV_ITEMS.filter(i => !i.section || i.section === "Anúncios").slice(0, 2) },
    { label: null, items: NAV_ITEMS.slice(2, 5) },
    { label: "Automação", items: NAV_ITEMS.slice(5) },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">

      {/* ── Sidebar ── */}
      <aside
        className="fixed left-0 top-0 z-40 h-screen w-60 flex flex-col"
        style={{
          background: "hsl(222 20% 9%)",
          borderRight: "1px solid hsl(222 15% 14%)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 h-16 px-5 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(222 15% 14%)" }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(43 75% 48%)" }}
          >
            <ShoppingBag className="h-4 w-4 text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight leading-none">ML Gestão</div>
            <div className="text-[10px] mt-0.5" style={{ color: "hsl(220 15% 42%)" }}>Painel de Controle</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {/* First group */}
          <div className="mb-1">
            <SidebarLink item={NAV_ITEMS[0]} isActive={isActive(NAV_ITEMS[0].path)} />
          </div>

          <div
            className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "hsl(220 15% 35%)" }}
          >
            Anúncios
          </div>
          {NAV_ITEMS.slice(1, 5).map(item => (
            <SidebarLink key={item.path} item={item} isActive={isActive(item.path)} />
          ))}

          <div
            className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "hsl(220 15% 35%)" }}
          >
            Automação
          </div>
          {NAV_ITEMS.slice(5).map(item => (
            <SidebarLink key={item.path} item={item} isActive={isActive(item.path)} />
          ))}
        </nav>

        {/* Bottom: account indicator + logout */}
        <div
          className="flex-shrink-0 px-3 pb-4 pt-3 space-y-1"
          style={{ borderTop: "1px solid hsl(222 15% 14%)" }}
        >
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: "hsl(222 15% 13%)" }}
          >
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: "hsl(43 75% 48%)", color: "hsl(222 20% 9%)" }}>
              ML
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Operador</div>
              <div className="text-[10px] truncate" style={{ color: "hsl(220 15% 42%)" }}>admin@empresa.com</div>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "hsl(220 15% 50%)" }}
            data-testid="btn-logout"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="pl-60 flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-8"
          style={{
            background: "hsl(var(--background) / .95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid hsl(var(--border))",
            boxShadow: "0 1px 0 hsl(var(--border))",
          }}
        >
          {/* Breadcrumb-style title */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Painel</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-semibold text-foreground">
              {location.startsWith("/saude/")
                ? "Detalhe do Anúncio"
                : currentPage?.label || "Página"}
            </span>
          </div>

          {/* Right: account selector + bell */}
          <div className="flex items-center gap-3">
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <Select
              value={selectedAccountId === null ? "all" : selectedAccountId.toString()}
              onValueChange={v => setSelectedAccountId(v === "all" ? null : Number(v))}
            >
              <SelectTrigger
                className="h-9 w-[185px] bg-card border-border text-sm font-medium"
                data-testid="select-account"
              >
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {ACCOUNTS.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
