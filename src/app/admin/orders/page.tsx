"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IOrder } from "@/models/Order";
import { toast } from "sonner";
import AllOrderTable from "@/components/admin/AllOrderTable";
import { IIOrder, SITE_URL } from "@/types/product";

const PAGE_SIZE = 12;
const STATUSES = ["ALL", "PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const AllOrders = () => {
  const [orders, setOrders] = useState<IIOrder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ✅ Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/orders/filter${query}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch orders (status ${res.status})`);
      }

      const data = await res.json();


      if (data?.orders) {
        // ✅ Normal case
        setOrders(data.orders);
        setCounts(data.counts || {});
      } else if (Array.isArray(data)) {
        // ✅ In case API only returns array
        setOrders(data);
        const statusCounts: Record<string, number> = { ALL: data.length };
        data.forEach((order: IOrder) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        setCounts(statusCounts);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("❌ Fetch orders error:", error);
      toast.error(`❌ ${error.message || "Failed to load orders"}`);
      setOrders([]);
      setCounts({});
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete order");
      toast.success("✅ Order deleted successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("❌ Delete failed:", error);
      toast.error("❌ Failed to delete order: " + error.message);
    }
  };

  // ✅ Update status handler
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update order status");
      toast.success("✅ Order status updated successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("❌ Status update failed:", error);
      toast.error("❌ Failed to update order status: " + error.message);
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status}
              <span className="ml-1 text-muted-foreground">
                ({counts[status] || 0})
              </span>
            </Button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : paginatedOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found</p>
        ) : (
          <>
            <AllOrderTable
              paginatedOrders={paginatedOrders}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
            />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllOrders;
