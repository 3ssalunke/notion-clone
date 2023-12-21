"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { ProductWithPrice } from "../supabase/supabase.types";
import SubscriptionModal from "@/components/global/subscription-modal";

type SubscriptionModalContextType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const SubscriptionModalContext = createContext<SubscriptionModalContextType>({
  open: false,
  setOpen: () => {},
});

export const SubscriptionModalProvider = ({
  children,
  products,
}: {
  children: React.ReactNode;
  products: ProductWithPrice[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SubscriptionModalContext.Provider value={{ open, setOpen }}>
      {children}
      <SubscriptionModal products={products} />
    </SubscriptionModalContext.Provider>
  );
};

export const useSubscriptionModalContext = () =>
  useContext(SubscriptionModalContext);
