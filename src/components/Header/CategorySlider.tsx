"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, Autoplay } from "swiper/modules";
import { Image } from "@imagekit/next";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";


import { ICategoryRef } from "@/types/iproduct";

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
];

const CategorySlider = ({categories}: { categories: ICategoryRef[]}) => {


 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto py-4"
    >
    

      <Swiper
        slidesPerView={2}
        spaceBetween={15}
        freeMode={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[FreeMode, Pagination, Autoplay]}
        className="myCategorySwiper pb-10 px-4"
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 40,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 50,
          },
        }}
      >
        {categories?.map((category, index) => (
          <SwiperSlide key={category._id}>
            <Link href={`/category/${category.slug}`} passHref>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className={`relative group flex flex-col items-center justify-center p-2 rounded-xl shadow-lg aspect-square overflow-hidden cursor-pointer 
                  ${colors[index % colors.length]} text-white transition-all duration-300 ease-in-out`}
              >
                {category.images && category.images.length > 0 ? (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-4 rounded-full bg-white/30 flex items-center justify-center overflow-hidden">
                    <Image
                      src={category.images[0].url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100px, 150px"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-4 rounded-full bg-white/30 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m0 0h6m-6 0H4m0 0V7m0 10l3-3m-3 3l3 3m-3-3h3m0 0H7m0 0l-3-3m3 3l-3 3" />
                    </svg>
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-bold text-center mt-2 group-hover:text-white transition-colors duration-300">
                  {category.name}
                </h3>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .myCategorySwiper .swiper-pagination-bullet {
          background-color: #a0aec0;
          opacity: 0.7;
        }
        .myCategorySwiper .swiper-pagination-bullet-active {
          background-color: #3b82f6;
          opacity: 1;
        }
      `}</style>
    </motion.div>
  );
};

export default CategorySlider;
