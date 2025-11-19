"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  FaShoppingCart, FaChevronDown, FaArrowRight, 
  FaShieldAlt, FaUndo, FaCheckCircle, FaPhoneAlt, FaStar 
} from "react-icons/fa";
import { LandingAddToCart } from "@/hooks/LandingAddToCart";
import { useCart } from "@/hooks/useCart";
import { ProductImageSlider } from "./Sliderimage";
import { ReviewSlider } from "./ReviewSLider";
import LandingCheckoutPage from "./CheckoutPageLanding";
import type { ILandingPageContent } from "@/models/Landing";

interface Props {
  pageContent: ILandingPageContent;
}

// 🎬 Animation Variants (Smooth & Professional)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

export default function CombinedLandingPage({ pageContent }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { clearCart } = useCart();
  const { addProductToCart } = LandingAddToCart();

  const products = pageContent.products || [];
  const section1 = pageContent.sections[0];
  const section2 = pageContent.sections[1];
  const section3 = pageContent.sections[2];

  const product1 = products[0];
  const product3 = products[2];

  // 🎨 Theme Configuration
  const primary = pageContent.theme?.primary || "#2563eb";
  const secondary = pageContent.theme?.secondary || "#0ea5e9";
  const accent = pageContent.theme?.accent || "#f59e0b";
  const isDark = pageContent.theme?.darkMode || false;

  const bgBase = isDark ? "bg-[#050505]" : "bg-gray-50";
  const textBase = isDark ? "text-gray-100" : "text-gray-900";
  const cardBase = isDark ? "bg-[#151515] border-gray-800" : "bg-white border-gray-100";
  const mutedText = isDark ? "text-gray-400" : "text-gray-600";

  // 🛒 Auto Add to Cart
  const productToAdd = pageContent.products?.[0];
  useEffect(() => {
    if (!productToAdd) return;
    clearCart();
    addProductToCart(productToAdd, 1);
  }, [productToAdd]);

  // ✨ Scroll Function
  const scrollToOrder = () => {
    const element = document.getElementById("order-form");
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // 🔥 Premium Pulsing CTA Button
  const CTA = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0px 15px 35px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.95 }}
      onClick={scrollToOrder}
      className={`
        relative overflow-hidden group
        ${fullWidth ? "w-full" : "w-auto"}
        px-8 py-4 rounded-full font-bold text-white text-lg shadow-xl
        flex items-center justify-center gap-3 z-10
      `}
      style={{ 
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-150 transition-transform duration-700 rounded-full opacity-0 group-hover:opacity-100" />
      <FaShoppingCart className="text-xl animate-bounce" /> 
      {pageContent.ctaText} 
      <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
    </motion.button>
  );

  return (
    <main className={`overflow-x-hidden min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 ${bgBase} ${textBase}`}>
      
      {/* 🚀 HERO SECTION - Immersive & Animated */}
      <section className="relative pt-12 pb-12 overflow-hidden">
        {/* Animated Background Gradient Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ background: primary }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 animate-pulse delay-1000" style={{ background: secondary }} />

        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          {pageContent.logoUrl && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="inline-block"
            >
              <img 
                src={pageContent.logoUrl} 
                alt="Brand Logo" 
                className="w-28 h-28 mx-auto rounded-full shadow-2xl border-4 border-white/50 mb-8 object-cover backdrop-blur-sm"
              />
            </motion.div>
          )}

          <motion.h1 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
          >
            <span className="bg-clip-text text-orange-500 bg-gradient-to-r from-current to-gray-500">
              {pageContent.heroTitle}
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-2xl mt-6 max-w-3xl mx-auto leading-relaxed ${mutedText}`}
          >
            {pageContent.heroSubtitle}
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-8"
          >
            <CTA />
            
            {/* Glassmorphism Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: FaShieldAlt, text: "১০০% জেনুইন" },
                { icon: FaUndo, text: "৭ দিনের রিটার্ন" },
                { icon: FaCheckCircle, text: "ক্যাশ অন ডেলিভারি" }
              ].map((badge, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border ${cardBase} backdrop-blur-md shadow-lg bg-opacity-60`}
                >
                  <badge.icon style={{ color: accent }} className="text-lg" />
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🎥 VIDEO SECTION - Floating Cinema Look */}
      {pageContent?.videoUrl && (
        <section className="py-4 px-4 relative z-20 mt-2">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/20 bg-black"
          >
            <div className="relative aspect-video">
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${pageContent.videoUrl}?rel=0&modestbranding=1`} 
                allowFullScreen 
                title="Product Video"
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* 📦 SECTION 1: Highlight */}
      {section1 && product1 && (
        <section className="py-12 px-2 overflow-hidden">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Decor Blob */}
              <div className={`absolute top-10 left-10 w-full h-full rounded-full bg-gradient-to-tr from-${primary} to-purple-500 blur-[80px] opacity-20 -z-10`} />
              <ProductImageSlider images={product1.images || []} />
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {section1.title}
              </motion.h2>
              <motion.div variants={fadeInUp} className="w-20 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 mb-2" />
              
              <ul className="space-y-5 mb-10">
                {section1.bulletPoints.map((bp, i) => (
                  <motion.li variants={fadeInUp} key={i} className="flex items-start gap-4 text-lg group">
                    <span className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full ${isDark ? "bg-blue-900/30" : "bg-blue-50"} text-blue-500 flex items-center justify-center transition-colors group-hover:bg-blue-500 group-hover:text-white`}>
                      <FaCheckCircle />
                    </span>
                    <span className={`${mutedText} group-hover:text-current transition-colors`}>{bp.text}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.div variants={scaleIn}>
                <CTA />
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ✨ SECTION 2: Grid Features (Glass Cards) */}
{section2 && (
        <section className="py-10 md:py-16 px-4 relative overflow-hidden">
          {/* 🌌 Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            
            {/* 🏷️ Compact Header */}
            <div className="text-center mb-10">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-4xl font-extrabold inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-600 to-gray-100 dark:from-white dark:via-blue-400 dark:to-white"
              >
                {section2.title}
              </motion.h2>
              <div className="h-1 w-20 bg-blue-500 rounded-full mx-auto mt-2 opacity-80" />
            </div>
            
            {/* 📦 Ultra-Compact Grid (Horizontal Cards) */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
            >
              {section2.bulletPoints.map((bp, i) => (
                <motion.div 
                  variants={fadeInUp}
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`
                    group relative p-4 rounded-2xl 
                    ${cardBase} border border-gray-100 dark:border-white/10
                    backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300
                    flex items-center gap-4 overflow-hidden
                  `}
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Box (Compact) */}
                  <div className="relative shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <FaStar />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-sm md:text-base font-bold leading-tight text-white dark:text-gray-200 relative z-10">
                    {bp.text}
                  </h3>

                  {/* Arrow Indicator (Appears on Hover) */}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-500 text-xs">
                    <FaArrowRight />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button (Centered & Compact) */}
            <div className="flex justify-center relative z-20">
              <CTA />
            </div>
          </div>
        </section>
      )}
      {/* 💬 REVIEWS */}
      <section className={`py-24 px-4 ${isDark ? "bg-[#080808]" : "bg-blue-50/50"}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">কাস্টমার রিভিউ</h2>
          <p className={`${mutedText} mb-12`}>আমাদের ৫০০০+ হ্যাপি কাস্টমারদের মতামত</p>
          <ReviewSlider reviews={products.flatMap((p: any) => p.reviews ?? [])} />
        </div>
      </section>

      {/* 📦 SECTION 3: Image Right */}
      {section3 && product3 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
             <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="order-2 md:order-1"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">{section3.title}</h2>
              <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-teal-400 mb-8" />
              
              <ul className="space-y-5 mb-10">
                {section3.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-4 text-lg">
                    <span className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full ${isDark ? "bg-green-900/30" : "bg-green-50"} text-green-500 flex items-center justify-center`}>
                      <FaCheckCircle />
                    </span>
                    <span className={mutedText}>{bp.text}</span>
                  </li>
                ))}
              </ul>
              <CTA />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 relative"
            >
               <div className={`absolute top-10 right-10 w-full h-full rounded-full bg-gradient-to-bl from-${secondary} to-pink-500 blur-[80px] opacity-20 -z-10`} />
              <ProductImageSlider images={product3.images || []} />
            </motion.div>
          </div>
        </section>
      )}

      {/* ❓ FAQ Accordion */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{pageContent.faqTitle}</h2>
          <div className="space-y-4">
            {pageContent.faqData.map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className={`border rounded-2xl overflow-hidden ${cardBase} transition-all duration-300 ${openFAQ === i ? 'shadow-lg ring-1 ring-blue-200' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 font-bold text-left text-lg"
                >
                  {f.question}
                  <FaChevronDown className={`transition-transform duration-300 ${openFAQ === i ? "rotate-180 text-blue-600" : "text-gray-400"}`} />
                </button>
                <AnimatePresence>
                  {openFAQ === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-white/5"
                    >
                      <p className={`p-6 pt-2 leading-relaxed ${mutedText}`}>{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📞 PRICE & CONTACT Banner (Gradient Card) */}
      <section className="py-10 px-4">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="max-w-5xl mx-auto rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden text-white shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${accent}, #ff7e5f)` }}
        >
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <div className="relative z-10">
              <p className="text-xl font-medium tracking-wide uppercase opacity-90 mb-2">Special Offer Price</p>
              <motion.div 
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="text-6xl md:text-8xl font-black mb-6 drop-shadow-md"
              >
                ৳{products[0]?.price}
              </motion.div>
              
              <div className="inline-block px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-10">
                {pageContent.isDeliveryChargeFree ? "🚚 ফ্রি ডেলিভারি" : "ডেলিভারি চার্জ প্রযোজ্য"}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <a href={`tel:${pageContent.contactNumber}`} className="flex items-center gap-3 text-2xl font-bold bg-white text-gray-900 px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform">
                  <FaPhoneAlt className="text-green-600"/>
                  {pageContent.contactNumber}
                </a>
                <button onClick={scrollToOrder} className="flex items-center gap-3 text-2xl font-bold bg-black text-white px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform">
                  অর্ডার করুন <FaArrowRight />
                </button>
              </div>
              <p className="text-sm mt-6 opacity-80">{pageContent.workingHours}</p>
           </div>
        </motion.div>
      </section>

      {/* 📝 CHECKOUT FORM */}
      <div id="order-form" className={`py-4 ${isDark ? "bg-[#050505]" : "bg-white"}`}>
        <div className="max-w-4xl mx-auto px-1">
          <div className={`p-2 md:p-12 rounded-3xl shadow-2xl border ${isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-100"}`}>
             <h3 className="text-3xl font-bold text-center mb-2 border-b pb-6 dark:border-white/10">অর্ডার কনফার্ম করুন</h3>
             <LandingCheckoutPage isDeliveryChargeFree={pageContent.isDeliveryChargeFree} products={products} />
          </div>
        </div>
      </div>

      {/* 🦶 FOOTER */}
      <footer className={`py-10 text-center border-t ${isDark ? "bg-black border-white/10 text-gray-600" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
        <p className="text-sm font-medium">&copy; {new Date().getFullYear()} {pageContent.footerText}</p>
      </footer>

      {/* 📱 MOBILE STICKY BAR */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0   left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 flex md:hidden z-50 items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col">
           <span className="text-xs text-gray-500 uppercase tracking-wider">Total Price</span>
           <span className="text-xl font-black text-blue-600 dark:text-blue-400">৳{products[0]?.price}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.90 }}
          onClick={scrollToOrder}
          className="px-6 py-3 rounded-xl font-bold text-white shadow-lg text-sm flex items-center gap-2"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
        >
          অর্ডার করুন <FaArrowRight />
        </motion.button>
      </motion.div>
    </main>
  );
}