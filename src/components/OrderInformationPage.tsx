"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IOrder, IOrderItem } from "../types/index";
import { Image } from "@imagekit/next";
import { generateInvoicePdf } from "@/hooks/invoiceGenerator";
import Link from "next/link";
import { CartItem } from "@/hooks/useCart";
import { Button } from "./ui/button";

const OrderInorderationPage = ({ order }: { order: IOrder }) => {
  if (!order) return null;
// ✅ Google Tag Manager Data Layer event (Enhanced)
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];

  const userData = {
    email_address: "contact@a1romoni.xyz", // Add if you collect email later
    phone_number: order.phone || "",
    first_name: order.fullName?.split(" ")[0] || "",
    last_name: order.fullName?.split(" ")[1] || "",
    country: "Bangladesh",
    city: order.address?.split(",")[0] || "",
    postal_code: "",
    coupon: "", // Add if using coupons
  };

  window.dataLayer.push({
    event: "purchase",
    order_id: order.orderId,
    ecommerce: {
      transaction_id: order.orderId,
      affiliation: "Uniquestore Checkout",
      value: order.totalAmount,
      currency: "BDT",
      tax: 0,
      shipping: order.deliveryCharge,
      user_data: userData,
      items: order.items.map((item) => ({
        item_id: item.product._id,
        item_name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
}

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center py-4 px-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="flex justify-center mb-1">
          <Image
            width={80}
            height={80}
           src="https://ik.imagekit.io/flparvez/1759429212787-WhatsApp_Image_2025-10-01_at_21.49.56_yjWVss_rM.jpeg"
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          প্যাকেজটি নেয়ার জন্য ধন্যবাদ
        </h1>
        <p className="text-red-600 mt-2 font-bold">
        ২ - ৩ দিনের মধ্যে আপনার অর্ডারটি ডেলিভারি করা হবে ইনশাল্লাহ।
        </p>
        <p className="mt-1 text-lg text-gray-700 font-semibold">
          আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
        </p>      <p className="mt-1 text-black  font-bold">
          আনবক্সিং ভিডিও করবেন অবশ্যই এবং আমাদের ফেসবুক পেজে শেয়ার করুন।
        </p>
      </motion.div>

<Button variant="outline" className="mb-1">
        Order: {order.status}
      </Button>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Billing Address */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden md:col-span-2"
        >
          <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
            Billing Address
          </div>
          <div className="p-4 space-y-2 text-gray-900">
            <p>
              <span className="font-bold">Name:</span> {order.fullName}
            </p>
            <p>
              <span className="font-bold">Phone:</span> {order.phone}
            </p>
            <p>
              <span className="font-bold">Address:</span> {order.address}
            </p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-orange-400 text-white px-4 py-2 font-semibold">
            Summary
          </div>
          <div className="p-4 text-gray-800 space-y-2">
            <p>
              <span className="font-bold">Order no:</span> {order.orderId}
            </p>
            <p>
              <span className="font-bold">Date & Time:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Total:</span> ৳{order.totalAmount}
            </p> 
             {
              order?.paytorider && <p className="font-bold">
              <span className="font-bold">Pay To Rider:</span> ৳{order.paytorider}
            </p>
             }
            <p>
              <span className="font-bold">Payment Type:</span>{" "}
              {order.paymentType}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-xl shadow-sm mt-8 overflow-hidden"
      >
        <div className="bg-green-600 text-white px-4   py-2 font-semibold">
          Order Items
        </div>
        <div className="p-1 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Name</th>
            
                <th className="px-4 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: IOrderItem, i: number) => (
                <tr key={i} className="border-b">
                  {/* image */}
                  <td className="px-1 py-2">
                    <Image
                      width={64}
                      height={64}
                      src={item?.product?.images[0]?.url || ""}
                      alt={item?.product?.name || "Product Image"}
                      className="w-16 h-16 object-cover"
                    />
                  </td>
                  <td className=" sm:text-sm text-xs py-2 font-semibold">
                    {
                   item.selectedVariantOptions? `Size: ${item.selectedVariantOptions?.Size}` : null
                   }
                    <br />
                     
                   {
                   item.selectedVariantOptions? `Color: ${item.selectedVariantOptions?.Color}` : null
                   }
                  </td>
                
                  <td className="px-2 py-3 text-sm font-semibold text-gray-800">
                    ৳{item.price} × {item.quantity}
                  </td>
                </tr>
              ))}
              {/* Totals */}
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right font-bold">
                  Subtotal
                </td>
                <td className="px-4 py-3">৳{order.totalAmount-order.deliveryCharge}</td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right font-bold">
                  Shipping
                </td>
                <td className="px-4 py-3 font-semibold">৳{order.deliveryCharge}</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="px-4 py-3 text-right">
                  Total
                </td>
                <td className="px-4 py-3">৳{order.totalAmount}</td>
              </tr>   
              
              
                <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="px-4 py-2 text-right">
                 {
              order?.paytorider && <p className="font-extrabold text-orange-600">
              <span className="font-bold">Pay To Rider:        </span> ৳{order.paytorider}
            </p>
             }
                </td>
              
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 mb-10">
        <Link href={"https://www.facebook.com/a1ladiesfr/"  } target="_blank" rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
        >
          Continue Shopping
        </Link>
        <button
          onClick={() => generateInvoicePdf(order)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
        >
          📄 Download Invoice
        </button>
      </div>
    </main>
  );
};

export default OrderInorderationPage;
