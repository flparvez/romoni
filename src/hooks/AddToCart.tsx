"use client";

import { IIProduct } from "@/types/iproduct";
import {  useCart } from "./useCart";
import { toast } from "sonner";

/**
 * Hook to simplify adding products to the cart
 */
export const useAddToCart = () => {
  const { addToCart, fromProduct } = useCart();

  /**
   * Add a product to cart
   * @param product - the product object
   * @param quantity - number of items
   * @param selectedVariants - selected variant options { Size: "M", Color: "Red" }
   */
  const addProductToCart = (
    product: IIProduct,
    quantity: number = 1,
    selectedVariants?: Record<string, string>
  ) => {
    const cartItem = fromProduct(product, quantity, selectedVariants);
    addToCart(cartItem);
   
  };

  return { addProductToCart };
};
