import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Activity,
  Package,
  Megaphone,
  Truck,
  Wrench,
  Tags,
  LogOut,
} from "lucide-react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { ACCOUNTS } from "@/mock/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/saude", label: "Saúde dos Anúncios", icon: Activity },
  { path: "/estoque", label: "Estoque", icon: Package },
  { path: "/ads", label: "Ads", icon: Megaphone },
  { path: "/frete", label: "Frete", icon: Truck },
  { path: "/correcoes", label: "Correções", icon: Wrench },
  { path: "/precos", label: "Preços", icon: Tags },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { selectedAccountId, setSelectedAccountId, setIsLoggedIn } =
    useGlobalContext();

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const currentRoute = NAV_ITEMS.find((item) =>
    location === "/" ? item.path === "/" : location.startsWith(item.path) && item.path !== "/"
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-bold text-lg text-sidebar-primary tracking-wide">
            <LayoutDashboard className="h-5 w-5" />
            ML Gestão
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === "/" ? item.path === "/" : location.startsWith(item.path) && item.path !== "/";
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            data-testid="btn-logout"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 bg-background/95 backdrop-blur border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">
            {currentRoute?.label || "Detalhes"}
          </h1>

          <div className="flex items-center gap-4">
            <Select
              value={selectedAccountId === null ? "all" : selectedAccountId.toString()}
              onValueChange={(val) => setSelectedAccountId(val === "all" ? null : Number(val))}
            >
              <SelectTrigger className="w-[200px] h-9 bg-card border-border" data-testid="select-account">
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
