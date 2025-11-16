"use client";

import { useMemo } from "react";
import { Image } from "@imagekit/next";
import { CartItem, useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type SelectedVariants = Record<string, string>;

type VariantOption = { value: string; price?: number };
type Variant = { name: string; options?: VariantOption[] };

interface Props {
  item: CartItem;
}

export const CartItemRow = ({ item }: Props) => {
  const { updateQuantity, removeFromCart } = useCart();

  const selectedVariants: SelectedVariants = item.selectedVariantOptions ?? {};

  const effectivePrice = useMemo(() => {
    const base = item.price;
    const variants = (item.variants as Variant[] | undefined) ?? [];
    for (const v of variants) {
      const selected = selectedVariants[v.name];
      const opt = v.options?.find((o) => o.value === selected);
      if (opt?.price !== undefined) return opt.price;
    }
    return base;
  }, [item.price, item.variants, selectedVariants]);

  const subtotal = effectivePrice * item.quantity;

  const handleDecrement = () =>
    updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.selectedVariantOptions);

  const handleIncrement = () =>
    updateQuantity(item.productId, item.quantity + 1, item.selectedVariantOptions);

  const handleRemove = () =>
    removeFromCart(item.productId, item.selectedVariantOptions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-black text-white shadow-sm"
    >
      <div className="shrink-0 flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="object-cover w-20 h-20"
          />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-white">{item.name}</h4>

          <div className="text-sm text-white mt-1">
            <strong className="text-white">
              ৳{effectivePrice.toLocaleString()}
            </strong>
            {Object.keys(selectedVariants).length > 0 &&
              Object.keys(selectedVariants).map((key) => (
                <span key={key} className="ml-2 text-white">
                  ({key}: {selectedVariants[key]})
                </span>
              ))}
          </div>

          <div className="text-xs text-white mt-1">
            Subtotal: ৳{subtotal.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 md:mt-0 md:justify-end">
        <motion.button
          onClick={handleDecrement}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Decrease quantity"
          className="p-2 bg-black text-white rounded-full hover:bg-gray-300 transition-colors"
        >
          <Minus size={16} />
        </motion.button>

        <span className="px-3 py-1 border rounded-full min-w-[40px] text-center font-medium text-white">
          {item.quantity}
        </span>

        <motion.button
          onClick={handleIncrement}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Increase quantity"
          className="p-2 bg-black text-white rounded-full hover:bg-orange-300 transition-colors"
        >
          <Plus size={16} />
        </motion.button>

        <motion.button
          onClick={handleRemove}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Remove from cart"
          className="p-2 bg-black text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};
