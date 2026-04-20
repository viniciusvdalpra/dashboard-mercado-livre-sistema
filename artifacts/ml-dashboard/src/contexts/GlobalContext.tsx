import { useState, ReactNode } from "react";
import { GlobalContext } from "@/contexts/GlobalContextDef";

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("ml_token"));
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleSetIsLoggedIn = (value: boolean) => {
    if (!value) localStorage.removeItem("ml_token");
    setIsLoggedIn(value);
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn: handleSetIsLoggedIn,
        selectedAccountId,
        setSelectedAccountId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
