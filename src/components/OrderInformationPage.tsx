"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IOrder, IOrderItem } from "../types/index";
import { Image } from "@imagekit/next";
import { generateInvoicePdf } from "@/hooks/invoiceGenerator";
import Link from "next/link";

const OrderConfirmationPage = ({ order }: { order: IOrder }) => {
  return (
    <main className="w-full min-h-screen bg-[#0B0C0F] text-white py-4 px-2 sm:px-6 flex flex-col items-center">
      
      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-3">
          <Image
            width={100}
            height={100}
            src="https://ik.imagekit.io/flparvez/1759429212787-WhatsApp_Image_2025-10-01_at_21.49.56_yjWVss_rM.jpeg"
            alt="Logo"
            className="rounded-full w-24 h-24 shadow-[0_0_30px_rgba(0,200,255,0.4)]"
          />
        </div>

        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে
        </h1>
        <p className="mt-3 text-red-400 text-lg font-semibold">
          ২–৩ দিনের মধ্যে আপনার অর্ডারটি ডেলিভারি করা হবে ইনশাল্লাহ।
        </p>
        <p className="mt-1 text-gray-300 text-lg">
          আনবক্সিং ভিডিও করতে ভুলবেন না — আমাদের ফেসবুক পেজে শেয়ার করুন।
        </p>

        <div className="mt-3 inline-block bg-[#1A1D22] text-blue-400 px-4 py-1 rounded-full text-sm border border-blue-700/40">
          Order Status: {order.status}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Billing */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 bg-[#111317] rounded-2xl border border-gray-800 shadow-xl p-2"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-400"> Billing Address</h2>

          <div className="space-y-2 text-gray-300 text-sm">
            <p className="font-semibold"><span className="font-bold text-white">Name:</span> {order.fullName}</p>
            <p className="font-semibold"><span className="font-bold text-white">Phone:</span> {order.phone}</p>
            <p className="font-semibold"><span className="font-bold text-white">Address:</span> {order.address}</p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111317] rounded-2xl border border-gray-800 shadow-xl p-2"
        >
          <h2 className="text-xl font-semibold mb-4 text-purple-400">🧾 Summary</h2>

          <div className="space-y-2 text-gray-300 text-sm">
            <p><span className="font-bold text-white">Order No:</span> {order.orderId}</p>
            <p className="font-semibold" >
              <span className="font-bold text-white">Date:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p><span className="font-bold text-white">Total:</span> ৳{order.totalAmount}</p>

            {order?.paytorider && (
              <p className="font-bold text-orange-400 text-sm">
                Pay To Rider: ৳{order.paytorider}
              </p>
            )}

            <p><span className="font-bold text-white">Payment:</span> {order.paymentType}</p>
          </div>
        </motion.div>
      </div>

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-[#111317] rounded-2xl border border-gray-800 shadow-xl mt-10 overflow-hidden"
      >
        <div className="px-6 py-3 text-lg font-semibold bg-[#0F1A12] text-green-400 border-b border-green-700/40">
          🛍 Order Items
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300 text-sm">
            <thead>
              <tr className="bg-[#1A1D22] text-gray-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item: IOrderItem, i: number) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="px-4 py-3">
                    <Image
                      width={60}
                      height={60}
                      src={item?.product?.images[0]?.url || ""}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-700"
                      alt={item.product?.name || "Product"}
                    />
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <p className="font-semibold text-gray-200">{item.product?.name}</p>
                    {item.selectedVariantOptions?.Size && (
                      <p className="text-xs text-gray-400">
                        Size: {item.selectedVariantOptions.Size}
                      </p>
                    )}
                    {item.selectedVariantOptions?.Color && (
                      <p className="text-xs text-gray-400">
                        Color: {item.selectedVariantOptions.Color}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 font-semibold text-white">
                    ৳{item.price} × {item.quantity}
                  </td>
                </tr>
              ))}

              {/* Totals */}
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-300">
                  Subtotal
                </td>
                <td className="px-4 py-3 text-white">
                  ৳{order.totalAmount - order.deliveryCharge}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-300">
                  Delivery Charge
                </td>
                <td className="px-4 py-3 text-white">৳{order.deliveryCharge}</td>
              </tr>
              <tr className="bg-[#1A1D22] font-extrabold text-white">
                <td colSpan={2} className="px-4 py-3 text-right">
                  Total
                </td>
                <td className="px-4 py-3 text-green-400">৳{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-12">
        <Link
          href="https://www.facebook.com/a1ladiesfr/"
          target="_blank"
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90 text-white shadow-lg shadow-green-800/30 font-semibold"
        >
          Continue Shopping
        </Link>

        <button
          onClick={() => generateInvoicePdf(order)}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white shadow-lg shadow-orange-800/30 font-semibold"
        >
          📄 Download Invoice
        </button>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;
