"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@imagekit/next";
import { CartItem, useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  item: CartItem;
}

export const CartItemRow = ({ item }: Props) => {
  const { updateQuantity, removeFromCart, cart } = useCart();
  const [localPrice, setLocalPrice] = useState(item.price);

  useEffect(() => {
    let newPrice = item.price;
    if (item.variants && item.selectedVariantOptions) {
      for (const variant of item.variants) {
        const selectedOptionValue = item.selectedVariantOptions[variant.name];
        const option = variant.options?.find(opt => opt.value === selectedOptionValue);
        if (option && option.price !== undefined) {
          newPrice = option.price;
          break;
        }
      }
    }
    if (newPrice !== localPrice) {
      setLocalPrice(newPrice);
    }
  }, [item.selectedVariantOptions, item.price, item.variants, localPrice]);

  const subtotal = localPrice * item.quantity;
  const selectedVariants = item.selectedVariantOptions || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
    >
      <div className="shrink-0 flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <p className="text-sm text-gray-600 mt-1">
            <strong className="text-purple-600">৳{localPrice.toLocaleString()}</strong>
            {item.variants && Object.keys(selectedVariants).map(key => (
              <span key={key} className="ml-2 text-gray-500">
                ({key}: {selectedVariants[key]})
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0 md:justify-end">
        <motion.button
          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.selectedVariantOptions)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Minus size={16} />
        </motion.button>
        <span className="px-3 py-1 border rounded-full min-w-[40px] text-center font-medium text-gray-800">
          {item.quantity}
        </span>
        <motion.button
          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariantOptions)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Plus size={16} />
        </motion.button>
        <motion.button
          onClick={() => removeFromCart(item.productId, item.selectedVariantOptions)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};
