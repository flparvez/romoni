import React from 'react';

// Skeleton for a single product card
export const ProductSkeleton = () => (
  <div className="bg-white rounded-md overflow-hidden animate-pulse">
    <div className="w-full aspect-square bg-gray-200" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-full mb-2" />
      <div className="h-8 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

// Skeleton for the entire grid, showing multiple card skeletons
export const ProductGridSkeleton = () => (
  <section className="w-full bg-gray-50 py-6 px-2 sm:px-4 md:py-12 lg:px-8">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] sm:gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  </section>
);