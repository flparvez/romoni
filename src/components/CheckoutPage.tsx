"use client";

import { useCart } from "@/hooks/useCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItemRow } from "./CartItemRow";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { IOrderItem, IProduct } from "@/types/index";

// ---------- Utility: SHA256 hashing for FB Pixel user data ----------
async function sha256(value: string) {
  if (!value) return "";
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Pixel helper functions ----------
function fbTrack(event: string, data: any) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, data);
  }
}

function pushDL(event: any) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  // ---------------------- STATE ----------------------
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [deliveryCharge, setDeliveryCharge] = useState(deliveryCharges.dhaka);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const total = subtotal + deliveryCharge;

  const handleFormChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleDeliveryChange = (e: any) => {
    setDeliveryCharge(
      e.target.value === "insideDhaka"
        ? deliveryCharges.dhaka
        : deliveryCharges.outsideDhaka
    );
  };

  // ---------------------- SUBMIT ORDER ----------------------
  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address)
      return toast.error("সব ফিল্ড পূরণ করুন!");

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
          paytorider: total, // COD full
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

      // ---------- Prepare FB Pixel user_data ----------
      const firstName = form.fullName.split(" ")[0] || "";
      const lastName = form.fullName.split(" ")[1] || "";

      const userData = {
        fn: await sha256(firstName),
        ln: await sha256(lastName),
        ph: await sha256(form.phone),
        ct: await sha256(form.city || ""),
        country: await sha256("Bangladesh"),
      };

      // ---------- PURCHASE EVENT (fires ONLY after success) ----------
      const items = data.items.map((item: IOrderItem) => ({
        item_id: item.product._id,
        item_name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Google Tag Manager purchase
      pushDL({
        event: "purchase",
        ecommerce: {
          transaction_id: data.order._id,
          value: data.totalAmount,
          currency: "BDT",
          shipping: data.deliveryCharge,
          tax: 0,
          items,
          user_data: {
            phone_number: form.phone,
            first_name: firstName,
            last_name: lastName,
            city: form.city,
            country: "Bangladesh",
          },
        },
      });

      // Facebook Pixel purchase
      fbTrack("Purchase", {
        value: data.totalAmount,
        currency: "BDT",
        contents: items.map((i:IOrderItem) => ({
          id: i.product._id,
          quantity: i.quantity,
          item_price: i.price,
        })),
        content_type: "product",
        user_data: userData,
      });

      // -------- END Purchase event --------

      toast.success("অর্ডার সফল হয়েছে!", { duration: 2000 });
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.message || "অর্ডার ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- BEGIN CHECKOUT EVENT ----------------------
  useEffect(() => {
    if (cart.length === 0) return;

    const items = cart.map((item) => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
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

  // ---------------------- UI ----------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-10 px-3 sm:px-6 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white shadow hover:shadow-md text-gray-600 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 space-y-8"
          >
            <h3 className="text-xl font-bold text-gray-900 border-b pb-4">
              📝 অর্ডার কনফার্ম করতে ফর্ম পূরণ করুন
            </h3>

            {/* Customer Info */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">
                👤 আপনার তথ্য
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  placeholder="আপনার নাম*"
                  value={form.fullName}
                  onChange={handleFormChange}
                  className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="phone"
                  placeholder="মোবাইল নাম্বার*"
                  value={form.phone}
                  onChange={handleFormChange}
                  className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                name="address"
                placeholder="ঠিকানা* (জেলা , উপজেলা , গ্রাম)"
                value={form.address}
                onChange={handleFormChange}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </section>

            {/* Delivery Options */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800">
                🚚 ডেলিভারি চার্জ
              </h4>

              <div className="flex flex-col gap-3 mt-2">
                {Object.entries({
                  insideDhaka: deliveryCharges.dhaka,
                  outsideDhaka: deliveryCharges.outsideDhaka,
                }).map(([key, val]) => (
                  <label
                    key={key}
                    className={`flex justify-between items-center border p-4 rounded-xl cursor-pointer ${
                      deliveryCharge === val
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value={key}
                        checked={deliveryCharge === val}
                        onChange={handleDeliveryChange}
                        className="accent-blue-600"
                      />
                      <span className="font-medium text-gray-800">
                        {key === "insideDhaka"
                          ? "ঢাকা সিটির ভিতরে"
                          : "ঢাকা সিটির বাইরে"}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {val} ৳
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Cart Items */}
          <section className="space-y-4">
            {cart.map((item) => (
              <CartItemRow
                key={item.productId + JSON.stringify(item.selectedVariantOptions)}
                item={item}
              />
            ))}
          </section>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 h-fit sticky top-24 space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">
              🧾 Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-bold">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">৳{total}</span>
              </div>
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 mt-4 text-lg font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? "Processing..." : "✅ Confirm Order"}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
