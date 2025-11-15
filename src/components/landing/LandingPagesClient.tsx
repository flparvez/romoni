"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, Plus, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LandingPagesClient({ pages: initialPages }: { pages: any[] }) {
  const [pages, setPages] = useState(initialPages);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/landing/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setPages((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success("✅ Deleted successfully");
    } catch {
      toast.error("❌ Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Landing Pages</h1>
        <Link
          href="/admin/landing/create"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          <Plus size={18} className="inline-block mr-1" /> New Page
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <motion.div
            key={page._id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={page.heroBanner || "/placeholder.jpg"}
              alt=""
              className="w-full h-40 object-cover bg-gray-200"
            />

            <div className="p-4">
              <p className="text-lg font-semibold line-clamp-1">{page.heroTitle || "No Title"}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{page.heroSubtitle || "No subtitle"}</p>
            </div>

            <div className="flex justify-between items-center p-3 border-t bg-gray-50 text-sm">
              <Link href={`/landing/${page._id}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <Eye size={18} /> View
              </Link>

              <Link href={`/admin/landing/edit/${page._id}`} className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700">
                <Edit size={18} /> Edit
              </Link>

              <button
                onClick={() => setDeleteId(page._id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center"
            >
              <XCircle className="text-red-600 mx-auto mb-3" size={48} />
              <p className="text-lg font-semibold mb-1">Delete This Landing Page?</p>
              <p className="text-gray-600 text-sm mb-5">This action cannot be undone.</p>

              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
