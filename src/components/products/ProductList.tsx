// app/(shop)/ProductList.tsx or components/ProductList.tsx
import React from "react";
import Link from "next/link";
import { Image } from "@imagekit/next";
import { PackageX, Star } from "lucide-react";
import { SITE_URL } from "@/types/product";
import { IIProduct } from "@/types/iproduct";

import { ProductCardUI } from "./ProductCard";

type ApiResponse = {
  products: IIProduct[];
};

async function getProducts(): Promise<IIProduct[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/products`, {
      next: { revalidate: 60, tags: ["products"] },
      // cache: 'force-cache' is default with revalidate above
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data: ApiResponse = await res.json();
    return Array.isArray(data?.products) ? data.products : [];
  } catch (e) {
    console.error("Product API Error:", e);
    return [];
  }
}

export default async function ProductList() {
  const products = await getProducts();

  if (!products.length) {
    return (
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-gray-50 py-14">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center text-center text-gray-500">
          <PackageX size={48} className="mb-4" />
          <h2 className="text-2xl font-semibold">No Products Found</h2>
          <p className="mt-2 text-sm">Please check back later.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
        w-screen bg-white
      "
    >
      {/* Full-bleed, zero-gap grid with crisp dividers */}
      <div
        className="
          grid w-full
          grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6
          gap-0
          border-l border-t border-gray-100
        "
      >
        {products.slice(0, 18).map((p) => (
          <ProductCardUI key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

