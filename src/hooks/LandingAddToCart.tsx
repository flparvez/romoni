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

   
  };

  return { addProductToCart };
};
