import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Price } from "./supabase/supabase.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: Price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || undefined,
    maximumFractionDigits: 0,
  }).format(price?.unitAmount || 0 / 100);
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.log("error in posting data to ", url);
    throw new Error(res.statusText);
  }
  return res.json();
};
