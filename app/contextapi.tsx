"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
  isTab: string;
  setTab: React.Dispatch<React.SetStateAction<any>>;
  isAprove: boolean
  setListingData: React.Dispatch<React.SetStateAction<any>>
  isListingData: any
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [isTab, setTab] = useState<string>('Property Details');
  const [isAprove, setAproved] = useState<boolean>(false);
  const [isListingData, setListingData] = useState([]);


  useEffect(() => {
    if (!session?.user?.id) return;

    (async function () {
      try {
        const response = await fetch(`/api/listproperty/get?ownerId=${session?.user?.id}`);
        const result = await response.json();
        setAproved(result?.data?.approved || false);
        setListingData(result?.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [session?.user?.id]);

  return (
    <AppContext.Provider value={{ isTab, setTab, isAprove, isListingData, setListingData }}>
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
