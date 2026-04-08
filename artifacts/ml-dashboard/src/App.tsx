import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalProvider, useGlobalContext } from "@/contexts/GlobalContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import DashboardGeral from "@/pages/DashboardGeral";
import SaudeAnuncios from "@/pages/SaudeAnuncios";
import ItemDetail from "@/pages/ItemDetail";
import Estoque from "@/pages/Estoque";
import Ads from "@/pages/Ads";
import Frete from "@/pages/Frete";
import Correcoes from "@/pages/Correcoes";
import Precos from "@/pages/Precos";
import Compatibilidade from "@/pages/Compatibilidade";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

function ProtectedRouter() {
  const { isLoggedIn } = useGlobalContext();

  if (!isLoggedIn) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DashboardGeral} />
      <Route path="/saude" component={SaudeAnuncios} />
      <Route path="/saude/:itemId" component={ItemDetail} />
      <Route path="/estoque" component={Estoque} />
      <Route path="/ads" component={Ads} />
      <Route path="/frete" component={Frete} />
      <Route path="/correcoes" component={Correcoes} />
      <Route path="/precos" component={Precos} />
      <Route path="/compatibilidade" component={Compatibilidade} />
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
          <Toaster />
        </GlobalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
