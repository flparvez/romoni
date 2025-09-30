"use client";
import useSWR from "swr";
import { useState } from "react";
import { IIProduct } from "@/types/iproduct";
import { SITE_URL } from "@/types/product";

export type SortOptions =
  | "latest"
  | "price_asc"
  | "price_desc"
  | "best_selling"
  | "popular";

interface ProductResponse {
  products: IIProduct[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useProductFilters() {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 50000,
    category: undefined as string | undefined,
    sort: "latest" as SortOptions,
  });

  const query = new URLSearchParams({
    minPrice: filters.minPrice.toString(),
    maxPrice: filters.maxPrice.toString(),
    sort: filters.sort,
    ...(filters.category ? { category: filters.category } : {}),
  });

  const { data, error, isLoading, mutate } = useSWR<ProductResponse>(
    `${SITE_URL}/api/products/filter?${query.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 8000, // প্রতি 8s এ fresh
      keepPreviousData: true,
    }
  );

  const updateFilters = (newFilters: Partial<typeof filters>) =>
    setFilters((prev) => ({ ...prev, ...newFilters }));

  return {
    products: data?.products ?? [],
    filters,
    updateFilters,
    loading: isLoading,
    error,
    mutate,
  };
}
