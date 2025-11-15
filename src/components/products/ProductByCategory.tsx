"use client";

import { useEffect, useState } from "react";
import NewArrived from "@/components/home/NewArrived";
import ProductListSkeleton from "@/components/Skelton";
import type { IProduct } from "@/types/index";
import { SITE_URL } from "@/hooks/serverApi";

interface RelatedProductsProps {
  slug: string;
  excludeProductId?: string;
}

export default function RelatedProducts({
  slug,
  excludeProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true; // prevents updating state after unmount

    async function loadProducts() {
      setLoading(true);

      try {
        const res = await fetch(
          `${SITE_URL}/api/products?category=${slug}&limit=8&page=1`,
          {
            cache: "force-cache",
            next: { revalidate: 120 },
          }
        );

        if (!res.ok) return setProducts([]);

        const data = await res.json();
        let related = data.products || [];

        // Filter out current product
        related = related.filter((p: IProduct) => p._id !== excludeProductId);

        if (isMounted) setProducts(related);
      } catch (err) {
        console.error("Failed to load related products", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [slug, excludeProductId]);

  if (loading)
    return (
      <div className="mt-6">
        <ProductListSkeleton />
      </div>
    );

  if (!products.length) return null;

  return (
    <section className="mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
        Related Products
      </h2>

      <NewArrived products={products} />
    </section>
  );
}
