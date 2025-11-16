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

/* ---------------- Pixel Helpers ---------------- */
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

/* ---------------- TYPES ---------------- */
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

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [deliveryType, setDeliveryType] = useState<"dhaka" | "outsideDhaka">("dhaka");
  const [loading, setLoading] = useState(false);

  /* ---------------- Values ---------------- */
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

  /* ---------------- ONE-TIME INITIATE CHECKOUT ---------------- */
  const hasInitiatedRef = useRef(false);

  useEffect(() => {
    if (cart.length === 0) return;

    if (hasInitiatedRef.current) return; // prevent double run
    hasInitiatedRef.current = true;

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

        const userData = {
          fn: await sha256(firstName),
          ln: await sha256(lastName),
          ph: await sha256(form.phone),
          ct: await sha256(form.city || ""),
          country: await sha256("Bangladesh"),
        };

        const items = cart.map((i) => ({
          item_id: i.productId,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        }));

        pushDL({
          event: "purchase",
          ecommerce: {
            transaction_id: data.order._id,
            value: data.order.totalAmount,
            currency: "BDT",
            shipping: data.order.deliveryCharge,
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

        fbTrack("Purchase", {
          value: data.order.totalAmount,
          currency: "BDT",
          contents: cart.map((i) => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.price,
          })),
          content_type: "product",
          user_data: userData,
        });
      }

      toast.success("অর্ডার সফল হয়েছে!", { duration: 2000 });

      clearCart();
      router.replace(`/thank-you/${data.order._id}`);

    } catch (err: any) {
      toast.error(err.message || "অর্ডার ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen w-full bg-[#0B0B0D] text-white py-6 sm:py-10 px-3 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center mb-6 gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-[#1A1A1E] hover:bg-[#26262A]"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight">Checkout</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SECTION */}
          <motion.div className="lg:col-span-2 bg-[#111215] rounded-2xl p-6 border border-[#1F1F22]">

            <h3 className="text-xl font-bold border-b border-[#222] pb-3">
              📝 অর্ডার কনফার্ম করতে ফর্ম পূরণ করুন
            </h3>

            <section className="mt-6 space-y-3">
              {cart.map((i) => (
                <CartItemRow
                  key={i.productId + JSON.stringify(i.selectedVariantOptions)}
                  item={i}
                />
              ))}
            </section>

            <section className="mt-6 space-y-4">
              <input
                name="fullName"
                placeholder="আপনার নাম *"
                value={form.fullName}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333]"
              />

              <input
                name="phone"
                placeholder="মোবাইল নম্বর *"
                value={form.phone}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333]"
              />

              <input
                name="address"
                placeholder="ডেলিভারি ঠিকানা *"
                value={form.address}
                onChange={handleFormChange}
                className="w-full p-3 rounded-xl bg-[#1A1A1E] border border-[#333]"
              />
            </section>

            {/* Delivery */}
            <section className="mt-6">
              <h4 className="text-lg font-semibold">🚚 ডেলিভারি চার্জ</h4>

              <div className="mt-3 space-y-3">

                <label
                  className={`flex items-center p-4 rounded-xl border ${
                    deliveryType === "dhaka"
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-[#333] bg-[#1A1A1E]"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="dhaka"
                    checked={deliveryType === "dhaka"}
                    onChange={() => setDeliveryType("dhaka")}
                    className="accent-blue-500 mr-3"
                  />
                  ঢাকা সিটির ভিতরে - ৳60
                </label>

                <label
                  className={`flex items-center p-4 rounded-xl border ${
                    deliveryType === "outsideDhaka"
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-[#333] bg-[#1A1A1E]"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="outsideDhaka"
                    checked={deliveryType === "outsideDhaka"}
                    onChange={() => setDeliveryType("outsideDhaka")}
                    className="accent-blue-500 mr-3"
                  />
                  ঢাকা সিটির বাইরে - ৳120
                </label>

              </div>
            </section>
          </motion.div>

          {/* RIGHT SUMMARY */}
          <motion.div className="bg-[#111215] rounded-2xl p-6 border border-[#1F1F22] sticky top-24">

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
              className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold"
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
