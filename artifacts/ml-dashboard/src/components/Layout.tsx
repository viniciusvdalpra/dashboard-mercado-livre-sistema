import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Activity, Package, Megaphone,
  Truck, Wrench, Tags, LogOut, Settings, HelpCircle,
  Bell, ChevronDown, Store, Link2, TrendingUp,
} from "lucide-react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ACCOUNTS } from "@/mock/data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const NAV_MAIN = [
  { path: "/",          label: "Dashboard",          icon: LayoutDashboard },
  { path: "/saude",     label: "Saúde dos Anúncios", icon: Activity },
  { path: "/estoque",   label: "Estoque",            icon: Package },
  { path: "/ads",       label: "Ads",                icon: Megaphone },
  { path: "/frete",     label: "Frete",              icon: Truck },
  { path: "/correcoes",      label: "Correções",          icon: Wrench },
  { path: "/precos",         label: "Preços",             icon: Tags },
  { path: "/compatibilidade",label: "Vínculos em Massa",  icon: Link2 },
  { path: "/lucratividade",  label: "Lucratividade",      icon: TrendingUp },
];

function NavItem({ path, label, icon: Icon, active }: {
  path: string; label: string; icon: React.ElementType; active: boolean;
}) {
  return (
    <Link
      href={path}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "text-white shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
      }`}
      style={active ? {
        background: "linear-gradient(135deg, hsl(174 55% 26%) 0%, hsl(174 65% 32%) 100%)",
        boxShadow: "0 4px 12px hsl(174 72% 36% / .3)",
      } : {}}
      data-testid={`nav-${path}`}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : ""}`} />
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { selectedAccountId, setSelectedAccountId, setIsLoggedIn } = useGlobalContext();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const currentPage = location.startsWith("/saude/")
    ? "Detalhe do Anúncio"
    : NAV_MAIN.find(i => isActive(i.path))?.label ?? "";

  return (
    <div className="flex min-h-screen bg-background font-sans">

      {/* ── Sidebar ── */}
      <aside
        className="fixed left-0 top-0 z-40 h-screen w-58 flex flex-col bg-sidebar"
        style={{
          width: 224,
          borderRight: "1px solid hsl(var(--sidebar-border))",
          boxShadow: "1px 0 0 hsl(var(--sidebar-border))",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 h-16 px-5"
          style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(174 55% 26%) 0%, hsl(174 65% 36%) 100%)",
            }}
          >
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">ML Gestão</span>
        </div>

        {/* Active context pill */}
        <div className="px-3 pt-4 pb-2">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, hsl(174 55% 26%) 0%, hsl(174 65% 32%) 100%)",
              boxShadow: "0 4px 12px hsl(174 72% 36% / .25)",
            }}
          >
            <Store className="h-4 w-4 text-teal-200 flex-shrink-0" />
            <span className="flex-1 truncate">Mercado Livre</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          <div className="py-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Principal
            </p>
            {NAV_MAIN.slice(0, 1).map(item => (
              <NavItem key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>

          <div className="py-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Anúncios
            </p>
            {NAV_MAIN.slice(1, 5).map(item => (
              <NavItem key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>

          <div className="py-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Automação
            </p>
            {NAV_MAIN.slice(5).map(item => (
              <NavItem key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div
          className="px-3 py-4 space-y-0.5"
          style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}
        >
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <HelpCircle className="h-4 w-4" />
            Ajuda
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            data-testid="btn-logout"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0" style={{ paddingLeft: 224 }}>

        {/* Top header */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-7 bg-white"
          style={{ borderBottom: "1px solid hsl(var(--border))", boxShadow: "0 1px 3px rgb(0 0 0 / .05)" }}
        >
          {/* Left: title */}
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">{currentPage}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Atualizado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Bell */}
            <button className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-white hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Account selector */}
            <Select
              value={selectedAccountId === null ? "all" : selectedAccountId.toString()}
              onValueChange={v => setSelectedAccountId(v === "all" ? null : Number(v))}
            >
              <SelectTrigger
                className="h-9 w-[180px] bg-white border-border text-sm font-medium"
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

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-1">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(174 55% 26%) 0%, hsl(174 65% 36%) 100%)" }}
              >
                OP
              </div>
              <div className="hidden md:block text-right">
                <div className="text-xs font-semibold text-foreground leading-tight">Operador</div>
                <div className="text-[10px] text-muted-foreground leading-tight">Admin</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-7 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
