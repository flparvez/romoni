"use client";

import { useCart } from "@/hooks/useCart";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CartItemRow } from "./CartItemRow";
import { motion } from "framer-motion";
import { ArrowLeft, Copy } from "lucide-react";
import { IIProduct } from "@/types/iproduct";

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  paymentType: "COD" | "FullPayment";
  trxId?: string;
}

// ✅ Changed delivery charges to Ctg
const deliveryCharges = { ctg: 60, outsideCtg: 100 };

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
    // ✅ Default payment type is now COD
    paymentType: "COD",
    trxId: "",
  });

  // ✅ Default delivery charge is now for Ctg
  const [deliveryCharge, setDeliveryCharge] = useState(deliveryCharges.ctg);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const total = subtotal + deliveryCharge;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ Updated to check for insideCtg
    setDeliveryCharge(e.target.value === "insideCtg" ? deliveryCharges.ctg : deliveryCharges.outsideCtg);
  };

  const handlePaymentTypeChange = (type: "COD" | "FullPayment") => {
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
    // ✅ TrxID is now only required for FullPayment
    if (form.paymentType === "FullPayment" && !form.trxId) {
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
          // ✅ Updated paytorider logic for COD
          paytorider: form.paymentType === "COD" ? total : 0,
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

      toast.success("অর্ডার সফল হয়েছে!");
      clearCart();
      router.push(`/orders/${data.order._id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "অর্ডার ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden py-2"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-6">
        <div className="flex items-center mb-1">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-blue-600 transition-colors mr-4">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900">Checkout</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 w-full"
          >
            <h3 className="text-lg font-bold text-gray-800 border-b pb-4">
              অর্ডার কনফার্ম করতে ফর্ম পূরণ করুন
            </h3>

            <section className="space-y-4 overflow-x-hidden">
              {cart.map(item => (
                <CartItemRow key={item.productId + JSON.stringify(item.selectedVariantOptions)} item={item} />
              ))}
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="fullName" placeholder="আপনার নাম*" value={form.fullName} onChange={handleFormChange} className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                <input type="text" name="phone" placeholder="মোবাইল নাম্বার*" value={form.phone} onChange={handleFormChange} className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
              </div>
              <input type="text" name="address" placeholder="ঠিকানা*" value={form.address} onChange={handleFormChange} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </section>

            <section className="space-y-4 pt-2">
              <h4 className="font-semibold text-lg text-gray-800">পেমেন্ট এবং ডেলিভারি</h4>

              {/* ✅ Updated payment options */}
              <div className="flex items-center gap-4 flex-wrap">
                {["COD", "FullPayment"].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="radio" name="paymentType" value={type} checked={form.paymentType === type} onChange={() => handlePaymentTypeChange(type as "COD" | "FullPayment")} className="text-blue-600 focus:ring-blue-500" />
                    {type === "COD" ? "Cash on Delivery" : "Full Payment"}
                  </label>
                ))}
              </div>

              {/* ✅ Payment Info Box now appears CONDITIONALLY */}
              {form.paymentType === "FullPayment" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 border rounded-xl p-4 bg-gray-50 w-full overflow-hidden"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">Bkash Number:</span>
                      <p className="text-lg font-bold text-gray-900">{mobilePaymentInfo.BKASH.number}</p>
                    </div>
                    <button onClick={copyToClipboard} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"> <Copy size={16} /> </button>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Pay Need: ৳{total}</p>
                  <input type="text" name="trxId" placeholder="আপনার ট্রানজেকশন ID" value={form.trxId || ""} onChange={handleFormChange} className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </motion.div>
              )}

              {/* ✅ Delivery Charges updated to Ctg */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-gray-800">ডেলিভারি চার্জ</h4>
                <div className="flex flex-col gap-2 w-full">
                  {Object.entries({ insideCtg: deliveryCharges.ctg, outsideCtg: deliveryCharges.outsideCtg }).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-3 border p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <input type="radio" name="delivery" value={key} defaultChecked={key === "insideCtg"} onChange={handleDeliveryChange} className="text-blue-600 focus:ring-blue-500" />
                      <span>{key === "insideCtg" ? "Inside Ctg" : "Outside Ctg"}: <span className="font-bold">{val} ৳</span></span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit sticky top-24 w-full"
          >
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-medium"> <p className="text-gray-700">Subtotal</p> <p className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</p> </div>
              <div className="flex justify-between text-lg font-medium"> <p className="text-gray-700">Delivery Charge</p> <p className="font-bold text-gray-900">৳{deliveryCharge.toLocaleString()}</p> </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center"> <p className="text-xl font-bold text-gray-800">Total</p> <p className="text-2xl font-extrabold text-green-600">৳{total.toLocaleString()}</p> </div>
              {/* ✅ "Pay To Rider" section updated for COD */}
              {form.paymentType === "COD" && (
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <p className="text-xl font-bold text-gray-800">Pay To Rider</p>
                  <p className="text-xl font-extrabold text-green-600">৳{total.toLocaleString()}</p>
                </div>
              )}
            </div>
            <motion.button onClick={handleSubmit} disabled={loading || cart.length === 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4 mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Processing..." : "Confirm Order"}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;