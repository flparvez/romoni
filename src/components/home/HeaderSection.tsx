"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image } from "@imagekit/next";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { IIProduct } from "@/types/iproduct";
import { useAddToCart } from "@/hooks/AddToCart";

interface HeroSectionProps {
  Allproducts: IIProduct[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ Allproducts }) => {
  const products =
    Allproducts?.filter((product) => product.isFeatured || product.isCombo) || [];

  const [current, setCurrent] = useState(0);
  const { addProductToCart } = useAddToCart();

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % products.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  if (!products || products.length === 0) return null;

  const product = products[current];
  const handleAddToCart = () => addProductToCart(product, 1, {});
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % products.length);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 md:py-16"
    >
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        {/* Left Text Section */}
        <div className="flex-1 text-center lg:text-left">
          <motion.h1
            key={product._id + "-title"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 leading-snug"
          >
            নতুন অভিজ্ঞতায় <br />
            <span className="text-blue-600">
              {product.shortName || product.name}
            </span>
          </motion.h1>

          <motion.p
            key={product._id + "-desc"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 mt-4 md:mt-6"
          >
            আপনার জীবনধারাকে আরও উন্নত করতে এখনই নিয়ে নিন{" "}
            <span className="font-semibold text-gray-800">{product.name}</span>।  
            সেরা দামে অর্ডার করুন <span className="font-bold text-blue-500">A1 Romoni</span> থেকে।
          </motion.p>

          <motion.div
            key={product._id + "-buttons"}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-medium"
            >
              <ShoppingCart className="inline-block mr-2 h-5 w-5" />
              এখনই কার্টে যোগ করুন
            </motion.button>

            <Link
              href={`/product/${product.slug}`}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all text-center font-medium"
            >
              বিস্তারিত দেখুন
            </Link>
          </motion.div>
        </div>

        {/* Right Image Section */}
        <motion.div
          key={product._id + "-image"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex justify-center relative"
        >
          <div className="relative w-[260px] h-[300px] md:w-[400px] md:h-[450px]">
            <Image
              src={product.images?.[0]?.url}
              alt={product.name}
              width={400}
              height={450}
              className="object-contain drop-shadow-2xl rounded-xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-500 opacity-30 blur-3xl -z-10 rounded-full"></div>
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg p-2 transition"
          aria-label="Previous"
        >
          <ChevronLeft size={28} className="text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg p-2 transition"
          aria-label="Next"
        >
          <ChevronRight size={28} className="text-gray-700" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-8 gap-3">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-blue-600 scale-110" : "bg-gray-300"
            }`}
          ></button>
        ))}
      </div>
    </motion.section>
  );
};

export default HeroSection;
