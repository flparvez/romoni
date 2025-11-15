// hooks/useProductFilters.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IProduct } from "@/types";

export type SortOptions =
  | "latest"
  | "price_asc"
  | "price_desc"
  | "best_selling"
  | "popular";

export interface UseProductFiltersState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  filters: {
    minPrice: number;
    maxPrice: number;
    category?: string;
    sort: SortOptions;
    search?: string;
  };
  currentPage: number;
  totalPages: number;
  totalCount: number;
  // actions
  updateFilters: (patch: Partial<UseProductFiltersState["filters"]>) => void;
  setPage: (page: number) => void;
  reset: () => void;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const DEFAULT_LIMIT = 20;

export function useProductFilters(initial = {
  page: 1,
  limit: DEFAULT_LIMIT,
  initialFilters: {
    minPrice: 0,
    maxPrice: 50000,
    category: undefined as string | undefined,
    sort: "latest" as SortOptions,
    search: ""
  }
}): UseProductFiltersState {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(initial.page);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [filters, setFilters] = useState(initial.initialFilters);

  // keep abort controller to cancel slow requests
  const controllerRef = useRef<AbortController | null>(null);

  const buildQuery = useCallback((page = 1) => {
    const qp = new URLSearchParams();
    qp.set("page", String(page));
    qp.set("limit", String(initial.limit ?? DEFAULT_LIMIT));
    if (filters.search) qp.set("search", filters.search);
    if (filters.category) qp.set("category", filters.category);
    if (filters.minPrice != null) qp.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice != null) qp.set("maxPrice", String(filters.maxPrice));
    if (filters.sort) qp.set("sort", filters.sort);
    return qp.toString();
  }, [filters, initial.limit]);

  const fetchPage = useCallback(async (page = 1, append = false) => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const query = buildQuery(page);
      const res = await fetch(`/api/products?${query}`, {
        signal: controllerRef.current.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Failed to fetch products (${res.status})`);
      }
      const data = await res.json();
      const fetched: IProduct[] = data.products || [];
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalCount ?? fetched.length);
      setCurrentPage(data.currentPage ?? page);

      setProducts(prev => append ? [...prev, ...fetched] : fetched);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // initial load + whenever filters change -> fetch page 1
  useEffect(() => {
    // whenever filters change, reset to page 1 and fetch
    setCurrentPage(1);
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minPrice, filters.maxPrice, filters.category, filters.sort, filters.search]);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  };

  const setPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    fetchPage(page, false);
    // scroll to top will be handled by consumer
  };

  const loadMore = async () => {
    if (loading) return;
    if (currentPage >= totalPages) return;
    const next = currentPage + 1;
    await fetchPage(next, true);
  };

  const reset = () => {
    setFilters(initial.initialFilters);
    setProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
  };

  const refetch = () => fetchPage(currentPage, false);

  return {
    products,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    totalCount,
    updateFilters,
    setPage,
    reset,
    loadMore,
    refetch,
  };
}
