"use client";

import { useState } from "react";
import type { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";

import { Expand, ChevronLeft, ChevronRight } from "lucide-react";
import { Image } from "@imagekit/next";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { IProductImage } from "@/types";

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
        <p className="text-gray-500">কোনো ছবি পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="relative w-full aspect-square group bg-white overflow-hidden rounded-lg shadow-sm">
        {/* ✅ Main Product Image Slider */}
        <Swiper
          loop={images.length > 1}
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
              <div className="relative w-full h-full flex items-center justify-center bg-white">
                <Image
                  fill
                  src={image.url}
                  alt={image.altText || `Product image ${index + 1}`}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ Discount Badge */}
        {discount ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-3 right-3 z-10 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg"
          >
            {discount}% ছাড়
          </motion.div>
        ) : null}

        {/* ✅ Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* ✅ Fullscreen Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFullscreen(true)}
          className="absolute bottom-3 right-3 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          aria-label="Fullscreen"
        >
          <Expand className="w-5 h-5 text-gray-800" />
        </motion.button>
      </div>

      {/* ✅ Thumbnail Slider */}
      {images.length > 1 && (
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
              <SwiperSlide key={index} className="cursor-pointer rounded-md overflow-hidden">
                <motion.div whileHover={{ scale: 1.05 }} className="relative w-full aspect-square bg-gray-100">
                  <Image
                    fill
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-contain"
                    sizes="100px"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${
                      activeIndex === index ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-gray-300"
                    }`}
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* ✅ Fullscreen Viewer with Swipe Navigation */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
          >
            <Swiper
              initialSlide={activeIndex}
              spaceBetween={20}
              navigation
              modules={[Navigation]}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              className="w-full h-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      fill
                      src={image.url}
                      alt={`Fullscreen image ${index + 1}`}
                      className="object-contain"
                      sizes="100vw"
                      loading="eager"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* ✅ Close Button */}
            <button
              className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-3 hover:bg-black/80 transition z-50"
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSlider;
