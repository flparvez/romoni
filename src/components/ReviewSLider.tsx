"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight, FaCompress, FaExpand, FaTimes } from "react-icons/fa";
import { IProductImage } from "@/models/Product";
import { useEffect, useState } from "react";

export const ReviewSlider = ({ reviews }: { reviews: IProductImage[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const reviewsCount = reviews?.length || 0;
const imageKitLoader = ({ src, width, quality }: any) => {
  return `${src}?tr=w-${width},q-${quality || 80}`;
};
  const nextSlide = () => {
    if (reviewsCount > 0) {
      setCurrentSlide((prev) => (prev + 1) % reviewsCount);
    }
  };

  const prevSlide = () => {
    if (reviewsCount > 0) {
      setCurrentSlide((prev) => (prev - 1 + reviewsCount) % reviewsCount);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Close full screen when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullScreen]);

  // Prevent background scrolling when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  useEffect(() => {
    if (reviewsCount > 1 && !isFullScreen) {
      const interval = setInterval(nextSlide, 1500);
      return () => clearInterval(interval);
    }
  }, [currentSlide, reviewsCount, isFullScreen]);

  if (reviewsCount === 0) {
    return <p className="text-gray-500 text-center py-8">কোনো রিভিউ নেই।</p>;
  }

  return (
    <div className="relative w-full">
      {/* Main Slider */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-900">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {reviews.map((review, i) => (
            <div
              key={review.fileId || review.altText || i}
              className="min-w-full flex-shrink-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.3 }}
                className="relative flex justify-center items-center bg-gray-900 p-2 md:p-4"
              >
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] relative">
                  <Image
                    loader={imageKitLoader}
                    src={review.url}
                    alt={review.altText || "Review"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    className="object-contain cursor-zoom-in"
                    priority={i === 0}
                    onClick={toggleFullScreen}
                  />
                </div>
                
                {/* Expand button for desktop */}
                <button 
                  onClick={toggleFullScreen}
                  className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all hidden md:block"
                  aria-label="Expand image"
                >
                  <FaExpand size={16} />
                </button>
              </motion.div>
            </div>
          ))}
        </div>

        {reviewsCount > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-gray-900 bg-opacity-70 text-white rounded-full transition-all hover:scale-110 z-20"
              aria-label="Previous review"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-gray-900 bg-opacity-70 text-white rounded-full transition-all hover:scale-110 z-20"
              aria-label="Next review"
            >
              <FaArrowRight />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {reviewsCount > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? "bg-white scale-125" : "bg-gray-400"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Screen View */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4"
            onClick={() => setIsFullScreen(false)}
          >
            <button
              className="absolute top-4 right-4 p-3 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 z-30"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen(false);
              }}
              aria-label="Close full screen"
            >
              <FaTimes size={24} />
            </button>

            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
              <div className="relative w-full h-4/5">
                <Image
                  loader={imageKitLoader}
                  src={reviews[currentSlide].url}
                  alt={reviews[currentSlide].altText || "Review"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {reviewsCount > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-30"
                  aria-label="Previous review"
                >
                  <FaArrowLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 z-30"
                  aria-label="Next review"
                >
                  <FaArrowRight size={24} />
                </button>

                {/* Slide counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full z-30">
                  {currentSlide + 1} / {reviewsCount}
                </div>
              </>
            )}

            <button
              className="absolute bottom-4 right-4 p-3 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 z-30 md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen(false);
              }}
              aria-label="Exit full screen"
            >
              <FaCompress size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

