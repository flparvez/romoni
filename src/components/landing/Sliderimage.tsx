"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import { Image } from "@imagekit/next";

interface ProductImageSliderProps {
  images: { url: string }[];
  altText?: string;
  autoPlay?: boolean;
  interval?: number;
}

export const ProductImageSlider = ({
  images,
  altText = "Product Image",
  autoPlay = true,
  interval = 3000,
}: ProductImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images]);

  const prevImage = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images]);

  // Auto slide
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(nextImage, interval);
    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval, images.length, nextImage]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto">

      {/* Main Image with Zoom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45 }}
          className="aspect-[4/3] relative overflow-hidden rounded-2xl border shadow-md"
        >
          <Zoom>
            <Image
   src={images[currentIndex].url} 
              alt={`${altText} ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain rounded-2xl cursor-zoom-in"
            />
          </Zoom>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

   
    </div>
  );
};
