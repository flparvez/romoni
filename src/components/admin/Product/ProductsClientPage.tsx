"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, Copy, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { IProduct } from "@/types/index";
import { Pagination } from "@/components/admin/pagination";

type Props = {
  initialProducts: IProduct[];
  initialPage: number;
  initialTotalPages: number;
};

const useDebounce = <T,>(value: T, delay = 500): T => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export default function ProductsClientPage({
  initialProducts,
  initialPage,
  initialTotalPages,
}: Props) {
  // Data + paging
  const [products, setProducts] = useState<IProduct[]>(initialProducts || []);
  const [page, setPage] = useState<number>(initialPage || 1);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages || 1);

  // UI state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [loading, setLoading] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("latest");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Build query string
  const buildQuery = useCallback(
    (p = page, q = debouncedSearch) => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", "20");
      if (q) params.set("search", q);
      if (sort) params.set("sort", sort);
      if (categoryFilter) params.set("category", categoryFilter);
      if (isActiveFilter !== undefined) params.set("isActive", String(isActiveFilter));
      if (minPrice !== undefined) params.set("minPrice", String(minPrice));
      if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
      return `/api/products?${params.toString()}`;
    },
    [page, debouncedSearch, sort, categoryFilter, isActiveFilter, minPrice, maxPrice]
  );

  // Fetch function
  const fetchProducts = useCallback(
    async (p = 1, q = "") => {
      setLoading(true);
      try {
        const url = buildQuery(p, q);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || []);
        setPage(data.currentPage || p);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  // Initial and refresh fetch
  useEffect(() => {
    fetchProducts(page, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sort, categoryFilter, isActiveFilter, minPrice, maxPrice, refreshKey]);

  // Handle page change
  const handlePageChange = (p: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // auto scroll to top
    fetchProducts(p, debouncedSearch);
  };

  // Actions
  const duplicateProduct = async (id: string) => {
    if (!confirm("Duplicate this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/duplicate/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Duplicate failed");
      toast.success("Product duplicated");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Duplicate failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  // Chips collection (for UI display)
  const chips = useMemo(() => {
    const out: { key: string; label: string }[] = [];
    if (debouncedSearch) out.push({ key: "q", label: `Search: "${debouncedSearch}"` });
    if (categoryFilter) out.push({ key: "cat", label: `Category: ${categoryFilter}` });
    if (isActiveFilter !== undefined) out.push({ key: "active", label: isActiveFilter ? "Active" : "Inactive" });
    if (minPrice !== undefined || maxPrice !== undefined) {
      out.push({ key: "price", label: `Price: ${minPrice ?? 0} - ${maxPrice ?? "∞"}` });
    }
    if (sort && sort !== "latest") out.push({ key: "sort", label: `Sort: ${sort.replace("_", " ")}` });
    return out;
  }, [debouncedSearch, categoryFilter, isActiveFilter, minPrice, maxPrice, sort]);

  // Loading skeleton row
  const SkeletonRows = () => (
    <div className="p-6">
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="flex gap-4 items-center mb-4" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.2 }}>
          <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 w-1/3 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 w-1/6 rounded animate-pulse" />
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sticky top: Search + Controls */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between px-2">
          {/* Left: Search */}
          <div className="flex items-center gap-3 w-full md:w-2/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name, short name or tag..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                title="Sort products"
              >
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="best_selling">Best Selling</option>
                <option value="popular">Popular</option>
              </select>

              <button
                onClick={() => { setSearchTerm(""); setCategoryFilter(undefined); setIsActiveFilter(undefined); setMinPrice(undefined); setMaxPrice(undefined); setSort("latest"); }}
                className="text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
                title="Clear filters"
              >
                Clear
              </button>

              <button
                onClick={refresh}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                title="Refresh"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>

          {/* Right: Quick create */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700">
              + Add Product
            </Link>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="max-w-7xl mx-auto px-2 mt-3">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <div key={c.key} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                <span>{c.label}</span>
                <button
                  onClick={() => {
                    if (c.key === "q") setSearchTerm("");
                    if (c.key === "cat") setCategoryFilter(undefined);
                    if (c.key === "active") setIsActiveFilter(undefined);
                    if (c.key === "price") { setMinPrice(undefined); setMaxPrice(undefined); }
                    if (c.key === "sort") setSort("latest");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="mt-6 bg-white rounded-xl shadow border overflow-hidden">
        {/* header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-sm text-gray-500">{products.length} items displayed</p>
          </div>
          <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3 w-20">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
           
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{(page - 1) * 20 + i + 1}</td>

                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100">
                        <img src={p.images?.[0]?.url || "/placeholder.jpg"} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900"> <Link href={`/admin/products/edit/${p._id}`} onClick={(e) => e.stopPropagation()} >{p.name} </Link></div>
                      <div className="text-xs text-gray-500">{p.shortName}</div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700"> {p.category?.name || "—"}</td>

                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">৳{p.price}</td>

                    <td className="px-4 py-3 text-sm">{p.stock}</td>

                   
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/admin/products/edit/${p._id}`} onClick={(e) => e.stopPropagation()} className="px-3 py-1 rounded-md border text-sm">Edit</Link>

                        <button
                          onClick={async (e) => { e.stopPropagation(); await duplicateProduct(p._id); }}
                          className="px-3 py-1 rounded-md border text-sm"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>

                        <button
                          onClick={async (e) => { e.stopPropagation(); await deleteProduct(p._id); }}
                          className="px-3 py-1 rounded-md border text-sm text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="relative">
                          <button title="More" className="p-1 rounded-md border" onClick={(e) => { e.stopPropagation(); /* you can implement dropdown menu here */ }}>
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / pagination area */}
        <div className="p-3 mb-6 border-t flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="text-sm text-gray-600">Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, (totalPages * 20))} of approx {totalPages * 20}</div>
          <div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => handlePageChange(p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
