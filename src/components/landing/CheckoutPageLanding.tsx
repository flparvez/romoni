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

  return (
    <div className="max-w-3xl mx-auto p-1 py-2 pb-12 bg-[#0B0B0D] text-white min-h-screen">
      <h1 className="text-center text-3xl font-extrabold mb-6">
        🛍 অর্ডার করুন
      </h1>

      {/* Product Selection */}
      {products.length > 1 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {products.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedProduct(p)}
              className={`p-4 rounded-xl border transition hover:shadow-md ${
                selectedProduct._id === p._id
                  ? "border-blue-500 bg-blue-800/30"
                  : "border-gray-700 bg-[#1A1A1E]"
              }`}
            >
              <img
                src={p.images?.[0]?.url}
                className="w-20 h-20 mx-auto rounded-lg object-cover"
              />
              <p className="mt-2 text-sm font-medium">{p.name}</p>
              <p className="font-bold text-green-400">৳{p.price}</p>
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4 bg-[#111215] p-5 rounded-xl border border-gray-700 shadow-sm">
        <input
          name="fullName"
          onChange={handleChange}
          className="input-dark"
          placeholder="আপনার নাম *"
        />
        <input
          name="phone"
          onChange={handleChange}
          className="input-dark"
          placeholder="মোবাইল নাম্বার *"
        />
        <textarea
          name="address"
          onChange={handleChange}
          className="input-dark h-20"
          placeholder="ডেলিভারি ঠিকানা *"
        ></textarea>

        {!isDeliveryChargeFree && (
          <div>
            <label className="font-medium">🚚 ডেলিভারি</label>
            <div className="flex gap-4 mt-2 text-sm">
              <label className="radio-dark">
                <input
                  type="radio"
                  checked={deliveryType === "insideDhaka"}
                  onChange={() => setDeliveryType("insideDhaka")}
                />
                ঢাকার ভিতরে (৳60)
              </label>
              <label className="radio-dark">
                <input
                  type="radio"
                  checked={deliveryType === "outsideDhaka"}
                  onChange={() => setDeliveryType("outsideDhaka")}
                />
                ঢাকার বাইরে (৳120)
              </label>
            </div>
          </div>
        )}

        {isDeliveryChargeFree && (
          <p className="text-green-400 font-semibold">🚚 ফ্রি ডেলিভারি ✅</p>
        )}
      </div>

      {/* Submit */}
      <div className="bg-[#111215] border-t border-gray-800 p-4 shadow-lg">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-blue-600 to-purple-600"
        >
          ✅ অর্ডার কনফার্ম করুন (৳{total})
        </button>
      </div>

     <style>{`
        .input-dark {
          width: 100%;
          background: #1A1A1E;
          border: 1px solid #3a3a3f;
          padding: 12px;
          border-radius: 10px;
          color: white;
          outline: none;
        }
        .input-dark:focus {
          border-color: #3b82f6;
        }
        .radio-dark {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #ddd;
        }
      `}</style>
    </div>
    
  );
}
