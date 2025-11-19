"use client";

import { useCart } from "@/hooks/useCart";
import { LandingAddToCart } from "@/hooks/LandingAddToCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IProduct } from "@/types";

/* ----------------------------- DATALAYER HELPERS ----------------------------- */

const pushDL = (event: any) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
};

const fbTrack = (event: string, data: any) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
  }
};

/* ----------------------------------------------------------------------------- */

interface Props {
  products: IProduct[];
  isDeliveryChargeFree?: boolean;
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };

export default function LandingCheckoutPage({
  products,
  isDeliveryChargeFree = false,
}: Props) {

  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { addProductToCart } = LandingAddToCart();

  const [selectedProduct, setSelectedProduct] = useState<IProduct>(products[0]);
  const [deliveryType, setDeliveryType] =
    useState<"insideDhaka" | "outsideDhaka">("insideDhaka");

  /* ---------------- DELIVERY CHARGE ---------------- */
  const deliveryCharge = isDeliveryChargeFree
    ? 0
    : deliveryType === "insideDhaka"
    ? deliveryCharges.dhaka
    : deliveryCharges.outsideDhaka;

  /* ---------------- RESET CART FOR SELECTED PRODUCT ---------------- */
  useEffect(() => {
    clearCart();
    addProductToCart(selectedProduct, 1);
  }, [selectedProduct]);

  /* ---------------- TOTAL CALC ---------------- */
  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const total = subtotal + deliveryCharge;

  /* ---------------- FORM ---------------- */
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------------- SUBMIT ORDER ---------------- */
  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address)
      return toast.error("অনুগ্রহ করে সব তথ্য পূরণ করুন!");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentType: "COD",
          trxId: "",
          deliveryCharge,
          paytorider: total, // COD full
          cartTotal: subtotal,
          cartItems: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      /* ---------------- BUILD PURCHASE ITEMS ---------------- */
      const items = cart.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));

      /* --------------------------- PURCHASE EVENT --------------------------- */

      pushDL({
        event: "purchase",
        ecommerce: {
          value: data.order.totalAmount,
          currency: "BDT",
          transaction_id: data.order._id,
          shipping: data.order.deliveryCharge,
          tax: 0,
          items,
          user_data: {
            phone_number: data.order.phone,
            full_name: data.order.fullName,
            address: data.order.address,
          },
        },
      });

      fbTrack("Purchase", {
        value: data.order.totalAmount,
        currency: "BDT",
        contents: items,
        content_type: "product",
      });

      /* --------------------------------------------------------------------- */

      toast.success("✅ অর্ডার সফল হয়েছে!");
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
    } catch (err: any) {
      toast.error("⚠ অর্ডার ব্যর্থ হয়েছে");
    }
  };

  /* ---------------- BEGIN CHECKOUT EVENT ---------------- */
  useEffect(() => {
    if (cart.length === 0) return;

    const items = cart.map((i) => ({
      item_id: i.productId,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    pushDL({
      event: "begin_checkout",
      ecommerce: {
        value: total,
        currency: "BDT",
        items,
      },
    });

    fbTrack("InitiateCheckout", {
      value: total,
      currency: "BDT",
      contents: items,
      content_type: "product",
    });
  }, []);

  /* ----------------------------- UI ----------------------------- */
/* ----------------------------- UI ----------------------------- */
return (
  <div className="w-full max-w-2xl mx-auto bg-[#0B0B0D] text-white min-h-screen font-sans">
    
    {/* 🏷️ Header */}
    <div className="bg-[#141416] p-4 border-b border-gray-800 sticky top-0 z-10 shadow-xl">
      <h1 className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
         অর্ডার কনফার্ম করুন
      </h1>
    </div>

    <div className="p-1 md:p-6 pb-2 space-y-8">

      {/* 📦 Product Selection (If multiple) */}
      {products.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">প্রোডাক্ট সিলেক্ট করুন</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                onClick={() => setSelectedProduct(p)}
                className={`relative cursor-pointer p-3 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  selectedProduct._id === p._id
                    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "border-gray-800 bg-[#18181b] hover:border-gray-600"
                }`}
              >
                {/* Radio Indicator */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                   selectedProduct._id === p._id ? "border-blue-500 bg-blue-500" : "border-gray-500"
                }`}>
                  {selectedProduct._id === p._id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <img
                  src={p.images?.[0]?.url}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-700"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200 line-clamp-1">{p.name}</p>
                  <p className="text-blue-400 font-bold">৳{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 📝 Customer Form */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">আপনার তথ্য দিন</h2>
        
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">আপনার নাম <span className="text-red-500">*</span></label>
          <input
            name="fullName"
            onChange={handleChange}
            type="text"
            placeholder="সম্পূর্ণ নামটি লিখুন"
            className="w-full bg-[#18181b] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">মোবাইল নাম্বার <span className="text-red-500">*</span></label>
          <input
            name="phone"
            onChange={handleChange}
            type="tel"
            placeholder="01XXXXXXXXX"
            className="w-full bg-[#18181b] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></label>
          <textarea
            name="address"
            onChange={handleChange}
            rows={3}
            placeholder="বাসা নং, রোড নং, এলাকা..."
            className="w-full bg-[#18181b] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
          ></textarea>
        </div>
      </section>

      {/* 🚚 Delivery Options */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">ডেলিভারি মেথড</h2>
        
        {isDeliveryChargeFree ? (
          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             <span className="font-bold">ফ্রি ডেলিভারি অফারটি আপনার জন্য প্রযোজ্য! </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inside Dhaka */}
            <label className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
              deliveryType === "insideDhaka" 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-gray-700 bg-[#18181b] hover:border-gray-600"
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="delivery" 
                  checked={deliveryType === "insideDhaka"}
                  onChange={() => setDeliveryType("insideDhaka")}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="font-medium">ঢাকার ভিতরে</span>
              </div>
              <span className="font-bold text-white">৳60</span>
            </label>

            {/* Outside Dhaka */}
            <label className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
              deliveryType === "outsideDhaka" 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-gray-700 bg-[#18181b] hover:border-gray-600"
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="delivery" 
                  checked={deliveryType === "outsideDhaka"}
                  onChange={() => setDeliveryType("outsideDhaka")}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="font-medium">ঢাকার বাইরে</span>
              </div>
              <span className="font-bold text-white">৳120</span>
            </label>
          </div>
        )}
      </section>

      {/* 🧾 Payment Breakdown (Optional but good for UX) */}
      <div className="bg-[#18181b] p-5 rounded-xl space-y-3 border border-gray-800">
        <div className="flex justify-between text-gray-400">
          <span>সাবটোটাল</span>
          <span>৳{selectedProduct?.price}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>ডেলিভারি চার্জ</span>
          <span>{isDeliveryChargeFree ? "ফ্রি" : `৳${deliveryType === "insideDhaka" ? 60 : 120}`}</span>
        </div>
        <div className="h-[1px] bg-gray-700 my-2"></div>
        <div className="flex justify-between text-xl font-bold text-white">
          <span>সর্বমোট</span>
          <span className="text-blue-400">৳{total}</span>
        </div>
      </div>

    </div>

    {/* ✅ Sticky Bottom Action Bar */}
    <div className=" p-4 bg-[#0B0B0D]/90 backdrop-blur-md border-t border-gray-800 z-50">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleSubmit}
          className="w-full group relative py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            অর্ডার কনফার্ম করুন - ৳{total} 
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </button>
      </div>
    </div>
  </div>
);
}
