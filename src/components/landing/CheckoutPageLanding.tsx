"use client";

import { useCart } from "@/hooks/useCart";
import { LandingAddToCart } from "@/hooks/LandingAddToCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IProduct } from "@/types";

/* ------------------ Tracking Helpers ------------------ */
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

/* -------------------------------------------------------- */

interface Props {
  products: IProduct[];
  isDeliveryChargeFree?: boolean;
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };

export default function LandingCheckoutPage({
  products,
  isDeliveryChargeFree,
}: Props) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { addProductToCart } = LandingAddToCart();

  /* ------------------ SELECTED PRODUCT ------------------ */
  const [selectedProduct, setSelectedProduct] = useState<IProduct>(products[0]);

  /* ------------------ SELECTED VARIANTS ------------------ */
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  /* ------------------ SET DEFAULT VARIANTS ------------------ */
  const loadDefaultVariants = (product: IProduct) => {
    if (!product?.variants || product.variants.length === 0) return {};

    const defaults: Record<string, string> = {};

    product.variants.forEach((v) => {
      if (v.options && v.options.length > 0) {
        defaults[v.name] = v.options[0].value; // first option = default
      }
    });

    return defaults;
  };

  /* ---------------- RESET CART when product changes ---------------- */
  useEffect(() => {
    const defaults = loadDefaultVariants(selectedProduct);

    setSelectedVariants(defaults);

    clearCart();
    addProductToCart(selectedProduct, 1, defaults);
  }, [selectedProduct]);

  /* ---------------- DELIVERY CHARGES ---------------- */
  const [deliveryType, setDeliveryType] =
    useState<"insideDhaka" | "outsideDhaka">("insideDhaka");

  const deliveryCharge = isDeliveryChargeFree
    ? 0
    : deliveryType === "insideDhaka"
    ? deliveryCharges.dhaka
    : deliveryCharges.outsideDhaka;

  /* ---------------- TOTAL CALC ---------------- */
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
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
          paytorider: total,
          cartTotal: subtotal,
          cartItems: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      /* -------- PURCHASE EVENTS (RUN ONLY ONCE) -------- */

        const firstName = form.fullName.split(" ")[0] || "";
        const lastName = form.fullName.split(" ")[1] || "";

      

        const userData = {
          email_address: "contact@romoni.xyz",
          phone_number: form.phone,
          first_name: firstName,
          last_name: lastName,
          country: "Bangladesh",
          city: form.city || "",
          postal_code: "",
        };

        const items = cart.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));

        // GA4 PURCHASE
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: data.order._id,
            value: data.order.totalAmount,
            currency: "BDT",
            shipping: data.order.deliveryCharge,
            tax: 0,
            items,
            user_data: userData, // <-- userData added
          },
        });

      toast.success("অর্ডার সফল হয়েছে!");
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
    } catch {
      toast.error("অর্ডার ব্যর্থ হয়েছে");
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

  /* -------------------- UI -------------------- */

  return (
 <div className="w-full max-w-2xl mx-auto bg-[#0B0B0D] text-white min-h-screen">

  {/* Header */}
  <div className="p-3 bg-[#141416] border-b border-gray-800 text-center fixed w-full max-w-2xl top-0 z-20">
    <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
      অর্ডার কনফার্ম করুন
    </h1>
  </div>

  <div className="pt-12 pb-12 px-2 space-y-6">

    {/* PRODUCT SELECTION */}
    <section>
      <h2 className="text-xs text-gray-400 mb-2 uppercase tracking-wide">প্রোডাক্ট সিলেক্ট করুন</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((p) => (
          <div
            key={p._id}
            onClick={() => setSelectedProduct(p)}
            className={`p-2.5 rounded-xl cursor-pointer border flex gap-3 items-center transition-all ${
              selectedProduct._id === p._id
                ? "border-blue-500 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                : "border-gray-700 bg-[#18181b] hover:border-gray-500 hover:bg-[#1d1d1f]"
            }`}
          >
            <img
              src={p.images?.[0]?.url}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-blue-400 font-bold text-xs">৳{p.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* VARIANTS */}
      {selectedProduct?.variants && (
        <div className="space-y-4 mt-5">
          <h2 className="text-xs text-gray-400 uppercase">ভ্যারিয়েন্ট নির্বাচন করুন</h2>

          {selectedProduct.variants.map((variant) => (
            <div key={variant.name}>
              <p className="mb-2 text-gray-300 text-sm font-medium">{variant.name}</p>

              <div className="flex flex-wrap gap-2">
                {variant.options.map((op) => {
                  const isActive = selectedVariants[variant.name] === op.value;

                  return (
                    <button
                      key={op.value}
                      onClick={() => {
                        const updated = {
                          ...selectedVariants,
                          [variant.name]: op.value,
                        };
                        setSelectedVariants(updated);

                        clearCart();
                        addProductToCart(selectedProduct, 1, updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-600/20 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.25)]"
                          : "border-gray-600 bg-[#1c1c1e] text-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {op.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* FORM */}
    <section className="space-y-4">
      <div>
        <label className="text-sm text-gray-300">আপনার নাম *</label>
        <input
          name="fullName"
          onChange={handleChange}
          className="w-full p-2.5 rounded-lg bg-[#18181b] border border-gray-700 text-white text-sm"
          placeholder="নাম লিখুন"
        />
      </div>

      <div>
        <label className="text-sm text-gray-300">মোবাইল নাম্বার *</label>
        <input
          name="phone"
          onChange={handleChange}
          className="w-full p-2.5 rounded-lg bg-[#18181b] border border-gray-700 text-white text-sm"
          placeholder="01XXXXXXXXX"
        />
      </div>

      <div>
        <label className="text-sm text-gray-300">ঠিকানা *</label>
        <textarea
          name="address"
          rows={2}
          onChange={handleChange}
          className="w-full p-2.5 rounded-lg bg-[#18181b] border border-gray-700 text-white text-sm"
          placeholder="বাড়ি, রোড, এলাকা..."
        ></textarea>
      </div>
    </section>

    {/* DELIVERY */}
    {
      isDeliveryChargeFree ? (
   <section>
      <h2 className="text-xs text-gray-400 mb-2 uppercase tracking-wide">ডেলিভারি মেথড</h2>

      <div className="p-2.5 rounded-xl border bg-green-600/20 border-green-500 text-green-300 text-sm">
        অভিনন্দন! আপনার জন্য ডেলিভারি চার্জ ফ্রি করা হয়েছে।
      </div>
    </section>


      )
      : (
 
    <section>
      <h2 className="text-xs text-gray-400 mb-2 uppercase tracking-wide">ডেলিভারি মেথড</h2>

      <div className="space-y-2">
        {/* Dhaka */}
        <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
          deliveryType === "insideDhaka"
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 bg-[#18181b] hover:border-gray-500"
        }`}>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={deliveryType === "insideDhaka"}
              onChange={() => setDeliveryType("insideDhaka")}
            />
            <span className="text-sm">ঢাকার ভিতরে</span>
          </div>
          <span className="text-sm">৳60</span>
        </label>

        {/* Outside Dhaka */}
        <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
          deliveryType === "outsideDhaka"
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 bg-[#18181b] hover:border-gray-500"
        }`}>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              checked={deliveryType === "outsideDhaka"}
              onChange={() => setDeliveryType("outsideDhaka")}
            />
            <span className="text-sm">ঢাকার বাইরে</span>
          </div>
          <span className="text-sm">৳120</span>
        </label>
      </div>
    </section>
    
      )
    }

    {/* TOTAL */}
    <div className="bg-[#18181b] p-3 rounded-xl border border-gray-700">
      <div className="flex justify-between text-gray-300 text-sm">
        <span>সাবটোটাল</span>
        <span>৳{selectedProduct.price}</span>
      </div>

      <div className="flex justify-between text-gray-300 text-sm mt-1">
        <span>ডেলিভারি</span>
        <span>৳{deliveryCharge}</span>
      </div>

      <div className="h-[1px] bg-gray-700 my-2"></div>

      <div className="flex justify-between text-lg font-bold">
        <span>সর্বমোট</span>
        <span className="text-blue-400">৳{total}</span>
      </div>
    </div>
  </div>

  {/* BOTTOM BUTTON */}
  <div className="p-4 bg-[#0B0B0D] border-t border-gray-800  w-full mx-auto">
    <button
      onClick={handleSubmit}
      className="
        w-full py-3 rounded-xl font-bold text-lg 
        bg-gradient-to-r from-orange-600 to-indigo-600 
        shadow-lg shadow-blue-700/40
        animate-pulse hover:animate-none
        hover:brightness-110 hover:-translate-y-0.5 
        transition-all duration-200
      "
    >
      অর্ডার কনফার্ম করুন - ৳{total}
    </button>
  </div>
</div>

  );
}
