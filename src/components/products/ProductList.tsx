import React, { Suspense } from 'react';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from '../skeletons';
import { IIProduct } from '@/types/iproduct';
import { PackageX } from 'lucide-react';
import { SITE_URL } from '@/types/product';


async function getProductIds(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/products`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    const products = await res.json();

    return products?.products.map((product: IIProduct) => product._id);
  } catch (error) {
    console.error('API Error:', error);
    return []; // Return empty array on error
  }
}

export default async function ProductList() {
  const productIds = await getProductIds();

  if (productIds.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto flex flex-col items-center justify-center text-center text-gray-500">
          <PackageX size={48} className="mb-4" />
          <h2 className="text-2xl font-semibold">No Products Found</h2>
          <p className="mt-2 text-sm">Please check back later or try refreshing the page.</p>
        </div>
      </section>
    );
  }

  return ( 
    <section className="bg-white py-4 sm:py-8">
      <div className="container mx-auto px-1">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Latest Products</h2>
          <p className="mt-2 text-base leading-7 text-gray-600">Discover the newest additions to our collection.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-x-0 gap-y-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {productIds.map((id) => (
            <Suspense key={id} fallback={<ProductSkeleton />}>
              <ProductCard id={id} />
            </Suspense>
          ))}
        </div>
      </div>
    </section>
  );
}