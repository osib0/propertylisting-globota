"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

interface AppContextType {
  isTab: string;
  setTab: Dispatch<SetStateAction<any>>;
  isAprove: boolean;
  setListingData: Dispatch<SetStateAction<any>>;
  isListingData: any;
  propertyId: string | null;
  userId: string | undefined;
  setPropertyTile: Dispatch<SetStateAction<any>>;
  propertyTitle: string;
  isAddRoom: boolean;
  setAddRoom: Dispatch<SetStateAction<boolean>>;
  isEdit: boolean;
  setEdit: Dispatch<SetStateAction<boolean>>;
  isAddRateplan: boolean;
  setAddRateplan: Dispatch<SetStateAction<boolean>>;
  isEditRateplan: boolean;
  setEditRateplan: Dispatch<SetStateAction<boolean>>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [isTab, setTab] = useState<string>('Property Details');
  const [isAprove, setAproved] = useState<boolean>(false);
  const [isListingData, setListingData] = useState([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertyTitle, setPropertyTile] = useState<string>('');
  const [isAddRoom, setAddRoom] = useState<boolean>(false);
  const [isEdit, setEdit] = useState<boolean>(false);
  const [isAddRateplan, setAddRateplan] = useState<boolean>(false);
  const [isEditRateplan, setEditRateplan] = useState<boolean>(false);

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


  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/user/get?id=${userId}`);
        const result = await res.json();
        if (result.status) setPropertyId(result.data.propertyId);
        else toast.error("Failed to fetch user details");
      } catch {
        toast.error("Error fetching user data");
      }
    }
    fetchUserData();
  }, [userId]);


  return (
    <AppContext.Provider value={{
      isTab,
      setTab,
      isAprove,
      isListingData,
      setListingData,
      propertyId,
      userId,
      setPropertyTile,
      propertyTitle,
      isAddRoom, 
      setAddRoom,
      isEdit, 
      setEdit,
      isAddRateplan,
      setAddRateplan,
      isEditRateplan,
      setEditRateplan
    }}>
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
