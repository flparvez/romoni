"use client";

import React from "react";
import { motion } from "framer-motion";
import { IIOrder } from "@/types/product";
import { Image } from "@imagekit/next";
import { generateInvoicePdf } from "@/hooks/invoiceGenerator";
import Link from "next/link";
import { CartItem } from "@/hooks/useCart";

const OrderInformationPage = ({ order }: { order: IIOrder }) => {
  if (!order) return null;

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex justify-center mb-4">
          <Image
            width={80}
            height={80}
           src="https://ik.imagekit.io/flparvez/1759429212787-WhatsApp_Image_2025-10-01_at_21.49.56_yjWVss_rM.jpeg"
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          প্যাকেজটি নেয়ার জন্য ধন্যবাদ
        </h1>
        <p className="text-red-600 mt-2 font-medium">
          খুব শীঘ্রই আপনাকে কল করা হবে। অনুগ্রহ করে অপেক্ষা করুন।
        </p>
        <p className="mt-2 text-gray-700 font-semibold">
          আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
        </p>
      </motion.div>

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
          <div className="p-4 space-y-2 text-gray-800">
            <p>
              <span className="font-bold">Name:</span> {order.fullName}
            </p>
            <p>
              <span className="font-bold">Phone:</span> {order.phone}
            </p>
            <p>
              <span className="font-bold">Address:</span> {order.address},{" "}
              {order.city}
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
        <div className="bg-green-600 text-white px-4 py-2 font-semibold">
          Order Items
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: CartItem, i: number) => (
                <tr key={i} className="border-b">
                  <td className=" sm:text-sm text-xs py-2 font-semibold">
                    {item?.product?.name}
                  </td>
                  <td className="px-2 font-semibold py-2 sm:text-sm text-xs text-gray-800 ">
             
                    {item.selectedVariants?.Size ? `Size: ${item.selectedVariants?.Size}` : null}
                    <br />
                    {item.selectedVariants?.Color ? `Color: ${item.selectedVariants?.Color}` : null}
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
                <td className="px-4 py-3">৳{order.deliveryCharge}</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={2} className="px-4 py-3 text-right">
                  Total
                </td>
                <td className="px-4 py-3">৳{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Link href={"https://www.facebook.com/uniquestorebd23/"  } target="_blank" rel="noopener noreferrer"
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

export default OrderInformationPage;
