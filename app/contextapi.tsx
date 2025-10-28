"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  isTab: string;
  setTab: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isTab, setTab] = useState<string>('Property Details');

  return (
    <AppContext.Provider value={{ isTab, setTab }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
