import React, { useState } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function Login() {
  const { setIsLoggedIn } = useGlobalContext();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-12 w-12 bg-sidebar flex items-center justify-center rounded-lg mb-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Comando ML</h1>
          <p className="text-sm text-muted-foreground">
            Acesse o sistema de gestão centralizada.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="username">
                Usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="nome@empresa.com.br"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Senha
                </label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-login"
          >
            Entrar no Painel
          </Button>
        </form>
      </div>
      <div className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} ML Gestão. Todos os direitos reservados.
      </div>
    </div>
  );
}
