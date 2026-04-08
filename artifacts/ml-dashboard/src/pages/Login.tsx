import { useState } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingBag, TrendingUp, Package, Zap } from "lucide-react";

const STATS = [
  { label: "Anúncios ativos", value: "15.284" },
  { label: "Contas gerenciadas", value: "4" },
  { label: "Faturamento mensal", value: "R$ 484k" },
  { label: "Pedidos este mês", value: "1.518" },
];

const FEATURES = [
  { icon: TrendingUp, text: "Monitoramento de saúde dos anúncios em tempo real" },
  { icon: Package, text: "Controle de estoque com alertas de ruptura" },
  { icon: Zap, text: "Fila de correções automáticas com aprovação humana" },
  { icon: ShoppingBag, text: "Gestão unificada de 4 contas Mercado Livre" },
];

export default function Login() {
  const { setIsLoggedIn } = useGlobalContext();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLocation("/");
    }, 600);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left panel: brand + stats ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "hsl(222 20% 9%)" }}
      >
        {/* Background decorative elements */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, hsl(43 75% 48% / .25) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, hsl(222 30% 20% / .8) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "hsl(43 75% 48%)", filter: "blur(80px)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(43 75% 48%)" }}
            >
              <ShoppingBag className="h-5 w-5 text-black" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ML Gestão</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "hsl(220 15% 55%)" }}>
            Painel de Controle Centralizado
          </p>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
            Gerencie todas as<br />
            <span style={{ color: "hsl(43 75% 55%)" }}>suas contas ML</span><br />
            em um só lugar.
          </h1>
          <p className="text-base mb-10" style={{ color: "hsl(220 15% 55%)", lineHeight: 1.6 }}>
            Visibilidade total sobre anúncios, estoque, frete,<br />
            ads e correções automáticas com aprovação humana.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(43 75% 48% / .15)", border: "1px solid hsl(43 75% 48% / .2)" }}
                >
                  <f.icon className="h-4 w-4" style={{ color: "hsl(43 75% 55%)" }} />
                </div>
                <span className="text-sm" style={{ color: "hsl(220 15% 65%)" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10">
          <div
            className="grid grid-cols-4 gap-4 p-5 rounded-xl"
            style={{ background: "hsl(222 20% 13%)", border: "1px solid hsl(222 15% 18%)" }}
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-xs" style={{ color: "hsl(220 15% 50%)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3" style={{ color: "hsl(220 15% 35%)" }}>
            © 2026 ML Gestão · Sistema de Gestão Centralizada
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(43 75% 48%)" }}>
            <ShoppingBag className="h-4.5 w-4.5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">ML Gestão</span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-muted-foreground">
              Acesse o painel com suas credenciais de operador.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="username">
                Usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="nome@empresa.com.br"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="h-11 bg-white border-border focus-visible:ring-1 focus-visible:ring-primary text-sm"
                data-testid="input-username"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground" htmlFor="password">
                  Senha
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: "hsl(43 75% 42%)" }}>
                  Esqueci a senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-11 bg-white border-border focus-visible:ring-1 focus-visible:ring-primary text-sm"
                data-testid="input-password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold tracking-wide transition-all"
              style={{
                background: "hsl(43 75% 48%)",
                color: "hsl(222 20% 9%)",
                boxShadow: "0 4px 14px hsl(43 75% 48% / .35)",
              }}
              data-testid="button-login"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : "Entrar no Painel"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Acesso restrito a operadores autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
