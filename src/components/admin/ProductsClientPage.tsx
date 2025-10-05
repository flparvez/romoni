"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Search } from "lucide-react"; 
import { motion } from "framer-motion"; 
import { ProductsTable } from "@/components/admin/products-table";
import Link from "next/link";
import { Pagination } from "@/components/admin/pagination";
import { toast } from "sonner";
import { IIProduct } from "@/types/iproduct";

// --- Utility Hooks ---
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Main Client Component ---
export default function ProductsClientPage({ initialProducts }: { initialProducts: IIProduct[] }) {
  // ✅ Initialize state with server-fetched data
  const [products, setProducts] = useState<IIProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = useCallback(async (searchQuery: string) => {
    setLoading(true);
    // This function now only handles dynamic searches
    const url = `/api/products/filter?search=${encodeURIComponent(searchQuery)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || data || []);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effect to handle dynamic searching
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      fetchProducts(debouncedSearchTerm);
    } else if (searchTerm.length === 0) {
      // ✅ When search is cleared, reset to the initial static list
      setProducts(initialProducts);
    }
  }, [debouncedSearchTerm, searchTerm, initialProducts, fetchProducts]);

  const duplicateProduct = async (id: string) => {
    if (!window.confirm("Duplicate this product?")) return; 
    setLoading(true);
    try {
      const res = await fetch(`/api/products/duplicate/${id}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to duplicate");
      
      toast.success("Product duplicated!");
      // Refetch all products to show the new one
      const allProductsRes = await fetch('/api/products');
      const allData = await allProductsRes.json();
      setProducts(allData.products || allData);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProductById = async (id: string) => {
    if (!window.confirm("Delete this product permanently?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
       if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
      
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8"
    >
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Product Management</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-lg relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
        <Link href="/admin/products/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto font-semibold">Add New Product</Button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border overflow-hidden"
      >
        <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-700">Product List ({products.length} found)</h2>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
            <ProductsTable
              handleDeleteProductById={handleDeleteProductById}
              data={products}
              onDuplicate={duplicateProduct}
              loading={loading && searchTerm.length > 0} // Only show loading spinner during search
            />
            {!loading && products.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                    {searchTerm ? `No products match: "${searchTerm}"` : "No products found."}
                </div>
            )}
        </div>
      </motion.div>

      {products.length > 0 && (
        <div className="flex justify-center pb-8">
          <Pagination currentPage={1} totalPages={1} className="mt-4" /> 
        </div>
      )}
    </motion.div>
  );
}
