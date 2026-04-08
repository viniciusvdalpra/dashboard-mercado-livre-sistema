import React, { createContext, useContext, useState, ReactNode } from "react";
import { ACCOUNTS } from "@/mock/data";

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  selectedAccountId: number | null; // null means "All accounts"
  setSelectedAccountId: (id: number | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

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

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}
