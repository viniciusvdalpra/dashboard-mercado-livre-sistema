import { useState } from "react";
import { useGlobalContext } from "@/contexts/useGlobalContext";
import { useLocation } from "wouter";
import { Store, TrendingUp, ArrowUpRight } from "lucide-react";

const STATS = [
  { value: "15.284", label: "Anúncios ativos", up: true },
  { value: "R$ 484k", label: "Faturamento/mês", up: true },
  { value: "1.518",  label: "Pedidos este mês", up: false },
  { value: "97,2%",  label: "Pedidos no prazo",  up: true },
];

export default function Login() {
  const { setIsLoggedIn } = useGlobalContext();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("Credenciais inválidas");
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("ml_token", data.access_token);
      setIsLoggedIn(true);
      setLocation("/");
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(174 55% 22%) 0%, hsl(174 62% 30%) 60%, hsl(175 50% 36%) 100%)",
        }}
      >
        {/* Subtle blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-10" style={{ background: "white" }} />
          <div className="absolute bottom-16 -left-16 h-48 w-48 rounded-full opacity-10" style={{ background: "white" }} />
          <div className="absolute top-1/2 right-8 h-32 w-32 rounded-full opacity-5" style={{ background: "white" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight leading-none">ML Gestão</div>
            <div className="text-teal-200 text-xs mt-0.5 font-medium">Painel de Controle</div>
          </div>
        </div>

        {/* Main text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white mb-6">
            <TrendingUp className="h-3 w-3" />
            Gestão unificada de 4 contas Mercado Livre
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Controle total<br />
            do seu negócio<br />
            <span className="text-teal-200">em tempo real.</span>
          </h1>
          <p className="text-teal-100/80 text-base leading-relaxed max-w-sm">
            Monitore anúncios, estoque, ads e frete de todas as suas contas num único painel inteligente.
          </p>
        </div>

        {/* Stats grid */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-white/15 backdrop-blur-sm"
                style={{ background: "hsl(0 0% 100% / .08)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-white tracking-tight">{s.value}</span>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${s.up ? "bg-white/15 text-teal-100" : "bg-white/10 text-red-200"}`}>
                    <ArrowUpRight className={`h-3 w-3 ${!s.up ? "rotate-180" : ""}`} />
                    {s.up ? "+" : "-"}
                  </span>
                </div>
                <p className="text-teal-200/70 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-teal-200/40 text-xs mt-4">
            © 2026 ML Gestão · Sistema de Gestão para Mercado Livre
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 py-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(174 55% 26%)" }}>
            <Store className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">ML Gestão</span>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Entre com suas credenciais de acesso
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                placeholder="nome@empresa.com.br"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                data-testid="input-username"
                className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="password">
                  Senha
                </label>
                <button type="button" className="text-xs font-semibold" style={{ color: "hsl(174 55% 32%)" }}>
                  Esqueci a senha
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-testid="input-password"
                className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60"
              />
            </div>


            {error && (
              <p className="text-sm text-red-600 font-medium text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              data-testid="button-login"
              className="w-full h-11 text-sm font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-80"
              style={{
                background: "linear-gradient(135deg, hsl(174 55% 26%) 0%, hsl(174 65% 34%) 100%)",
                boxShadow: "0 6px 20px hsl(174 72% 36% / .35)",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </>
              ) : "Entrar no Painel"}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted/60 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Acesso restrito a operadores autorizados.
              Qualquer uso não autorizado é monitorado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
