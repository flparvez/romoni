"use client";

import React, { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreHorizontal, Copy, Trash2, RefreshCw, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import type { IProduct } from "@/types/index";
import { Pagination } from "@/components/admin/pagination";

// --- Components ---

// Memoized Product Row for Performance
const ProductRow = React.memo(({ p, index, page, onDelete, onDuplicate }: { 
  p: IProduct; 
  index: number; 
  page: number;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="border-b last:border-b-0 hover:bg-gray-50 group"
    >
      <td className="px-4 py-3 text-sm text-gray-500">{(page - 1) * 20 + index + 1}</td>
      <td className="px-4 py-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-gray-100">
           {/* Optimized Image */}
          <Image 
            src={p.images?.[0]?.url || "/placeholder.jpg"} 
            alt={p.name} 
            fill
            sizes="48px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <Link href={`/admin/products/edit/${p._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
          {p.name}
        </Link>
        <div className="text-xs text-gray-500">{p.shortName || "No Shortname"}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
            {p.category?.name || "Uncategorized"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-bold text-gray-800">৳{p.price}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {p.stock} In Stock
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/products/edit/${p._id}`}
            className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition"
            title="Edit"
          >
            <Edit size={15} />
          </Link>
          <button
            onClick={() => onDuplicate(p._id)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
            title="Duplicate"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => onDelete(p._id)}
            className="p-2 rounded-md hover:bg-red-50 text-red-600 transition"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
});
ProductRow.displayName = "ProductRow";


// --- Main Page Component ---

type Props = {
  initialProducts: IProduct[];
  initialPage: number;
  initialTotalPages: number;
};

export default function ProductsClientPage({
  initialProducts,
  initialPage,
  initialTotalPages,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition(); // For smooth URL updates
  
  // Sync State from URL Params
  const page = Number(searchParams.get("page")) || initialPage;
  const searchTerm = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "latest";

  // Local Search State for Debouncing
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sync Products when props change (Server Refetch)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // --- URL Update Logic (The Source of Truth) ---
  const updateURL = useCallback((params: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    // Reset to page 1 if filter changes (except page itself)
    if (!params.page && params.page !== 0) { 
        newParams.set("page", "1");
    }

    startTransition(() => {
        router.push(`${pathname}?${newParams.toString()}`);
    });
  }, [pathname, router, searchParams]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        updateURL({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchTerm, updateURL]);

  // --- Actions ---

  const handleRefresh = () => {
    setLoading(true);
    router.refresh(); // Re-fetches server component
    setTimeout(() => setLoading(false), 800);
    toast.success("List refreshed");
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicate this product?")) return;
    setLoading(true); // Show global loading
    try {
      const res = await fetch(`/api/products/duplicate/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product duplicated");
      router.refresh();
    } catch {
      toast.error("Duplicate failed");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete permanently?")) return;
    
    // ⚡ Optimistic Update: Remove from UI immediately
    const previousProducts = [...products];
    setProducts(prev => prev.filter(p => p._id !== id));

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product deleted");
      router.refresh(); // Sync with server in background
    } catch {
      setProducts(previousProducts); // Rollback on error
      toast.error("Delete failed");
    }
  };

  // --- Render ---

  return (
    <div className="w-full pb-20">
      
      {/* 1. Header & Controls */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center max-w-7xl mx-auto">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={sort}
              onChange={(e) => updateURL({ sort: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="sold">Best Selling</option>
            </select>

            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading || isPending ? "animate-spin" : ""}`} />
            </button>

            <Link 
              href="/admin/products/create" 
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow-sm whitespace-nowrap"
            >
              + Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Product Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden relative min-h-[400px]">
          
          {/* Loading Overlay */}
          {(isPending || loading) && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
               <Loader2 className="w-8 h-8 text-primary animate-spin"/>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider w-20">Image</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence initial={false}>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <ProductRow
                        key={product._id}
                        p={product}
                        index={index}
                        page={page}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No products found matching your criteria.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="border-t px-4 py-3 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-600">
               Page {page} of {initialTotalPages}
            </span>
            <Pagination
              currentPage={page}
              totalPages={initialTotalPages}
              onPageChange={(p) => updateURL({ page: p })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}