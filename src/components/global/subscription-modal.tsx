"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useSupabaseUserContext } from "@/lib/providers/supabase-user-provider";
import { Price, ProductWithPrice } from "@/lib/supabase/supabase.types";
import { formatPrice, postData } from "@/lib/utils";
import { Button } from "../ui/button";
import Loader from "./loader";
import { useToast } from "../ui/use-toast";
import { useSubscriptionModalContext } from "@/lib/providers/subscription-modal-provider";

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ products }) => {
  const { open, setOpen } = useSubscriptionModalContext();
  const { subscription, user } = useSupabaseUserContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast({ title: "You must be logged in" });
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast({ title: "Already on a paid plan" });
        setIsLoading(false);
        return;
      }
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });
      console.log("Getting checkout for stripe");
    } catch (error) {}
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status === "active" ? (
        <DialogContent>Already on a paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to a Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a pro plan
          </DialogDescription>
          {products.length
            ? products.map((product) => (
                <div key={product.id}>
                  {product.prices?.map((price) => (
                    <React.Fragment key={price.id}>
                      <b>
                        {formatPrice(price)} ? <small>{price.interval}</small>
                      </b>
                      <Button
                        disabled={isLoading}
                        onClick={() => handleClickContinue(price)}
                      >
                        {isLoading ? <Loader /> : "Upgrade ✨"}
                      </Button>
                    </React.Fragment>
                  ))}
                </div>
              ))
            : ""}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
