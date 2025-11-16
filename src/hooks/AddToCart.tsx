"use client";

import type { IProduct } from "@/types/index";
import { useCart } from "./useCart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useAddToCart = () => {
  const { addToCart, fromProduct } = useCart();
const router = useRouter();
  const addProductToCart = (
    product: IProduct,
    quantity: number = 1,
    selectedVariants?: Record<string, string>
  ) => {
    const cartItem = fromProduct(product, quantity, selectedVariants);
    addToCart(cartItem);

    if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];

  const item = {
    item_id: product._id,
    item_name: product.name,
    item_brand: "A1 Romoni",
    item_category: product.category?.name ?? "General",
    price: product.price,
    quantity,
    ...(selectedVariants && { ...selectedVariants }),
  };

  // GA4 ADD_TO_CART event
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "BDT",
      value: product.price * quantity,
      items: [item],
    },
  });

  // FACEBOOK PIXEL ADDTOCART event
  window.dataLayer.push({
    event: "AddToCart",
    content_type: "product",
    content_ids: [product._id],
    currency: "BDT",
    value: product.price * quantity,
    items: [item], // optional, GTM mapping possible
  });
}




    toast.success(`${product.name} added to cart!`);
    router.push("/cart");
    
  };

  return { addProductToCart };
};
