"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Profile", href: "/profile", icon: User },
];

const BottomBar = () => {
  const { cart } = useCart();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // ✅ Ensures we only render after client hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.nav
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white shadow-lg z-50 rounded-t-xl overflow-hidden"
    >
      <div className="flex justify-around items-center h-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link key={link.name} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center p-2 text-sm font-medium transition-colors duration-200
                  ${isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"}`}
              >
                <Icon
                  size={24}
                  className="mb-1"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-xs">{link.name}</span>

                {link.name === "Cart" && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-0 right-[-8px] bg-red-600 text-white rounded-full text-[10px] px-1.5 py-[1px] font-bold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomBar;
