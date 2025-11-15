// components/ProductFilter.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import NewArrived from "@/components/home/NewArrived";
import FilterSidebar from "./FilterSidebar";
import ProductListSkeleton from "../Skelton";
import { Loader2 } from "lucide-react";
import { ICategory } from "@/types";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useProductFilters } from "./useProductFilters";
import { Pagination } from "../admin/pagination";

type Props = {
  categories: ICategory[];
};

const ProductFilter: React.FC<Props> = ({ categories }) => {
  const {
    products,
    loading,
    error,
    filters,
    updateFilters,
    currentPage,
    totalPages,
    totalCount,
    setPage,
    loadMore,
  } = useProductFilters({
    page: 1,
    limit: 20,
    initialFilters: { minPrice: 0, maxPrice: 50000, category: undefined, sort: "latest", search: "" }
  } as any);

  // mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Filter chips
  const chips = useMemo(() => {
    const acc: { key: string; label: string; value?: string | number }[] = [];
    if (filters.category) acc.push({ key: "category", label: `Category: ${filters.category}`, value: filters.category });
    if (filters.search) acc.push({ key: "search", label: `Search: ${filters.search}`, value: filters.search });
    if (filters.minPrice) acc.push({ key: "minPrice", label: `Min: ৳${filters.minPrice}`, value: filters.minPrice });
    if (filters.maxPrice && filters.maxPrice < 50000) acc.push({ key: "maxPrice", label: `Max: ৳${filters.maxPrice}`, value: filters.maxPrice });
    if (filters.sort && filters.sort !== "latest") acc.push({ key: "sort", label: `Sort: ${filters.sort}`, value: filters.sort });
    return acc;
  }, [filters]);

  const removeChip = (key: string) => {
    if (key === "category") updateFilters({ category: undefined });
    if (key === "search") updateFilters({ search: "" });
    if (key === "minPrice") updateFilters({ minPrice: 0 });
    if (key === "maxPrice") updateFilters({ maxPrice: 50000 });
    if (key === "sort") updateFilters({ sort: "latest" });
  };

  // ❌ REMOVED auto scroll to top section entirely ✔
  // (Removed topRef + useEffect that was scrolling)

  // infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll({
    sentinelRef,
    enabled: Boolean(isMobile && currentPage < totalPages),
    onIntersect: () => loadMore(),
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 py-4 px-2 md:px-6">
      <div className="w-full lg:w-1/4">
        <FilterSidebar
          categories={categories}
          filters={filters}
          updateFilters={updateFilters}
        />
      </div>

      <div className="w-full lg:w-3/4">
        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c.key + String(c.value)}
              onClick={() => removeChip(c.key)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
            >
              {c.label}
              <span className="text-xs text-gray-500">✕</span>
            </button>
          ))}
        </div>

        {/* States */}
        {loading && products.length === 0 ? (
          <div className="p-10 flex justify-center"><ProductListSkeleton /></div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">Failed to load products: {error}</div>
        ) : products.length === 0 ? (
          <ProductListSkeleton />
        ) : (
          <>
            <Suspense fallback={<ProductListSkeleton />}>
              <NewArrived products={products} />
            </Suspense>

            {/* Mobile infinite scroll loader */}
            <div className="flex justify-center mt-4">
              {isMobile ? (
                <>
                  <div ref={sentinelRef} />
                  {currentPage < totalPages && (
                    <div className="py-4 text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="animate-spin" /> Loading more...
                    </div>
                  )}
                </>
              ) : (
                // Desktop pagination
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="text-xs text-gray-500 mt-3">
              Showing page {currentPage} of {totalPages} — {totalCount} items
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
