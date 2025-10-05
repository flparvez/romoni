"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AllOrderTable from "@/components/admin/AllOrderTable";
import { IIOrder } from "@/types/product";

const PAGE_SIZE = 12;
const STATUSES = ["ALL", "PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface Props {
  initialOrders: IIOrder[];
  initialCounts: Record<string, number>;
}

export default function AllOrders({ initialOrders, initialCounts }: Props) {
  const [orders, setOrders] = useState<IIOrder[]>(initialOrders);
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/orders/filter${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
      const data = await res.json();
      setOrders(data.orders || []);
      setCounts(data.counts || {});
    } catch (error: any) {
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter !== "ALL") fetchOrders();
  }, [fetchOrders, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete order");
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update order status");
      toast.success("Order status updated");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status}
              <span className="ml-1 text-muted-foreground">({counts[status] || 0})</span>
            </Button>
          ))}
        </div>

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
}
