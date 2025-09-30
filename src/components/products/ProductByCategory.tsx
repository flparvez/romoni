import React from "react";
import NewArrived from "@/components/home/NewArrived";
import type { IIProduct } from "@/types/iproduct";

interface RelatedProductsProps {
  slug: string;
  products: IIProduct[];
  excludeProductId?: string; // current product will be excluded
}

const RelatedProducts = ({ slug, products, excludeProductId }: RelatedProductsProps) => {
  // Filter products by category and exclude current product
  const filteredProducts: IIProduct[] = products
    .filter(
      (product: IIProduct) =>
        product.category?.slug === slug && product._id !== excludeProductId
    )
    .slice(0, 6); // show up to 6 related products

  if (filteredProducts.length === 0) return null; // hide section if no related products

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
        Related Products
      </h2>
      <NewArrived products={filteredProducts} />
    </section>
  );
};

export default RelatedProducts;
