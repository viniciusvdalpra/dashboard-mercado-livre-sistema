import React, { useState, ReactNode } from "react";
import { GlobalContext } from "@/contexts/GlobalContextDef";

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
