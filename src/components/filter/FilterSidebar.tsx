"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ICategoryRef } from "@/types/iproduct";
import { SortOptions } from "./useProductFilters";

interface Props {
  categories: ICategoryRef[];
  filters: {
    minPrice: number;
    maxPrice: number;
    category?: string;
    sort: SortOptions;
  };
  updateFilters: (newFilters: Partial<any>) => void;
}

const sortOptions: { label: string; value: SortOptions }[] = [
  { label: "Latest", value: "latest" },
  { label: "Price (Low to High)", value: "price_asc" },
  { label: "Price (High to Low)", value: "price_desc" },
  { label: "Best Selling", value: "best_selling" },
  { label: "Most Popular", value: "popular" },
];

const FilterSidebar = ({ categories, filters, updateFilters }: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarVariants: Record<string, any> = {
    hidden: { x: "-100%" },
    visible: { x: "0%", transition: { type: "tween", duration: 0.3 } },
    exit: { x: "-100%", transition: { type: "tween", duration: 0.3 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 },
  };

  const handleClearFilters = () => {
    updateFilters({
      minPrice: 0,
      maxPrice: 50000,
      category: undefined,
      sort: "latest",
    });
  };

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-16 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg"
      >
        <SlidersHorizontal />
      </button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black opacity-50 z-40"
          />
        )}
        {isMobileMenuOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 p-6 overflow-y-auto lg:static lg:h-auto lg:w-full lg:shadow-none"
          >
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Category Filter */}
            <FilterSection title="Categories">
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      onClick={() => updateFilters({ category: cat._id })}
                      className={`w-full text-left hover:text-blue-600 ${
                        filters.category === cat._id
                          ? "font-bold text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => updateFilters({ category: undefined })}
                    className={`w-full text-left hover:text-blue-600 font-medium ${
                      !filters.category ? "font-bold text-blue-600" : ""
                    }`}
                  >
                    All Categories
                  </button>
                </li>
              </ul>
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="Price Range">
              <div className="flex space-x-2 items-center">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    updateFilters({ minPrice: Number(e.target.value) })
                  }
                  className="w-1/2 p-2 border rounded"
                />
                <span>-</span>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    updateFilters({ maxPrice: Number(e.target.value) })
                  }
                  className="w-1/2 p-2 border rounded"
                />
              </div>
            </FilterSection>

            {/* Sort Filter */}
            <FilterSection title="Sort By">
              <select
                value={filters.sort}
                onChange={(e) =>
                  updateFilters({ sort: e.target.value as SortOptions })
                }
                className="w-full p-2 border rounded"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterSection>

            <div className="mt-6">
              <button
                onClick={handleClearFilters}
                className="w-full py-2 border rounded-lg hover:bg-gray-100"
              >
                Clear All
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold"
      >
        <span>{title}</span>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSidebar;
