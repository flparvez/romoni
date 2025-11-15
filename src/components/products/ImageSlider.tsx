"use client";

import { useState } from "react";
import type { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";

import { Expand, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Image } from "@imagekit/next";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/zoom";
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center"
      >
        <p className="text-gray-500 font-medium">No Image Available</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* 🖼️ Main Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full gap-1 bg-gradient-to-b from-white to-sky-100 h-[350px] sm:h-[420px] md:h-[500px] lg:h-[550px] relative"
      >
        {/* Main Image Viewer */}
        <div className="w-4/5 h-full relative group bg-gradient-to-t from-white to-sky-200 rounded-xl overflow-hidden">
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
            modules={[FreeMode, Navigation, Thumbs, Zoom]}
            className="mySwiper2 w-full h-full"
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative w-full h-full flex items-center justify-center bg-white cursor-pointer"
                  onClick={() => setFullscreen(true)}
                >
                  <Image
                    fill
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                    transformation={[
                      {
                        quality: 70,
                        format: "webp",
                        focus: "auto",
                      },
                      // text added for watermarking example, can be removed if not needed
{
      overlay: {
        type: "text",
        text: "A1 Romoni",
        position: {
          focus: "center",
          
        },
        transformation: [
          {
            fontSize: 25,
            fontColor: "FF0000",
            fontFamily: "Arial",
            innerAlignment: "center",
            padding: 80,
            typography: "b",
            radius: 10,
          },
        ],
      },
    },

                  
             {
      overlay: {
        type: "image",
        input:
          "https://ik.imagekit.io/pemifp53t/1758798108980-481999217_122151293954497451_784184120423218190_n__1__2U8VXOFIX.jpg?updatedAt=1758798111309",

    
        position: {
          focus: "top_right",
          x: 80,
          y: 80,
        },

        transformation: [
          {
            width: 80,
            height: 90,
            quality: 70,
            focus: "auto",
            radius: 10,
          },
        ],
      },
    
         
                  }
        


                    ]}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 🔖 Discount Badge */}
          {discount && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 z-30 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-md shadow"
            >
              -{discount}% OFF
            </motion.span>
          )}

          {/* Navigation Arrows */}
          <button className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="w-1/5 h-full">
          <Swiper
            onSwiper={setThumbsSwiper}
            slidesPerView={4}
            direction="vertical"
            spaceBetween={10}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs]}
            className="mySwiperThumbs h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  activeIndex === index ? "border-blue-500 shadow-md" : "border-transparent"
                }`}
              >
                <div className="relative w-full h-full bg-white">
                  <Image
                    fill
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover"
                    sizes="100px"
                    transformation={[
                      {
                        width: "150",
                        height: "150",
                        quality: 70,
                        format: "webp",
                      },
                      {
                                overlay: { 
              type: "text", 
              text: "A1 Romoni", 
              transformation: [
                { fontSize: 5, fontColor: "FF0000" } 
              ] 
            } 
                      }
                    ]}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>

      {/* 🧭 Fullscreen View */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-6xl h-[80vh]">
              <Swiper
                loop={true}
                initialSlide={activeIndex}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                navigation={{
                  prevEl: ".fullscreen-prev",
                  nextEl: ".fullscreen-next",
                }}
                modules={[Navigation, Zoom]}
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
                        transformation={[
                          { width: "1600", height: "1600", quality: 90, format: "webp" },
                        ]}
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* ❌ Close Button */}
              <button
                onClick={() => setFullscreen(false)}
                className="absolute top-4 right-4 z-50 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 transition"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Fullscreen Navigation */}
              <button className="fullscreen-prev absolute left-4 top-1/2 -translate-y-1/2 text-white bg-gradient-to-t from-blue-600 to-blue-700 rounded-full p-3 transition">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="fullscreen-next absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 rounded-full p-3 transition">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎨 Styles */}
      <style jsx global>{`
        .mySwiperThumbs .swiper-slide {
          height: calc(25% - 10px) !important;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        .mySwiperThumbs .swiper-slide-thumb-active {
          opacity: 1;
        }
        .swiper-button-disabled {
          opacity: 0.3 !important;
        }
      `}</style>
    </>
  );
};

export default ImageSlider;
