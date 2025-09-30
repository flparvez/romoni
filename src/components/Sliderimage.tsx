"use client";

import { useState, useRef, useEffect } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@imagekit/next";

interface ProductImageSliderProps {
  images: { url: string }[];
  altText: string;
  autoPlay?: boolean; // optional
  interval?: number; // optional interval in ms
}

export const ProductImageSlider = ({
  images,
  altText,
  autoPlay = true,
  interval = 3000,
}: ProductImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 80;
    if (info.offset.x < -threshold) nextImage();
    if (info.offset.x > threshold) prevImage();
  };

  const goToImage = (index: number) => setCurrentIndex(index);

  // ✅ Auto slide effect
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const timer = setInterval(nextImage, interval);
    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Image */}
      <motion.div
        ref={sliderRef}
        className="relative overflow-hidden rounded-2xl border"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="aspect-[4/3] relative"
          >
            <Image
              src={images[currentIndex].url}
              alt={`${altText} - ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="rounded-2xl object-contain"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
              aria-label="Next"
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
      </motion.div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex
                  ? "bg-red-600 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              } transition`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile hint */}
      {images.length > 1 && (
        <p className="text-center text-xs text-gray-500 mt-2 md:hidden">
          Swipe to change
        </p>
      )}
    </div>
  );
};
