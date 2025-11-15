"use client";

import { useCart } from "@/hooks/useCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItemRow } from "./CartItemRow";
import { motion } from "framer-motion";
import { ArrowLeft, Copy } from "lucide-react";
import type { IProduct } from "@/types/index";

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  paymentType: "FULL" | "PARTIAL";
  trxId?: string;
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };

const mobilePaymentInfo = {
  BKASH: { number: "01608257876", logo: "/images/bkash-logo.png" },
};

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();

  
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentType: "PARTIAL",
    trxId: "",
  });

  const [deliveryCharge, setDeliveryCharge] = useState(deliveryCharges.dhaka);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const total = subtotal + deliveryCharge;
  const partialAmount = useMemo(() => (cart[0]?.product as IProduct)?.advanced || 100, [cart]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryCharge(e.target.value === "insideDhaka" ? deliveryCharges.dhaka : deliveryCharges.outsideDhaka);
  };

  const handlePaymentTypeChange = (type: "FULL" | "PARTIAL") => {
    setForm(prev => ({ ...prev, paymentType: type }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mobilePaymentInfo.BKASH.number);
    toast.success("Number copied to clipboard!");
  };

  const validateForm = (): boolean => {
    if (!form.fullName || !form.phone || !form.address) {
      toast.error("সব ফিল্ড পূরণ করুন!");
      return false;
    }
    if (cart.length === 0) {
      toast.error("কার্ট খালি আছে!");
      return false;
    }
    if (!form.trxId) {
      toast.error("Transaction ID প্রয়োজন!");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryCharge,
          paytorider: form.paymentType === "PARTIAL" ? total-partialAmount : 0,
          cartTotal: subtotal,
          cartItems: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            iname: item.iname,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedVariantOptions: item.selectedVariantOptions || {},
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

   



//  end Data Layer event
      toast.success("অর্ডার সফল হয়েছে!");
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "অর্ডার ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };


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
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h2>
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 space-y-8"
      >
        <h3 className="text-xl font-bold text-gray-900 border-b pb-4">
          📝 অর্ডার কনফার্ম করতে ফর্ম পূরণ করুন
        </h3>

      
        {/* Customer Info */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">👤 আপনার তথ্য</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="আপনার নাম*"
              value={form.fullName}
              onChange={handleFormChange}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 w-full"
            />
            <input
              type="text"
              name="phone"
              placeholder="মোবাইল নাম্বার*"
              value={form.phone}
              onChange={handleFormChange}
              className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 w-full"
            />
          </div>
          <input
            type="text"
            name="address"
            placeholder="ঠিকানা* (জেলা , উপজেলা , গ্রাম বা মহল্লা)"
            value={form.address}
            onChange={handleFormChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
          />
        </section>

        {/* Payment Section */}
        <section className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-800">💳 পেমেন্ট ও ডেলিভারি</h4>

          {/* Payment Type */}
          <div className="flex items-center gap-6 flex-wrap">
            {["FULL", "PARTIAL"].map(type => (
              <label
                key={type}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${
                  form.paymentType === type
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-blue-400"
                } transition-all`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value={type}
                  checked={form.paymentType === type}
                  onChange={() => handlePaymentTypeChange(type as "FULL" | "PARTIAL")}
                  className="accent-blue-600"
                />
                {type === "FULL" ? "Full Payment" : "Partial Payment"}
              </label>
            ))}
          </div>

          {/* Payment Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-xl border bg-gray-50 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Bkash Number:</span>
                <p className="text-lg font-bold text-gray-900">{mobilePaymentInfo.BKASH.number}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {form.paymentType === "PARTIAL"
                ? ` অগ্রিম পেমেন্ট: ৳${partialAmount}`
                : `মোট পেমেন্ট: ৳${total}`}
            </p>
            <input
              type="text"
              name="trxId"
              placeholder="আপনার ট্রানজেকশন ID"
              value={form.trxId || ""}
              onChange={handleFormChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          {/* Delivery Options */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800">🚚 ডেলিভারি চার্জ</h4>
            <div className="flex flex-col gap-3">
              {Object.entries({
                insideDhaka: deliveryCharges.dhaka,
                outsideDhaka: deliveryCharges.outsideDhaka,
              }).map(([key, val]) => (
                <label
                  key={key}
                  className={`flex items-center justify-between border p-4 rounded-xl cursor-pointer transition-all ${
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
                    <span className="text-gray-800 font-medium">
                      {key === "insideDhaka" ? "ঢাকা সিটির ভিতরে" : "ঢাকা সিটির বাইরে"}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">{val} ৳</span>
                </label>
              ))}
            </div>
          </div>
        </section>
      </motion.div>

  {/* Cart Items */}
        <section className="space-y-4">
          {cart.map(item => (
            <CartItemRow key={item.productId + JSON.stringify(item.selectedVariantOptions)} item={item} />
          ))}
        </section>

      {/* Right Column - Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 h-fit sticky top-28 space-y-6"
      >
        <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">🧾 Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-lg">
            <p className="text-gray-700">Subtotal</p>
            <p className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-lg">
            <p className="text-gray-700">Delivery</p>
            <p className="font-bold text-gray-900">৳{deliveryCharge.toLocaleString()}</p>
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between text-xl font-semibold text-gray-900">
            <p>Total</p>
            <p className="text-2xl font-extrabold text-green-600">৳{total.toLocaleString()}</p>
          </div>

          {form.paymentType === "PARTIAL" && (
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg">
              <p className="font-semibold text-gray-800">Pay To Rider</p>
              <p className="font-bold text-green-600">৳{total - partialAmount}</p>
            </div>
          )}
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading || cart.length === 0}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 mt-4 mb-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
