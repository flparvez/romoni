"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@imagekit/next";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { IIProduct } from "@/types/iproduct";
import { useAddToCart } from "@/hooks/AddToCart";

interface HeroSectionProps {
  Allproducts: IIProduct[];
}

const containerVariants:any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const imageVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

const HeroSection: React.FC<HeroSectionProps> = ({ Allproducts }) => {

  const products = Allproducts?.filter((product) => product.isFeatured || product.isCombo);

  const [current, setCurrent] = useState(0);
  const { addProductToCart } = useAddToCart();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + products.length) % products.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % products.length);

  if (!products || products.length === 0) {
    return null;
  }

  const product = products[current];
  const handleAddToCart = () => addProductToCart(product, 1, {});

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full overflow-hidden bg-gradient-to-r from-gray-500 via-white to-blue-100 py-1 md:py-12"
    >
      <div className="container mx-auto px-1 py-1 lg:flex lg:items-center lg:gap-12 relative">
        <div className="lg:w-1/2 text-center lg:text-left">
          <motion.h1
            key={product._id + "-title"}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-snug"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
          >
            Experience <br />
            <span className="text-blue-600">{product.shortName || product.name}</span>
          </motion.h1>
          <motion.p
            key={product._id + "-desc"}
            className="text-lg text-gray-600 mb-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Upgrade your lifestyle with{" "}
            <span className="font-semibold">{product.name}</span>. Now at{" "}
            <span className="font-bold text-blue-500">A1 Romoni</span>.
          </motion.p>
          <motion.div
            key={product._id + "-buttons"}
            className="flex flex-col sm:flex-row gap-4 sm:justify-start justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
            >
              <ShoppingCart className="inline-block mr-3 h-5 w-5" />
              কার্টে যোগ করুন
            </motion.button>
            <Link
              href={`/product/${product.slug}`}
              className="px-4 py-3 border border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all text-center"
            >
              বিস্তারিত দেখুন
            </Link>
          </motion.div>
        </div>

        <motion.div
          key={product._id + "-image-container"}
          className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-[280px] h-[320px] md:w-[400px] md:h-[450px]">
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={400}
              height={450}
              className="object-contain drop-shadow-2xl rounded-xl"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200 to-blue-400 opacity-20 blur-3xl -z-10"></div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/70 rounded-full shadow hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <button
            onClick={nextSlide}
            className="p-2 bg-white/70 rounded-full shadow hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </motion.section>
  );
};

export default HeroSection;
