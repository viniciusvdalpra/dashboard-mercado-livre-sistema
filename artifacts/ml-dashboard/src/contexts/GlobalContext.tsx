import React, { useState, ReactNode } from "react";
import { GlobalContext } from "@/contexts/GlobalContextDef";
import { IS_MOCK } from "@/lib/api";

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    IS_MOCK ? false : !!localStorage.getItem("ml_token")
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        selectedAccountId,
        setSelectedAccountId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
