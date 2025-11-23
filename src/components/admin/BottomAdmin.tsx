"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  Package,        // For Products
  ShoppingCart,   // For Orders
  Layers,         // For Category
  LayoutDashboard // For Landing/Dashboard
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/admin", icon: Home }, // Updated to /admin base
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Category", href: "/admin/category", icon: Layers },
  { name: "Design", href: "/admin/landing", icon: LayoutDashboard },
];

const BottomBarAdmin = () => {
  const pathname = usePathname();

  return (
    <div className="lg:hidden block pb-safe"> {/* Safe area for iPhone home bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-2xl safe-area-bottom"
      >
        <div className="flex justify-between items-center px-4 h-16 max-w-md mx-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/admin");
            const Icon = link.icon;

            return (
              <Link 
                key={link.name} 
                href={link.href} 
                prefetch={true} // 🔥 Super Fast Pre-loading
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                {/* 🔥 Active Background Sliding Animation */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute -top-3 w-10 h-1 bg-primary rounded-b-full shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {isActive && (
                   <motion.div
                   layoutId="active-nav-bg"
                   className="absolute inset-2 bg-blue-50/50 rounded-xl -z-10"
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
                )}

                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      size={isActive ? 22 : 20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-all duration-300 ${isActive ? "-translate-y-1" : "translate-y-0"}`}
                    />
                    {/* Optional: Add badge for Orders if needed later */}
                    {/* {link.name === "Orders" && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />} */}
                  </div>
                  
                  <span className={`text-[10px] ${isActive ? "opacity-100" : "opacity-70"}`}>
                    {link.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};

export default BottomBarAdmin;