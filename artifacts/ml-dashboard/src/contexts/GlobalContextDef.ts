import { createContext } from "react";

export interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
