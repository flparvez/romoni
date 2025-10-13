"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { IIProduct } from "@/types/iproduct";
import { Image } from "@imagekit/next";
import { useAddToCart } from "@/hooks/AddToCart";
import Link from "next/link";
import { ShoppingCart, Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProductCardUI({ product }: { product: IIProduct }) {
  const router = useRouter();
  const { addProductToCart } = useAddToCart();
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOrderNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToCart(product, 1, {});
    router.push("/checkout");
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await addProductToCart(product, 1, {});
      setAdded(true);
      toast.success((product.shortName || product.name) + " added to cart!");
      setTimeout(() => setAdded(false), 1200);
    });
  };

  // Price helpers (keeps your existing fields working)
  const price = product.price;

  return (
    <motion.article
      key={product._id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="
        group relative flex h-full flex-col bg-white
       
      "
    >
      {/* Make entire tile clickable */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-[5]"
        aria-label={`View ${product.name}`}
        prefetch
      />

      {/* Badges */}
      {product.discount ? (
        <div className="absolute left-2 top-2 z-20 rounded-full bg-gradient-to-br from-red-600 to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          -{product.discount}% OFF
        </div>
      ) : null}
      {(product.isFeatured || product.isCombo) && (
        <div className="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          Hot
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-white">
        {product.images?.[0]?.url ? (
          <>
            <Image
              alt={product.name}
              src={product.images[0].url}
              fill
              className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              transformation={[
                { width: "900", height: "900", quality: 90, format: "webp" },
              ]}
              loading="lazy"
            />
            {/* soft halo */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-100/50 to-sky-100/50 opacity-60 blur-2xl" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
            কোনো ছবি নেই
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-1 pb-2 pt-2 text-center">
        <h3 className="line-clamp-2  text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
          {product.shortName || product.name}
        </h3>

        {/* Price row */}
        <div className="mt-1.5 flex items-baseline justify-center gap-2">
        
            <span className="text-base font-bold text-gray-900">
              ৳{Number(price).toLocaleString("en-US")}
            </span>
        
          {product.originalPrice ? (
            <span className="text-xs text-gray-400 line-through">
              ৳{product.originalPrice.toLocaleString("en-US")}
            </span>
          ) : 2300}
        </div>

        {/* Compact CTA row (less width, attractive) */}
        <div className="mt-2 flex items-center justify-center gap-1.5 z-20">
          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isPending}
            aria-busy={isPending}
            className="
              group inline-flex items-center gap-1.5
              rounded-xl
              bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600
              px-2.5 py-1.5 text-[11px] font-semibold text-white
              shadow-sm shadow-blue-600/20
              ring-1 ring-white/20
              transition-all
              hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
              disabled:opacity-70
              z-20
            "
            title="কার্টে যোগ করুন"
          >
            {added ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            <span>{added ? "Added" : isPending ? "Adding…" : "Add"}</span>
            <span className="pointer-events-none relative inline-block overflow-hidden">
              <span className="absolute -left-4 top-0 h-5 w-2 -skew-x-12 bg-white/30 opacity-0 transition-all duration-500 group-hover:left-10 group-hover:opacity-100" />
            </span>
          </button>

          {/* Order now */}
          <button
            onClick={handleOrderNow}
            className="
              inline-flex items-center gap-1.5
              rounded-xl border border-blue-600/60
              bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-blue-700
              shadow-sm backdrop-blur
              transition-colors hover:bg-blue-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
              z-20
            "
            title="অর্ডার করুন"
          >
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            অর্ডার
          </button>
        </div>
      </div>

      {/* Hover outline (no layout shift) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute inset-0 ring-1 ring-blue-200/70" />
      </div>
    </motion.article>
  );
}