"use client";

import { ICategoryRef, IIProduct } from "@/types/iproduct";
import { SITE_URL } from "@/types/product";
import useSWR from "swr";

interface ICategoryResponse {
  categories: ICategoryRef[];
}

interface IProductsResponse {
  products: IIProduct[];
}

// Generic fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    cache: "no-store",       // সবসময় fresh data server থেকে আনবে
    next: { revalidate: 0 }, // ISR disable, কারণ আমরা SWR ব্যবহার করছি
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// ✅ Products Hook
export function useProducts() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<IProductsResponse>(`${SITE_URL}/api/products`, fetcher, {
    revalidateOnFocus: true,   // ট্যাব এলে fresh হবে
    refreshInterval: 5000,     // প্রতি 5s পর background এ fresh হবে
    dedupingInterval: 4000,    // cache থেকে data serve করবে, কিন্তু খুব ঘন ঘন call করবে না
    keepPreviousData: true,    // পুরানো data দেখাবে, loading flash হবে না
  });

  return {
    products: data?.products ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

// ✅ Categories Hook
export function useCategories() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<ICategoryResponse>(`${SITE_URL}/api/categories`, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000,    // প্রতি 10s পর fresh হবে
    dedupingInterval: 8000,
    keepPreviousData: true,
  });

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
