"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

import { toast } from "sonner";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Image } from "@imagekit/next";
import { IProduct } from "@/types";


const useAddToCart = () => ({
  addProductToCart: (product: IProduct) => {
    toast.success(`Added "${product.name}" to cart!`);
  },
});


// --- End of Placeholders ---


const NewArrived = ({ products }: { products?: IProduct[] }) => {
  const { addProductToCart } = useAddToCart();
  

  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-gray-50 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">No products available.</h2>
      </section>
    );
  }
 


  return (
    <section className="w-full bg-gray-50 py-2 md:py-12">
      <motion.div
        viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 bg-gradient-to-b from-white to-sky-200 sm:gap-4 md:gap-6 px-0 sm:px-4 md:px-6"
      >
        {/* ✅ Map over the products for the current page */}
        {products.map((product) => (
          <motion.div
            key={product._id}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{
              scale: 1.05,
              translateY: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-t from-white to-sky-200 rounded-sm overflow-hidden relative border border-gray-200 border-b-amber-400 cursor-pointer transform transition-all flex flex-col group"
          >
            <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}></Link>
            
            {product.discount ? (
              <div className="absolute top-3 left-3 z-20 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discount}% OFF
              </div>
            ) : null}

            <div className="relative w-full aspect-square overflow-hidden">
              {product.images?.[0]?.url && (
                <Image
                  alt={product.name}
                  src={product.images[0].url}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  transformation={[{ width: "600", height: "600", focus: "auto", quality: 80 },
                    {
                              overlay: { 
              type: "text", 
              text: "A1 Romoni", 
              transformation: [
                { fontSize: 15, fontColor: "FF0000" } 
              ] 
            } 
                    }
                  ]}
                  loading="lazy"
                  priority={false}
                
                />
              )}
            </div>
        
            <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 transition-colors duration-300 hover:text-blue-600">
                {product.name}
              </h3>
              
              <div className="mt-2 sm:mt-3">
                <span className="text-lg font-bold text-purple-700">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-sm text-gray-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addProductToCart(product);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
                >
                  <ShoppingCart className="inline-block mr-1 h-3 w-3" />
                  কার্টে যোগ করুন
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

     
    </section>
  );
};

export default NewArrived;
