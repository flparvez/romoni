"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { Image } from "@imagekit/next";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Truck,
  BadgeCheck,
  ShieldCheck,
  Flame,
} from "lucide-react";
import Link from "next/link";
import type { IProduct } from "@/types/index";
import { useAddToCart } from "@/hooks/AddToCart";

interface HeroSectionProps {
  Allproducts: IProduct[];
}

const AUTOPLAY_MS = 5000;

const HeroSection: React.FC<HeroSectionProps> = ({ Allproducts }) => {
  // Filter featured/combo products
  const products = useMemo(
    () => (Allproducts ?? []).filter((p) => p.isFeatured || p.isCombo),
    [Allproducts]
  );

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addProductToCart } = useAddToCart();

  useEffect(() => {
    if (!products.length) return;
    const id = setInterval(() => {
      if (!isPaused) {
        setCurrent((prev) => (prev + 1) % products.length);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [products.length, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [products.length]);

  if (!products.length) return null;

  const product = products[current];

  const handleAddToCart = () => addProductToCart(product, 1, {});
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % products.length);

  // Subtle interactive tilt for the image card
  const rotateX = useSpring(0, { stiffness: 160, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 20 });
  const handleTilt = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((rect.height / 2 - y) / (rect.height / 2)) * 8;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    rotateX.set(rx);
    rotateY.set(ry);
  };
  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative isolate w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Aurora gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-100" />
        {/* Floating color orbs */}
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-sky-300 via-blue-200 to-indigo-200 opacity-60 blur-3xl"
          animate={{ x: [0, 25, -15, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-200 via-pink-200 to-rose-200 opacity-60 blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 10, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle radial vignette to focus the center */}
        <div className="absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="container mx-auto px-2 py-2 md:py-20">
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          {/* Left: copy + CTAs */}
          <div className="relative z-10 mx-auto max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm backdrop-blur lg:mb-3">
              <Flame className="h-4 w-4 text-orange-500" />
              Featured Product
            </div>

            <motion.h1
              key={product._id + "-title"}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-3 text-2xl sm:text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl"
            >
              Discover the Future of{" "}
              <span className="relative inline-block bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                {product.shortName || product.name}
                <Sparkles className="absolute -top-4 -right-6 h-5 w-5 text-blue-500 animate-pulse" />
              </span>
            </motion.h1>

            <motion.p
              key={product._id + "-desc-bn"}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-5 text-lg leading-relaxed text-gray-700"
            >
              আপনার দৈনন্দিন জীবনে আনুন এক নতুন ছোঁয়া —{" "}
              <span className="font-semibold text-blue-600">{product.name}</span>।
              এখনই অর্ডার করুন{" "}
              <span className="font-bold text-blue-500">A1 Romoni</span> থেকে
              এবং উপভোগ করুন প্রিমিয়াম মানের অভিজ্ঞতা!
            </motion.p>

            {/* Feature pills */}
            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur">
                <Truck className="h-4 w-4 text-blue-600" /> ফাস্ট ডেলিভারি
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-green-600" /> অরিজিনাল পণ্য
              </li>
              <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> নিশ্চয়তা সহ
              </li>
            </motion.ul>

            {/* CTAs */}
            <motion.div
              key={product._id + "-buttons"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-7 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
            >
              <button
                onClick={handleAddToCart}
                className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 px-6 py-3 text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-700 hover:via-sky-700 hover:to-indigo-700"
              >
                <span className="absolute inset-0 overflow-hidden rounded-2xl">
                  <span className="pointer-events-none absolute left-[-40%] top-0 h-full w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:translate-x-[300%] group-hover:opacity-100" />
                </span>
                <ShoppingCart className="mr-2 h-5 w-5" />
                এখনই কার্টে যোগ করুন
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="inline-flex items-center justify-center rounded-2xl border border-blue-600 bg-white/70 px-5 py-3 text-blue-700 shadow-sm backdrop-blur transition-colors hover:bg-blue-50"
              >
                বিস্তারিত দেখুন
              </Link>
            </motion.div>

            {/* Autoplay progress bar (resets per slide) */}
            <motion.div
              key={product._id + "-progress"}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"
              style={{ opacity: isPaused ? 0.3 : 0.9 }}
            />
          </div>

          {/* Right: Image with 3D tilt, glow, swipe */}
          <AnimatePresence mode="wait">
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto flex w-full max-w-[520px] items-center justify-center"
            >
              {/* Glow ring */}
              <motion.div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-[28px] bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.sky.300),theme(colors.blue.300),theme(colors.indigo.300),theme(colors.sky.300))] opacity-70 blur-2xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />

              {/* Card wrapper with tilt + swipe */}
              <motion.div
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
                style={{ rotateX, rotateY }}
                drag="x"
                dragElastic={0.18}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) nextSlide();
                  if (info.offset.x > 60) prevSlide();
                }}
                className="relative w-[280px] h-[340px] rounded-3xl bg-white/70 p-2 shadow-xl ring-1 ring-white/60 backdrop-blur-md md:h-[520px] md:w-[460px]"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group block h-full w-full overflow-hidden rounded-2xl"
                >
                  {/* Soft BG gradient behind image */}
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0.7 }}
                    animate={{ scale: [1, 1.03, 1], opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-tr from-blue-200/60 to-sky-100/60"
                  />
                  <Image
                    src={product.images?.[0]?.url || ""}
                    alt={product.name}
                    width={1020}
                    height={1040}
                    className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
                    priority
                  />
                  {/* Corner badge */}
                  <div className="absolute left-3 top-3 z-20 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Featured
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="pointer-events-none absolute inset-y-0 left-2 hidden items-center lg:flex">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="pointer-events-auto rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-blue-200 transition-all hover:bg-blue-50"
          >
            <ChevronLeft size={24} className="text-blue-700" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-2 hidden items-center lg:flex">
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="pointer-events-auto rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-blue-200 transition-all hover:bg-blue-50"
          >
            <ChevronRight size={24} className="text-blue-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-10 flex justify-center gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                current === i
                  ? "scale-125 bg-blue-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;