"use client";
import React from "react";
import { motion } from "framer-motion";
import { IIProduct } from "@/types/iproduct";
import { Image } from "@imagekit/next";
import { useAddToCart } from "@/hooks/AddToCart";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

const ProductList = ({ products }: { products?: IIProduct[] }) => {
  const { addProductToCart } = useAddToCart();
  const route = useRouter();

  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-gray-50 py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700">
          No products available.
        </h2>
      </section>
    );
  }

  const handleAddToCartAndNavigate = (product: IIProduct) => {
    addProductToCart(product, 1, {});
    route.push("/checkout");
  };

  return (
    <section className="w-full bg-gray-50 py-6 px-2 sm:px-4 md:py-12 lg:px-8">
      <div className="text-center mb-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-gray-700"
        >
          Latest Products
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] sm:gap-4 md:gap-6"
      >
        {products?.map((product) => (
          <Link key={product._id} href={`/product/${product.slug}`}>
            <motion.div
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 15px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.97 }}
              className="bg-white rounded-md overflow-hidden relative cursor-pointer flex flex-col transition-all"
            >
              {/* Discount Badge */}
              {product?.discount ? (
                <div className="absolute top-2 right-2 z-10 bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-md shadow-md">
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
                    className="object-cover transition-transform duration-300 ease-in-out hover:scale-110"
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
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                <div className="mt-2 sm:mt-3">
                  <span className="text-lg font-bold text-purple-700">
                    ৳{product.displayPrice.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                </div>

                {/* Buttons */}
                <div className="mt-3 flex flex-col gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addProductToCart(product, 1, {});
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2 rounded-md shadow hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="inline-block mr-1 h-4 w-4" />
                    কার্টে যোগ করুন
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCartAndNavigate(product);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold py-2 rounded-md shadow hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="inline-block mr-1 h-4 w-4" />
                    এখনই অর্ডার করুন
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
