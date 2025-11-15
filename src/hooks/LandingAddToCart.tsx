"use client";
import type { IProduct } from "@/types/index";
import { useCart } from "./useCart";
import { toast } from "sonner";

export const LandingAddToCart = () => {
  const { addToCart, fromProduct } = useCart();

  const addProductToCart = (
    product: IProduct,
    quantity: number = 1,
    selectedVariants?: Record<string, string>
  ) => {
    const cartItem = fromProduct(product, quantity, selectedVariants);
    addToCart(cartItem);

    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          value: product.price * quantity,
          items: [
            {
              item_id: product._id,
              item_name: product.name,
              item_brand: "A1 Romoni",
              item_category: product.category?.name ?? "General",
              price: product.price,
              quantity,
              ...(selectedVariants && { ...selectedVariants }),
            },
          ],
        },
      });
    }

    toast.success(`${product.name} added to cart!`);
  };

  return { addProductToCart };
};
