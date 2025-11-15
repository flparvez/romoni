"use client";

import { useCart } from "@/hooks/useCart";
import { LandingAddToCart } from "@/hooks/LandingAddToCart";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IProduct } from "@/types";
import { Copy } from "lucide-react";

interface Props {
  products: IProduct[];
  isDeliveryChargeFree?: boolean;
}

const deliveryCharges = { dhaka: 60, outsideDhaka: 120 };
const mobilePaymentInfo = { BKASH: { number: "01608257876" } };

export default function LandingCheckoutPage({ products, isDeliveryChargeFree = false }: Props) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { addProductToCart } = LandingAddToCart();

  const [selectedProduct, setSelectedProduct] = useState<IProduct>(products[0]);
  const [deliveryType, setDeliveryType] = useState<"insideDhaka" | "outsideDhaka">("insideDhaka");

  const deliveryCharge = isDeliveryChargeFree ? 0 : deliveryType === "insideDhaka" ? deliveryCharges.dhaka : deliveryCharges.outsideDhaka;

  useEffect(() => {
    clearCart();
    addProductToCart(selectedProduct, 1);
  }, [selectedProduct]);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const total = subtotal + deliveryCharge;
  const partialAmount = selectedProduct.advanced ?? 100;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentType: "PARTIAL",
    trxId: "",
  });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address) return toast.error("অনুগ্রহ করে সব তথ্য পূরণ করুন!");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryCharge,
          paytorider: form.paymentType === "PARTIAL" ? total - partialAmount : 0,
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

      toast.success("✅ অর্ডার সফল হয়েছে!");
      clearCart();
      router.push(`/thank-you/${data.order._id}`);
    } catch (err: any) {
      toast.error("⚠ অর্ডার ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 py-4 pb-12 bg-[#0B0B0D] text-white min-h-screen">
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
              <img src={p.images?.[0]?.url} className="w-20 h-20 mx-auto rounded-lg object-cover" />
              <p className="mt-2 text-sm font-medium">{p.name}</p>
              <p className="font-bold text-green-400">৳{p.price}</p>
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4 bg-[#111215] p-5 rounded-xl border border-gray-700 shadow-sm">
        
        <input name="fullName" onChange={handleChange} className="input-dark" placeholder="আপনার নাম *" />
        <input name="phone" onChange={handleChange} className="input-dark" placeholder="মোবাইল নাম্বার *" />
        <textarea name="address" onChange={handleChange} className="input-dark h-20" placeholder="ডেলিভারি ঠিকানা *"></textarea>

        {/* Delivery */}
        {!isDeliveryChargeFree && (
          <div>
            <label className="font-medium">🚚 ডেলিভারি</label>
            <div className="flex gap-4 mt-2 text-sm">
              <label className="radio-dark">
                <input type="radio" checked={deliveryType === "insideDhaka"} onChange={() => setDeliveryType("insideDhaka")} />
                ঢাকার ভিতরে (৳60)
              </label>
              <label className="radio-dark">
                <input type="radio" checked={deliveryType === "outsideDhaka"} onChange={() => setDeliveryType("outsideDhaka")} />
                ঢাকার বাইরে (৳120)
              </label>
            </div>
          </div>
        )}

        {isDeliveryChargeFree && (
          <p className="text-green-400 font-semibold">🚚 ফ্রি ডেলিভারি ✅</p>
        )}

        {/* Payment */}
        <div className="space-y-2">
          <label className="font-medium">💳 পেমেন্ট</label>
          <select name="paymentType" onChange={handleChange} className="input-dark">
            <option value="PARTIAL">অগ্রিম (Partial)</option>
            <option value="FULL">পূর্ণ টাকা (Full)</option>
          </select>

          <p className="text-sm">
            বিকাশ নাম্বার: {mobilePaymentInfo.BKASH.number}
            <button className="ml-2 text-blue-400" onClick={() => navigator.clipboard.writeText(mobilePaymentInfo.BKASH.number)}>
              <Copy size={14}/>
            </button>
          </p>

          <input name="trxId" onChange={handleChange} className="input-dark" placeholder="ট্রানজেকশন আইডি *" />
        </div>
      </div>

      {/* Sticky Order Button */}
      <div className="  bg-[#111215] border-t border-gray-800 p-4 shadow-lg">
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
