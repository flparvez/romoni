"use client";

import { IIProduct, IVariant } from "@/types/iproduct";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface IVariantOption {
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  iname?: string;
  images: { url: string }[];
  price: number;
  variants?: IVariant[];
}

export interface CartItem {
  productId: string;
  name: string;
  iname?: string;
  product?: IProduct;
  image: string;
  price: number;
  quantity: number;
  variants?: IVariant[];
  selectedVariants?: Record<string, string>;
  selectedVariantOptions?: Record<string, string>;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    productId: string,
    selectedVariantOptions?: Record<string, string>
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedVariantOptions?: Record<string, string>
  ) => void;
  selectVariant: (
    productId: string,
    variantName: string,
    optionValue: string
  ) => void;
  clearCart: () => void;
  fromProduct: (
    product: IIProduct,
    quantity?: number,
    selectedVariantOptions?: Record<string, string>
  ) => CartItem;
  total: number;
  getItem: (
    productId: string,
    selectedVariantOptions?: Record<string, string>
  ) => CartItem | undefined;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }
  }, [cart, isInitialized]);

  const calculatePriceWithVariants = useCallback(
    (
      basePrice: number,
      variants?: IVariant[],
      selectedVariantOptions?: Record<string, string>
    ): number => {
      let finalPrice = basePrice;
      let priceFound = false;

      if (variants && selectedVariantOptions) {
        for (const variant of variants) {
          const selectedValue = selectedVariantOptions[variant.name];
          const option = variant.options?.find((opt) => opt.value === selectedValue);

          if (option?.price !== undefined) {
            // Price is overridden by a variant option
            finalPrice = option.price;
            priceFound = true;
            break;
          }
        }
      }

      return finalPrice;
    },
    []
  );

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          JSON.stringify(i.selectedVariantOptions) ===
            JSON.stringify(item.selectedVariantOptions)
      );

      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId &&
          JSON.stringify(i.selectedVariantOptions) ===
            JSON.stringify(item.selectedVariantOptions)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback(
    (
      productId: string,
      selectedVariantOptions?: Record<string, string>
    ) => {
      setCart((prev) =>
        prev.filter(
          (i) =>
            i.productId !== productId ||
            JSON.stringify(i.selectedVariantOptions) !==
              JSON.stringify(selectedVariantOptions || {})
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      selectedVariantOptions?: Record<string, string>
    ) => {
      setCart((prev) =>
        prev.map((i) =>
          i.productId === productId &&
          JSON.stringify(i.selectedVariantOptions) ===
            JSON.stringify(selectedVariantOptions || {})
            ? { ...i, quantity }
            : i
        )
      );
    },
    []
  );

  const selectVariant = useCallback(
    (productId: string, variantName: string, optionValue: string) => {
      setCart((prev) =>
        prev.map((i) => {
          if (i.productId === productId) {
            const updatedSelectedVariants = {
              ...i.selectedVariantOptions,
              [variantName]: optionValue,
            };

            const newPrice = calculatePriceWithVariants(
              i.product?.price || i.price,
              i.variants,
              updatedSelectedVariants
            );

            return {
              ...i,
              price: newPrice,
              selectedVariantOptions: updatedSelectedVariants,
            };
          }
          return i;
        })
      );
    },
    [calculatePriceWithVariants]
  );

  const getItem = useCallback(
    (
      productId: string,
      selectedVariantOptions?: Record<string, string>
    ) => {
      return cart.find(
        (i) =>
          i.productId === productId &&
          JSON.stringify(i.selectedVariantOptions) ===
            JSON.stringify(selectedVariantOptions || {})
      );
    },
    [cart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const fromProduct = useCallback(
    (
      product: IIProduct,
      quantity = 1,
      selectedVariantOptions?: Record<string, string>
    ): CartItem => {
      const itemPrice = calculatePriceWithVariants(
        product.price,
        product.variants,
        selectedVariantOptions
      );

      return {
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: itemPrice,
        quantity,
        variants: product.variants,
        selectedVariants: selectedVariantOptions || {},
        selectedVariantOptions: selectedVariantOptions || {},
      };
    },
    [calculatePriceWithVariants]
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        selectVariant,
        clearCart,
        fromProduct,
        total,
        getItem,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
