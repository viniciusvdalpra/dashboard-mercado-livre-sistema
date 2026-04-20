import { createContext } from "react";

export interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
