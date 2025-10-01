"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Home,
  ChevronDown,
  ChevronRight,
  Layers,
  Tag,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavItem {
  href?: string;
  label: string;
  icon?: React.ElementType;
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { href: "/admin/orders", label: "Manage Orders" },
      { href: "/admin/orders/returns", label: "Returns" },
    ],
  },
  {
    label: "Sale",
    icon: Layers,
    children: [
      { href: "/admin/sale/overview", label: "Overview" },
      { href: "/admin/sale/reports", label: "Reports" },
    ],
  },
  {
    label: "Products",
    icon: Package,
    children: [
      { href: "/admin/products", label: "Manage Products" },
      { href: "/admin/products/bulkprice", label: "BulkPrice" },
      { href: "/admin/products/rprice", label: "Regular Price" },
    ],
  },
  {
    label: "Category",
    icon: Tag,
    children: [
      { href: "/admin/category", label: "Manage Categories" },
      { href: "/admin/category/sub", label: "Sub Categories" },
    ],
  },

  { href: "/admin/accounts", label: "Accounts", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

const isActive = (href?: string): boolean => {
  if (!href) return false;
  if (href === "/admin") return pathname === href;
  return pathname.startsWith(href);
};

  return (
    <>
      {/* --- Topbar (Only for Mobile) --- */}
      <div className="flex items-center justify-between md:hidden border-b px-4 h-[56px] bg-background sticky top-0 z-40">
    
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* --- Sidebar for Both Desktop + Mobile --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg md:hidden"
          >
            <div className="flex h-[56px] items-center justify-between border-b px-4">
              <span className="font-semibold">A1 Romoni</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <SidebarContent
              navItems={navItems}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              isActive={isActive}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- Desktop Sidebar Always Visible --- */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-gradient-to-b from-background to-muted/40">
        <SidebarContent
          navItems={navItems}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
          isActive={isActive}
        />
      </aside>
    </>
  );
}

/* ✅ Sidebar Content */
function SidebarContent({
  navItems,
  openGroups,
  toggleGroup,
  isActive,
}: {
  navItems: NavItem[];
  openGroups: string[];
  toggleGroup: (label: string) => void;
  isActive: (href?: string) => boolean;
}) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map(({ href, label, icon: Icon, children }) => {
        const groupOpen = openGroups.includes(label);

        if (children) {
          return (
            <div key={label}>
              <button
                onClick={() => toggleGroup(label)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  groupOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="h-5 w-5" />}
                  {label}
                </div>
                {groupOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {groupOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                  >
                    {children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <motion.div
            key={label}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              href={href!}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-5 w-5 ${isActive(href) ? "text-primary" : ""}`}
                />
              )}
              {label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
