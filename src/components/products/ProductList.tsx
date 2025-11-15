"use client";
import React from "react";
import { motion } from "framer-motion";

import { Image } from "@imagekit/next";
import { useAddToCart } from "@/hooks/AddToCart";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { IProduct } from "@/types/index";

const ProductList = ({ products }: { products?: IProduct[] }) => {

  const { addProductToCart } = useAddToCart();  

  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-gray-50 py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700">No products available.</h2>
      </section>
    );
  }
  
  // Use a map to store button state for each product
  const [hoveredProduct, setHoveredProduct] = React.useState<string | null>(null);

  return (
    <section className="w-full bg-gray-50 py-2 px-0 mb-1 sm:px-4 md:py-12 lg:px-6">
      <div className="text-center mb-1">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-black "
        >
         Trending Products
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2  sm:grid-cols-3 lg:grid-cols-4 gap-[1px] sm:gap-4 md:gap-4"
      >
        {products?.slice(0, 18).map((product) => (
           
          <motion.div
            key={product._id}
            variants={{
              // hidden: { opacity: 0, scale: 0.95 },
              // visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-sm overflow-hidden relative bg-gradient-to-t from-sky-200 to-green-200  cursor-pointer transform transition-all flex flex-col"
            onHoverStart={() => setHoveredProduct(product._id)}
            onHoverEnd={() => setHoveredProduct(null)}
          >
      <Link  href={`/product/${product.slug}`}>

            {/* Discount Badge */}
            {product?.discount? (
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                -{product.discount}% OFF
              </div>
            ) : null}

       {/* Product Image */}
<div className="relative w-full aspect-square overflow-hidden">
  {product.images?.[0]?.url && (
    <Image
      alt={product.name}
      src={product.images[0].url}
      fill
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      transformation={[
        {
          width: "600",
          height: "600",
          focus: "auto",
          quality: 80,
          
        },
      ]}
      loading="lazy"
      priority={false} // keep false unless it's above the fold hero image
    />
  )}
</div>

            {/* Product Info */}
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

              {/* Add to Cart Button */}
              <div className="mt-4">
                <motion.button
                  onClick={() => addProductToCart(product, 1, {})}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 transform shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <ShoppingCart className="inline-block mr-2 h-4 w-4" />
                  কার্টে যোগ করুন
                </motion.button>
              </div>
            </div>
            </Link>
          </motion.div>
         
        ))}
      </motion.div>

{/*  2nd list */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2  sm:grid-cols-3 lg:grid-cols-4 gap-[1px] sm:gap-4 md:gap-4"
      >
        {products?.slice(19, 32).map((product) => (
                 <Link key={product._id} href={`/product/${product.slug}`}>
          <motion.div
            
            variants={{
              // hidden: { opacity: 0, scale: 0.95 },
              // visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-sm overflow-hidden relative bg-gradient-to-t from-sky-200 to-green-200  cursor-pointer transform transition-all flex flex-col"
            onHoverStart={() => setHoveredProduct(product._id)}
            onHoverEnd={() => setHoveredProduct(null)}
          >
            {/* Discount Badge */}
            {product?.discount? (
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                -{product.discount}% OFF
              </div>
            ) : null}

       {/* Product Image */}
<div className="relative w-full aspect-square overflow-hidden">
  {product.images?.[0]?.url && (
    <Image
      alt={product.name}
      src={product.images[0].url}
      fill
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      transformation={[
        {
          width: "600",
          height: "600",
          focus: "auto",
          quality: 80,
          
        },
      ]}
      loading="lazy"
      priority={false} // keep false unless it's above the fold hero image
    />
  )}
</div>

            {/* Product Info */}
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

              {/* Add to Cart Button */}
              <div className="mt-4">
                <motion.button
                  onClick={() => addProductToCart(product, 1, {})}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 transform shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <ShoppingCart className="inline-block mr-2 h-4 w-4" />
                  কার্টে যোগ করুন
                </motion.button>
              </div>
            </div>
          </motion.div>
          </Link>
        ))}
      </motion.div>



    </section>
  );
};

export default ProductList;