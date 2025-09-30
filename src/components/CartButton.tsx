"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react"; // or any icon you use
import { useCart } from "@/hooks/useCart";


export default function CartButton() {
  const { cart } = useCart();

  // Calculate total items in cart
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href="/cart" className="fixed top-4 right-4 inline-flex items-center">
      <ShoppingCart className="w-6 h-6 text-gray-700" />

      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
