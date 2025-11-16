"use client";

import { useCart } from "@/hooks/useCart";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItemRow } from "./CartItemRow";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/* ---------------- SHA256 HASH ---------------- */
async function sha256(value: string) {
  if (!value) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };

/* ---------------- TYPES ---------------- */
interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
}

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [deliveryType, setDeliveryType] = useState<
    "dhaka" | "outsideDhaka"
  >("dhaka");

  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const deliveryCharge =
    deliveryType === "dhaka"
      ? deliveryCharges.dhaka
      : deliveryCharges.outsideDhaka;

  const total = subtotal + deliveryCharge;

  const handleFormChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------------- BEGIN CHECKOUT EVENT (NO REF) ---------------- */
  useEffect(() => {
    if (typeof window === "undefined" || cart.length === 0) return;

    const items = cart.map((item) => ({
      item_id: item.productId,
      item_name: item.name,
      item_category: "General",
      price: item.price,
      quantity: item.quantity,
    }));

    const userData = {
      email_address: "",
      phone_number: form.phone || "",
      first_name: form.fullName?.split(" ")[0] || "",
      last_name: form.fullName?.split(" ")[1] || "",
      country: "Bangladesh",
      city: form.city || "",
      postal_code: "",
    };

    // GA4 begin_checkout
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        value: subtotal + deliveryCharge,
        currency: "BDT",
        items,
        user_data: userData,
      },
    });

    // Facebook Pixel InitiateCheckout
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: subtotal + deliveryCharge,
        currency: "BDT",
        content_type: "product",
        contents: items.map((i) => ({
          id: i.item_id,
          quantity: i.quantity,
          item_price: i.price,
        })),
        user_data: {
          ph: form.phone,
          fn: userData.first_name,
          ln: userData.last_name,
          ct: userData.city,
          country: "Bangladesh",
        },
      });
    }
  }, [cart, subtotal, deliveryCharge, form]);

  /* ---------------- ONE-TIME PURCHASE PROTECTION ---------------- */
  const hasPurchasedRef = useRef(false);

  /* ---------------- SUBMIT ORDER ---------------- */
  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address) {
      toast.error("সব ফিল্ড পূরণ করুন!");
      return;
    }

    setLoading(true);

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
          cartItems: cart.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedVariantOptions: item.selectedVariantOptions,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      /* -------- PURCHASE EVENTS (RUN ONLY ONCE) -------- */
      if (!hasPurchasedRef.current) {
        hasPurchasedRef.current = true;

        const firstName = form.fullName.split(" ")[0] || "";
        const lastName = form.fullName.split(" ")[1] || "";

        const hashedUserData = {
          fn: await sha256(firstName),
          ln: await sha256(lastName),
          ph: await sha256(form.phone),
          ct: await sha256(form.city || ""),
          country: await sha256("Bangladesh"),
        };

        const userData = {
          email_address: "",
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

        // Facebook Pixel PURCHASE
        if (window.fbq) {
          window.fbq("track", "Purchase", {
            value: data.order.totalAmount,
            currency: "BDT",
            content_type: "product",
            contents: items.map((i) => ({
              id: i.item_id,
              quantity: i.quantity,
              item_price: i.price,
            })),
            user_data: hashedUserData,
          });
        }
      }

      toast.success("অর্ডার সফল হয়েছে!", { duration: 2000 });
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.message || "অর্ডার ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

// 



useEffect(() => {
  if (typeof window === "undefined" || cart.length === 0) return;

  const total = subtotal + deliveryCharge;

  const userData = {
    email_address: "",
    phone_number: form.phone || "",
    first_name: form.fullName?.split(" ")[0] || "",
    last_name: form.fullName?.split(" ")[1] || "",
    country: "Bangladesh",
    city: form.city || "",
    postal_code: "",
    coupon: "",
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      value: total,
      currency: "BDT",
      items: cart.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: "General",
        price: item.price,
        quantity: item.quantity,
      })),
      user_data: userData,
    },
  });

  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: total,
      currency: "BDT",
      contents: cart.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
      content_type: "product",
      user_data: {
        ph: form.phone,
        fn: userData.first_name,
        ln: userData.last_name,
        ct: userData.city,
        country: "Bangladesh",
      },
    });
  }
}, [cart, subtotal, deliveryCharge, form]);

  /* ---------------- DARK UI ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen w-full bg-[#0B0B0D] text-white py-6 sm:py-10 px-3 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-[#1A1A1E] text-white hover:bg-[#26262A] transition shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight">Checkout</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <motion.div className="lg:col-span-2 bg-[#111215] rounded-2xl p-6 shadow-xl border border-[#1F1F22]">
            <h3 className="text-xl font-bold border-b border-[#222] pb-3">
              📝 অর্ডার কনফার্ম করতে ফর্ম পূরণ করুন
            </h3>

            {/* CART ITEMS */}
            <section className="mt-6 space-y-3">
              {cart.map((i) => (
                <CartItemRow
                  key={i.productId + JSON.stringify(i.selectedVariantOptions)}
                  item={i}
                />
              ))}
            </section>

            {/* Inputs */}
            <section className="mt-6 space-y-4">
              <input
                name="fullName"
                placeholder="আপনার নাম *"
                value={form.fullName}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333] text-white focus:border-blue-500"
              />
              <input
                name="phone"
                placeholder="মোবাইল নম্বর *"
                value={form.phone}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333] text-white focus:border-blue-500"
              />
              <input
                name="address"
                placeholder="ডেলিভারি ঠিকানা *"
                value={form.address}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333] text-white focus:border-blue-500"
              />
            </section>

            {/* Delivery */}
      <section className="mt-6">
  <h4 className="text-lg font-semibold">🚚 ডেলিভারি চার্জ</h4>

  <div className="mt-3 space-y-3">
    <label
      className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border transition ${
        deliveryType === "dhaka"
          ? "border-blue-500 bg-blue-900/20"
          : "border-[#333] bg-[#1A1A1E] hover:border-blue-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="delivery"
          value="dhaka"
          checked={deliveryType === "dhaka"}
          onChange={() => setDeliveryType("dhaka")}
          className="accent-blue-500"
        />
        <span className="font-medium">ঢাকা সিটির ভিতরে - ৳60</span>
      </div>
    </label>

    <label
      className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border transition ${
        deliveryType === "outsideDhaka"
          ? "border-blue-500 bg-blue-900/20"
          : "border-[#333] bg-[#1A1A1E] hover:border-blue-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="delivery"
          value="outsideDhaka"
          checked={deliveryType === "outsideDhaka"}
          onChange={() => setDeliveryType("outsideDhaka")}
          className="accent-blue-500"
        />
        <span className="font-medium">ঢাকা সিটির বাইরে - ৳120</span>
      </div>
    </label>
  </div>
</section>

          </motion.div>

          {/* RIGHT SUMMARY */}
          <motion.div className="bg-[#111215] rounded-2xl p-6 shadow-xl border border-[#1F1F22] h-fit sticky top-24">
            <h3 className="text-2xl font-bold border-b border-[#222] pb-4">
              🧾 Order Summary
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery</span>
                <span>৳{deliveryCharge}</span>
              </div>

              <div className="flex justify-between text-xl font-bold border-t border-[#222] pt-3">
                <span>Total</span>
                <span className="text-green-400">৳{total}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 mb-3 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold shadow-lg hover:opacity-90 transition"
            >
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
