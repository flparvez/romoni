"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- Type Definitions ---
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
}

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


// --- Search Dropdown Component ---

interface SearchDropdownProps {
  products: IProduct[];
  loading: boolean;
  searchTerm: string;
  onSelectResult: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ products, loading, searchTerm, onSelectResult }) => {
  if (!searchTerm || searchTerm.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-40"
    >
      {loading && (
        <div className="flex justify-center items-center p-4 text-blue-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Searching...
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No results found for **"{searchTerm}"**.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="py-2">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product.slug}`}
              onClick={onSelectResult}
              className="flex items-center p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 flex-shrink-0 relative mr-3 border rounded-md overflow-hidden">
                <Image
                  src={product.images[0]?.url || "/placeholder.png"}
                  alt={product.name}
                  fill
                  sizes="40px"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/f3f4f6/a3a3a3?text=P' }}
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
          <div className="p-2 border-t text-center">
            <Link href={`/products?search=${encodeURIComponent(searchTerm)}`} onClick={onSelectResult} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all results
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Navbar Component ---

const Navbar: React.FC = () => {
  const router = useRouter();
  const { cart } = useCart();
  
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch data effect (triggered by debouncedSearch)
  useEffect(() => {
    const fetchResults = async () => {
      const query = debouncedSearch.trim();
      
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setShowDropdown(true);

      try {
        // Use the existing filter API route
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          // Limit results shown in the dropdown for brevity
          setResults(data.products.slice(0, 5));
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);


  // Handle form submission for full search page navigation
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = search.trim();
    if (searchTerm) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowDropdown(false);
      setSearch(""); // Clear the input after navigating
    }
  };

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  }, []);

  const handleInputFocus = () => {
      if (search.length >= 2) {
          setShowDropdown(true);
      }
  };


  return (
    <>
      <nav className="w-full bg-white border-b border-gray-200 fixed top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex h-[60px] items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-extrabold text-2xl text-gray-900 tracking-wide select-none flex items-center gap-2">
             <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
             <span className="hidden sm:inline text-xl text-gray-800">A1 Romoni</span>
            </Link>
          </div>

          {/* Searchbar (with Dropdown) */}
          <div className="flex-1 mx-4 max-w-xl" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base shadow-inner transition-all duration-200"
              />
              
              <button 
                type="submit" 
                aria-label="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {search.length > 0 && (
                <button
                    type="button"
                    aria-label="Clear Search"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
              )}
            </form>
            
            {/* Instant Search Results Dropdown */}
            {(showDropdown || loading) && (
                <SearchDropdown 
                    products={results} 
                    loading={loading} 
                    searchTerm={search} 
                    onSelectResult={() => {
                        setShowDropdown(false);
                        setSearch("");
                    }}
                />
            )}
          </div>

          {/* Cart Icon */}
          <div className="flex-shrink-0">
            <Link href="/cart" className="relative" aria-label={`View shopping cart with ${cartCount} items`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-7 h-7 text-gray-700" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-[1px] font-bold ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>
      {/* Spacer to push content down */}
      <div className="h-[60px]"></div>
    </>
  );
};

export default Navbar;
