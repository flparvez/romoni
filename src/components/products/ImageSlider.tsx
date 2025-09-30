"use client";

import { useState } from "react";
import type { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { IProductImage } from "@/types/iproduct";
import { Expand, ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@imagekit/next";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ImageSliderProps {
  images: IProductImage[];
  discount?: number;
}

const ImageSlider = ({ images, discount }: ImageSliderProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No Image Available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Main Image Viewer */}
      <div className="relative w-full aspect-square group bg-white overflow-hidden rounded-lg shadow-sm">
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Navigation, Thumbs]}
          className="w-full h-full"
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  fill
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                  priority={index === 0}
                  transformation={[
                    {
                      width: "1000",
                      height: "1000",
                      quality: 80,
                      format: "webp",
                      focus: "auto",
                    },
                  ]}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ Discount Badge */}
        {discount ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-2 right-2 z-30
                       bg-gradient-to-r from-red-600 to-red-700 
                       text-white 
                       text-[10px] sm:text-xs md:text-sm
                       font-bold px-2 py-1
                       rounded-md shadow-md"
          >
            -{discount}% OFF
          </motion.span>
        ) : null}

        {/* Navigation Arrows */}
        <button className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Zoom / Fullscreen Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFullscreen(true)}
          className="absolute bottom-4 right-4 z-20 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Fullscreen"
        >
          <Expand className="w-4 h-4 text-gray-700" />
        </motion.button>

        {/* Counter */}
        <div className="absolute bottom-4 left-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* ✅ Thumbnail Slider (Horizontal for better mobile view) */}
      <div className="mt-3">
        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          spaceBetween={10}
          watchSlidesProgress={true}
          modules={[Thumbs]}
          className="mySwiperThumbs"
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={index}
              className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300"
            >
              <motion.div whileHover={{ scale: 1.05 }} className="relative w-full h-20 bg-gray-100">
                <Image
                  fill
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-contain"
                  sizes="80px"
                  transformation={[
                    { width: "150", height: "150", quality: 70, format: "webp" },
                  ]}
                  loading="lazy"
                />
                {index === activeIndex && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg"
                  />
                )}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ✅ Fullscreen Modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            <div className="relative max-w-5xl max-h-full w-full">
              <Image
                src={images[activeIndex].url}
                alt={`Fullscreen image ${activeIndex + 1}`}
                width={1200}
                height={900}
                className="object-contain rounded-lg w-full h-auto"
                transformation={[
                  { width: "1200", height: "900", quality: 85, format: "webp" },
                ]}
                loading="eager"
              />
              <button
                className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"
                onClick={() => setFullscreen(false)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSlider;
