"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "All Products", href: "/admin/products", icon: ShoppingBag },
  { name: "All Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Category", href: "/admin/category", icon: User },
  { name: "Landing", href: "/admin/landing", icon: User },
];

const BottomBarAdmin = () => {

  const pathname = usePathname();



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

      
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomBarAdmin;
