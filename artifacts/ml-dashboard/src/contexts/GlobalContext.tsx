import React, { createContext, useState, ReactNode } from "react";

export interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

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
