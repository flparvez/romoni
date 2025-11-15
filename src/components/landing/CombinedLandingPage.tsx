"use client";

import { useEffect } from "react";
import { LandingAddToCart } from "@/hooks/LandingAddToCart";
import { useCart } from "@/hooks/useCart";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaChevronDown, FaArrowRight, FaShieldAlt, FaUndo } from "react-icons/fa";
import { ProductImageSlider } from "./Sliderimage";
import { ReviewSlider } from "./ReviewSLider";
import type { ILandingPageContent } from "@/models/Landing";
import LandingCheckoutPage from "./CheckoutPageLanding";

interface Props {
  pageContent: ILandingPageContent;
}

export default function CombinedLandingPage({ pageContent }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
const { clearCart } = useCart();
const { addProductToCart } = LandingAddToCart();


  const products = pageContent.products || [];
  const section1 = pageContent.sections[0];
  const section2 = pageContent.sections[1];
  const section3 = pageContent.sections[2];

  const product1 = products[0];
  const product2 = products[1];
  const product3 = products[2];

  // Theme Colors
  const primary = pageContent.theme?.primary || "#2563eb";
  const secondary = pageContent.theme?.secondary || "#0ea5e9";
  const accent = pageContent.theme?.accent || "#22c55e";
  const isDark = pageContent.theme?.darkMode || false;

  // CTA Button Component
  const CTA = () => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      onClick={() => document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" })}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-xl"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
    >
      <FaShoppingCart /> {pageContent.ctaText} <FaArrowRight />
    </motion.button>
  );

  // Pick which product should auto-add (usually the first one)
const productToAdd = pageContent.products?.[0];

useEffect(() => {
  if (!productToAdd) return;

  // ✅ Clear old cart
  clearCart();

  // ✅ Add main product auto
  addProductToCart(productToAdd, 1);

}, [productToAdd]);
  return (
    <main className={`overflow-x-hidden ${isDark ? "bg-[#0c0c0d] text-white" : "bg-white text-gray-900"}`}>

      {/* ✅ HERO */}
      <section
        className="px-4 py-16 text-center"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        {pageContent.logoUrl && (
          <img src={pageContent.logoUrl} alt="Logo" className="w-24 h-24 mx-auto rounded-full shadow-xl" />
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold max-w-3xl mx-auto mt-6 leading-tight">
          {pageContent.heroTitle}
        </h1>

        <p className="text-lg md:text-xl opacity-90 mt-2 max-w-2xl mx-auto">
          {pageContent.heroSubtitle}
        </p>

        <div className="mt-6"><CTA /></div>

        {/* ⭐ Trust Badges */}
        <div className="flex justify-center gap-6 mt-8 text-sm font-medium opacity-90">
          <span className="flex items-center gap-2"><FaShieldAlt /> নিরাপদ অর্ডার</span>
          <span className="flex items-center gap-2"><FaUndo /> সহজ রিটার্ন</span>
        </div>
      </section>

      {/* ✅ SECTION 1 — WITH IMAGE LEFT */}
      {section1 && product1 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
              <ProductImageSlider images={product1.images || []} />
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold mb-6">{section1.title}</h2>
              <ul className="space-y-3">
                {section1.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex gap-3 text-lg">
                    <span className="text-green-500 text-xl">✔</span> {bp.text}
                  </li>
                ))}
              </ul>
              <div className="mt-6"><CTA /></div>
            </div>
          </div>
        </section>
      )}

      {/* ✅ OPTIONAL VIDEO (if exists) */}
      {product1?.video && (
        <section className="py-10 px-4 max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${product1.video}`} allowFullScreen />
          </div>
        </section>
      )}

      {/* ✅ SECTION 2 — TEXT ONLY SECTION (NO IMAGE) */}
      {section2 && (
        <section className="py-16 px-4 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{section2.title}</h2>
          <ul className="space-y-3 max-w-3xl mx-auto">
            {section2.bulletPoints.map((bp, i) => (
              <li key={i} className="flex gap-3 text-lg justify-center">
                <span className="text-green-500 text-xl">✔</span> {bp.text}
              </li>
            ))}
          </ul>
          <div className="mt-6"><CTA /></div>
        </section>
      )}

      {/* ✅ REVIEWS SECTION */}
      <section className="py-16 px-4 text-center" style={{ background: isDark ? "#111216" : "#f4f8ff" }}>
        <h2 className="text-3xl font-bold mb-6">কাস্টমার রিভিউ ⭐</h2>
        <ReviewSlider reviews={products.flatMap((p: any) => p.reviews ?? [])} />
        <div className="mt-6"><CTA /></div>
      </section>

      {/* ✅ SECTION 3 — IMAGE RIGHT */}
      {section3 && product3 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{section3.title}</h2>
              <ul className="space-y-3">
                {section3.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex gap-3 text-lg">
                    <span className="text-green-500 text-xl">✔</span> {bp.text}
                  </li>
                ))}
              </ul>
              <div className="mt-6"><CTA /></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
              <ProductImageSlider images={product3.images || []} />
            </motion.div>
          </div>
        </section>
      )}

      {/* ✅ FAQ */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{pageContent.faqTitle}</h2>

        {pageContent.faqData.map((f, i) => (
          <div key={i} className="border rounded-xl overflow-hidden shadow-md mb-3 bg-white/5 backdrop-blur-lg">
            <button
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              className="w-full flex justify-between p-4 font-semibold"
            >
              {f.question}
              <FaChevronDown className={` transition`} />
            </button>

            <AnimatePresence>
              {openFAQ === i && (
                <motion.div  className="p-2 text-sm">
                  {f.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* ✅ PRICE */}
      <section className="py-12 text-center" style={{ background: accent }}>
        <p className="text-3xl font-bold text-white drop-shadow-md">৳{products[0]?.price}</p>
        <p className="text-lg font-medium mt-1 text-white/90">
          {pageContent.isDeliveryChargeFree ? "🚚 ফ্রি ডেলিভারি" : "ডেলিভারি চার্জ প্রযোজ্য"}
        </p>
      </section>

      {/* ✅ CONTACT */}
      <section className="py-16 text-center">
        <p className="text-2xl font-semibold">📞 অর্ডার করতে কল করুন</p>
        <a href={`tel:${pageContent.contactNumber}`} className="text-3xl font-bold text-red-500">
          {pageContent.contactNumber}
        </a>
        <p className="mt-2 opacity-70">{pageContent.workingHours}</p>
      </section>

      {/* ✅ CHECKOUT */}
      <div id="order-form" className="py-10 text-center">
        <LandingCheckoutPage isDeliveryChargeFree={pageContent.isDeliveryChargeFree} products={products} />
      </div>

      {/* ✅ FOOTER */}
      <footer className="py-6 text-center bg-black text-white opacity-90">
        {pageContent.footerText}
      </footer>

      {/* ✅ STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur text-white flex justify-center md:hidden z-50">
        <CTA />
      </div>
    </main>
  );
}
