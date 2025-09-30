"use client";
import { useProductFilters } from "./useProductFilters";
import NewArrived from "@/components/home/NewArrived";
import FilterSidebar from "./FilterSidebar";
import { Loader2 } from "lucide-react";
import { ICategoryRef } from "@/types/iproduct";

const ProductFilter = ({ categories }: { categories: ICategoryRef[] }) => {
  const { products, loading, error, filters, updateFilters } = useProductFilters();

  return (
    <div className="flex flex-col lg:flex-row gap-2 py-4 px-2 md:px-6">
      <div className="w-full lg:w-1/4">
        <FilterSidebar
          categories={categories}
          filters={filters}
          updateFilters={updateFilters}
        />
      </div>
      <div className="w-full lg:w-3/4">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">Failed to load products</div>
        ) : products.length > 0 ? (
          <NewArrived products={products} />
        ) : (
          <div className="text-center text-gray-500">No products found</div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
