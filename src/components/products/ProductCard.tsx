import React from 'react';
import { IIProduct } from '@/types/iproduct';
import { ProductCardUI } from './ProductCardUI';
import { SITE_URL } from '@/types/product';

interface ProductResponse {
  product: IIProduct;
}

async function getProductById(id: string): Promise<ProductResponse | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/products/${id}`, {
      next: { revalidate: 3600 }, // Cache individual products for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function ProductCard({ id }: { id: string }) {
  const product = await getProductById(id);

  if (!product) {
    return null; // Don't render anything if a single product fails to load
  }

  return <ProductCardUI product={product?.product} />;
}