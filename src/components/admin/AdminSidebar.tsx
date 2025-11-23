"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Layers,
  Tag,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, or use basic string concat

// ===== Navigation Data =====
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    children: [
      { label: "Manage Orders", href: "/admin/orders" },
      { label: "Returns", href: "/admin/orders/returns" },
    ],
  },
  {
    label: "Landing Pages",
    href: "/admin/landing",
    icon: Layers,
    children: [
      { label: "Manage Landing", href: "/admin/landing" },
      { label: "Create New", href: "/admin/landing/create" },
    ],
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/create" },
      { label: "Variants", href: "/admin/products/variant" },
    ],
  },
  {
    label: "Categories",
    href: "/admin/category",
    icon: Tag,
    children: [
      { label: "Manage Categories", href: "/admin/category" },
      { label: "Sub Categories", href: "/admin/category/sub" },
    ],
  },
  { label: "Customers", href: "/admin/accounts", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ===== Main Component =====
export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER (Visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between px-4 h-16 border-b bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <span className="font-bold text-xl text-primary">Unique Store</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-gray-100 rounded-md">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* MOBILE OVERLAY & SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarMenu isMobile={true} closeMobile={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (Static) */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b bg-white z-10">
          <span className="font-bold text-xl tracking-tight text-primary">Unique Store BD</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <SidebarMenu />
        </div>

        <div className="p-4 border-t bg-gray-50">
            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </div>
      </aside>
    </>
  );
}

// ===== Menu Logic Component =====
function SidebarMenu({ isMobile, closeMobile }: { isMobile?: boolean, closeMobile?: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  // ✅ Auto-Expand Logic: Automatically opens the dropdown if current page is inside it
  useEffect(() => {
    const activeParent = NAV_ITEMS.find(item => 
        item.children?.some(child => pathname.startsWith(child.href))
    );
    if (activeParent) {
        setExpanded(activeParent.label);
    }
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpanded(prev => prev === label ? null : label);
  };

  return (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const isParentActive = item.href === pathname || item.children?.some(c => pathname.startsWith(c.href));
        const isOpen = expanded === item.label;

        return (
          <div key={item.label}>
            {/* Parent Item */}
            {item.children ? (
               // Dropdown Parent
              <button
                onClick={() => toggleExpand(item.label)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isParentActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", isParentActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700")} />
                  {item.label}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 text-gray-400",
                    isOpen && "rotate-90 text-primary"
                  )}
                />
              </button>
            ) : (
              // Single Link
              <Link
                href={item.href}
                onClick={isMobile ? closeMobile : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  pathname === item.href
                    ? "bg-primary text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-700")} />
                {item.label}
              </Link>
            )}

            {/* Children Dropdown */}
            <AnimatePresence>
              {isOpen && item.children && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pl-10 pr-2 py-1 space-y-1 relative">
                    {/* Vertical Line for Tree View */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-[1.5px] bg-gray-200" />
                    
                    {item.children.map((sub) => {
                       const isChildActive = pathname === sub.href;
                       return (
                        <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={isMobile ? closeMobile : undefined}
                            className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors relative",
                            isChildActive
                                ? "text-primary font-semibold bg-blue-50"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {sub.label}
                        </Link>
                       )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}