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
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href?: string;
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
      { label: "Create", href: "/admin/products/new" },
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

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-white">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-lg">Admin Panel</span>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg p-4"
          >
            <div className="flex items-center justify-between h-12 border-b mb-4">
              <span className="font-semibold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <SidebarMenu pathname={pathname} />

          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white p-4">
        <div className="h-14 flex items-center font-semibold text-lg border-b mb-4">
          Admin Panel
        </div>

        <SidebarMenu pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav className="space-y-1 text-sm">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href && pathname.startsWith(item.href);
        const isOpen = open === item.label;

        return (
          <div key={item.label}>
            <button
              onClick={() => (item.children ? setOpen(isOpen ? null : item.label) : undefined)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition ${
                isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
              </div>

              {item.children && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {/* CHILDREN */}
            <AnimatePresence>
              {isOpen && item.children && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-8 mt-1 space-y-1"
                >
                  {item.children.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block px-3 py-1 rounded-md ${
                        pathname.startsWith(sub.href)
                          ? "text-primary font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
