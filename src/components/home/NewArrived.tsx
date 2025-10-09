"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { IIProduct } from "@/types/iproduct";
import { Image } from "@imagekit/next";
import { useAddToCart } from "@/hooks/AddToCart";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";

const NewArrived = ({ products }: { products?: IIProduct[] }) => {
  const { addProductToCart } = useAddToCart();

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24; // Show 8 products per page
  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-gray-50 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">No products available.</h2>
      </section>
    );
  }
  // ✅ Pagination Logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <section className="w-full bg-gray-50 py-2 md:py-12">
      <motion.div
        // initial="hidden"
        // whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 bg-gradient-to-b from-white to-sky-200 sm:gap-4 md:gap-6 px-0 sm:px-4 md:px-6"
      >
        {currentProducts.map((product) => (
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
            className="bg-gradient-to-b from-white to-sky-200 rounded-sm overflow-hidden relative border border-gray-200 border-b-amber-400 cursor-pointer transform transition-all flex flex-col group"
          >
            <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}></Link>
            
            {product.discount ? (
              <div className="absolute top-3 left-3 z-20 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discount}% OFF
              </div>
            ) : null}

               {/* Product Image */}
    {/* ✅ Product Image (Official ImageKit Next.js - Full uncropped display) */}
<div className="relative w-full aspect-square overflow-hidden bg-white flex items-center justify-center">
  {product.images?.[0]?.url ? (
    <Image
      alt={product.name}
      src={product.images[0].url}
      fill
      className="object-contain transition-transform duration-300 ease-in-out hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      transformation={[
        {
          width: "600",
          height: "600",
          quality: 90,
          format: "webp",
        },
      ]}
      loading="lazy"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm">
      কোনো ছবি নেই
    </div>
  )}
</div>

            <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 transition-colors duration-300 hover:text-blue-600">
                {product.name}
              </h3>
              
              <div className="mt-2 sm:mt-3">
                <span className="text-lg font-bold text-purple-700">
                  ৳{product?.displayPrice.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-sm text-gray-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mt-1">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addProductToCart(product, 1, {});
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20"
                >
                  <ShoppingCart className="inline-block mr-1 h-4 w-4" />
                  কার্টে যোগ করুন
                </motion.button>
              </div>

           

            </div>
          </motion.div>
        ))}
      </motion.div>


       {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2 sm:space-x-4">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default NewArrived;
