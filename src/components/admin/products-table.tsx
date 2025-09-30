"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Search, Edit, Copy, Trash2, Loader2 } from "lucide-react"; // Added icons
import { motion } from "framer-motion"; 
import { Pagination } from "@/components/admin/pagination";
import Link from "next/link";

import { toast } from "sonner";
import { IIProduct } from "@/types/iproduct";

// --- Utility Hooks ---

/**
 * Custom hook to debounce a value.
 * The returned value only updates after the specified delay.
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (cleanup)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- Products Table Component (Refreshed UI) ---

interface ProductsTableProps {
  data: IIProduct[];
  onDuplicate?: (id: string) => void;
  loading?: boolean;
  handleDeleteProductById?: (id: string) => void
}

export const ProductsTable = ({ data, onDuplicate, loading, handleDeleteProductById }: ProductsTableProps) => {
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Loading Products...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
            <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b">
                    <th className="px-4 py-3 min-w-[200px]">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell min-w-[150px]">Category</th>
                    <th className="px-4 py-3 min-w-[100px]">Price</th>
                    <th className="px-4 py-3 hidden md:table-cell min-w-[100px]">Stock</th>
                    <th className="px-4 py-3 text-center min-w-[180px]">Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((product) => (
                    <tr 
                        key={product._id} 
                        className="border-b transition duration-150 ease-in-out hover:bg-gray-50 text-sm"
                    >
                        <td className="px-4 py-3 font-medium text-gray-800">
                         <Link href={`/admin/products/edit/${product._id}`}>    <div className="truncate max-w-xs">{product.name}</div> </Link>
                            <div className="text-xs text-gray-500 md:hidden">{product.category?.name}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                            {product.category?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono text-green-700 font-semibold">
                            ৳{product.price ? product.price.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                                {product.stock || 0}
                            </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2 justify-center items-center">
                            {/* Edit Button */}
                            <Link href={`/admin/products/edit/${product._id}`}>
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    aria-label="Edit Product"
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Link>
                            
                            {/* Duplicate Button */}
                            {onDuplicate && (
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => onDuplicate(product._id)}
                                    disabled={loading}
                                    aria-label="Duplicate Product"
                                    className="text-purple-600 hover:bg-purple-50"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            )}

                            {/* Delete Button */}
                            {handleDeleteProductById && (
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => handleDeleteProductById(product._id)}
                                    disabled={loading}
                                    aria-label="Delete Product"
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};


// NOTE: In a production environment, `window.confirm()` must be replaced 
// with a custom, non-blocking modal UI component to ensure full browser compatibility.

export default function ProductsPage() {
  const [products, setProducts] = useState<IIProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounced search term for API calls

  // Fetches products based on the current search query
  const fetchProducts = useCallback(async (searchQuery: string = "") => {
    setLoading(true);
    let url = `/api/products`;
    
    // Only use the filter API when the search query has at least 2 characters
    if (searchQuery.length >= 2) {
        url = `/api/products/filter?search=${encodeURIComponent(searchQuery)}`;
    } else if (searchQuery.length > 0 && searchQuery.length < 2) {
        // Stop loading state if waiting for more characters
        setLoading(false); 
        return;
    }

    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      
      // Handle response structure from both APIs
      const productList = data.products || data || []; 

      setProducts(productList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to handle initial load and search fetching
  useEffect(() => {
    // If the search term is empty, fetch all products immediately.
    // If debouncedSearchTerm changes, fetch filtered products.
    if (debouncedSearchTerm.length === 0 && searchTerm.length === 0) {
        fetchProducts("");
    } else {
        fetchProducts(debouncedSearchTerm);
    }
    
  }, [debouncedSearchTerm, searchTerm, fetchProducts]);

  const duplicateProduct = async (id: string) => {
    // NOTE: Replace window.confirm with a custom modal in production
    if (!window.confirm("Are you sure you want to duplicate this product?")) return; 
    setLoading(true);

    try {
      const res = await fetch(`/api/products/duplicate/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to duplicate product");
        return;
      }

      // Re-fetch the list to include the duplicated product
      fetchProducts(searchTerm); 
      toast.success("Product duplicated successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Something went wrong!");
    }
  };

  const handleDeleteProductById = async (id: string) => {
    // NOTE: Replace window.confirm with a custom modal in production
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }

      // Remove deleted product from the state locally
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Something went wrong!");
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8"
    >
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Product Management</h1>

      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products by name or tag (min. 2 characters)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
        
        {/* Add Product Button */}
        <Link href="/admin/products/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto font-semibold">Add New Product</Button>
        </Link>
      </div>

      {/* Products table container with clean UI */}
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
            loading={loading}
            />
            {/* Show message when no products are found */}
            {!loading && products.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                    {searchTerm.length >= 2 ? `No products match the search term: "${searchTerm}"` : "No products found. Add a new product to get started."}
                </div>
            )}
        </div>
      </motion.div>

      {/* Pagination (optional) */}
      {products.length > 0 && (
        <div className="flex justify-center pb-8">
          <Pagination currentPage={1} totalPages={1} className="mt-4" /> 
        </div>
      )}
    </motion.div>
  );
}
