"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@imagekit/next";

const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    selectVariant,
  } = useCart();

  return (
    <div className="w-full bg-gray-50 min-h-screen py-10 px-2 sm:px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
          🛒 Your Shopping Cart
        </h2>

        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-md border"
            >
              <p className="text-lg sm:text-xl font-medium mb-4">
                Your cart is empty.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {/* Cart Items */}
              <div className="md:col-span-2 space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={
                      item.productId + JSON.stringify(item.selectedVariantOptions)
                    }
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 border rounded-lg p-3 bg-white shadow-sm"
                  >
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info + Variants */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {item.name}
                      </h4>
                      <p className="text-purple-600 font-bold text-sm">
                        ৳{item.price.toLocaleString()}
                      </p>

                      {/* Variants */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.variants?.map((variant) => (
                          <select
                            key={variant.name}
                            value={
                              item.selectedVariantOptions?.[variant.name] ||
                              variant.options?.[0]?.value
                            }
                            onChange={(e) =>
                              selectVariant(
                                item.productId,
                                variant.name,
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-blue-500 focus:border-blue-500"
                          >
                            {variant.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.value}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            Math.max(1, item.quantity - 1),
                            item.selectedVariantOptions
                          )
                        }
                        className="p-1.5 rounded-md border hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-gray-800 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedVariantOptions
                          )
                        }
                        className="p-1.5 rounded-md border hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.selectedVariantOptions)
                      }
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="md:col-span-1 bg-white rounded-lg p-5 shadow-md border sticky top-20 h-fit">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">
                  Order Summary
                </h3>
                <div className="flex justify-between items-center mb-3 text-base">
                  <p className="font-medium text-gray-700">Subtotal</p>
                  <p className="font-bold text-gray-900">
                    ৳{total.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Shipping & taxes calculated at checkout.
                </p>

                <Link
                  href="/checkout"
                  className="w-full text-center block px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-md hover:from-purple-700 hover:to-blue-700 transition shadow"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full mt-3 flex items-center justify-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  <Trash2 size={14} /> Clear Cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartPage;
