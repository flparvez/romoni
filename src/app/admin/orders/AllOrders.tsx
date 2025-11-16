"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AllOrderTable from "@/components/admin/AllOrderTable";
import type { IOrder } from "@/types/index";

const PAGE_SIZE = 12;
const STATUSES = ["ALL", "PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

type Status =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type CourierService = "STEADFAST" | "PATHAO";

export default function AllOrders({ initialOrders, initialCounts }: {
  initialOrders: IOrder[];
  initialCounts: Record<string, number>;
}) {
  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [counts, setCounts] = useState(initialCounts);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("ALL");

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierService>("STEADFAST");
  const [pickupLoading, setPickupLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<Status | null>(null);

  const alreadyPicked = (o: IOrder) =>
    Array.isArray(o.courierHistory) &&
    o.courierHistory.some((h) => h?.isPickupRequested);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/orders/filter${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setOrders(data.orders || []);
      setCounts(data.counts || {});
      setSelectedOrders([]);
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter !== "ALL") fetchOrders();
  }, [fetchOrders, statusFilter]);

  const paginatedOrders = useMemo(() => {
    return orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [orders, currentPage]);

  const selectableIds = useMemo(
    () => paginatedOrders.filter((o) => !alreadyPicked(o)).map((o) => o._id),
    [paginatedOrders]
  );

  const onToggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (state: boolean) => {
    setSelectedOrders(state ? selectableIds : []);
  };

  // ===============================
  // 🚀 Bulk Courier Transfer
  // ===============================
  const handleBulkCourierTransfer = async () => {
    if (!selectedOrders.length)
      return toast.error("Select at least one order");

    if (!confirm(`Move ${selectedOrders.length} orders to ${selectedCourier}?`))
      return;

    try {
      const res = await fetch("/api/orders/bulk-courier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrders,
          courier: selectedCourier,
        }),
      });

      if (!res.ok) throw new Error("Courier transfer failed");

      setOrders((prev:any) =>
        prev.map((o: IOrder) =>
          selectedOrders.includes(o._id)
            ? { ...o, courierService: selectedCourier }
            : o
        )
      );

      toast.success(`Moved to ${selectedCourier}`);
      setSelectedOrders([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ===============================
  // 🚀 Bulk Pickup
  // ===============================
  const handleBulkPickup = async () => {
    if (!selectedOrders.length)
      return toast.error("Select at least one order");

    setPickupLoading(true);

    try {
      const endpoint =
        selectedCourier === "STEADFAST"
          ? "/api/steadfast/pickup-bulk"
          : "/api/pathao/pickup-bulk";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Pickup requested`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPickupLoading(false);
      setSelectedOrders([]);
    }
  };

  // ===============================
  // 🚀 Instant Status Update
  // ===============================
  const onUpdateStatusInstant = async (id: string, newStatus: Status) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      setOrders((prev: any) =>
        prev.map((o: IOrder) => (o._id === id ? { ...o, status: newStatus } : o))
      );

      toast.success("Updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  //  Handle Bulk Status Update

  const handleBulkStatus = async (newStatus: Status) => {
  if (selectedOrders.length === 0)
    return toast.error("Select at least one order.");

  setStatusLoading(newStatus);

  try {
    const results = await Promise.allSettled(
      selectedOrders.map((id) =>
        fetch(`/api/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      )
    );

    const ok = results.filter(
      (r) => r.status === "fulfilled" && (r.value as Response).ok
    ).length;

    const fail = results.length - ok;

    toast.success(
      `Status updated to ${newStatus}. Success: ${ok}, Failed: ${fail}`
    );

    // Refresh list
    await fetchOrders();
  } catch (err: any) {
    toast.error(err.message || "Bulk status failed");
  } finally {
    setStatusLoading(null);
    setSelectedOrders([]);
  }
};


  // ===============================
  // 🚀 Instant Delete
  // ===============================
  const onDeleteInstant = async (id: string) => {
    if (!confirm("Delete this order?")) return;

    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });

    if (!res.ok) return toast.error("Delete failed");

    setOrders((prev) => prev.filter((o) => o._id !== id));
    toast.success("Deleted");
  };

  // ===============================
  // 🚀 Bulk Delete
  // ===============================
  const handleBulkDelete = async () => {
    if (!selectedOrders.length)
      return toast.error("Select at least one order");

    if (!confirm(`Delete ${selectedOrders.length} orders?`)) return;

    try {
      const res = await fetch("/api/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (!res.ok) throw new Error("Bulk delete failed");

      setOrders((prev) =>
        prev.filter((o) => !selectedOrders.includes(o._id))
      );

      setSelectedOrders([]);
      toast.success("Orders deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 overflow-x-auto">

        {/* =================== TOP BAR =================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <Link href="/admin/orders" className="border px-3 py-1.5 rounded-md text-sm">
            View All
          </Link>
        </div>

        {/* =================== STATUS FILTER =================== */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((status) => (
            <button
              key={status}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                statusFilter === status ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({counts[status] || 0})
            </button>
          ))}
        </div>

        {/* =================== BULK BAR =================== */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4 p-3 rounded-md border bg-gray-50">

          {/* Delete */}
          <button
            disabled={!selectedOrders.length}
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
          >
            Delete Selected ({selectedOrders.length})
          </button>

          {/* Courier */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Courier:</span>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value as CourierService)}
              className="border px-2 py-1 rounded-md text-sm"
            >
              <option value="STEADFAST">Steadfast</option>
              <option value="PATHAO">Pathao</option>
            </select>
          </div>

          {/* Bulk Courier Transfer */}
          <button
            disabled={!selectedOrders.length}
            onClick={handleBulkCourierTransfer}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
          >
            Move to {selectedCourier} ({selectedOrders.length})
          </button>

          <div className="text-sm text-gray-600">
            Selected: <b>{selectedOrders.length}</b> | Page selectable: {selectableIds.length}
          </div>

          {/* Bulk Pickup */}
          <button
            disabled={pickupLoading || !selectedOrders.length}
            onClick={handleBulkPickup}
            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
          >
            {pickupLoading ? "Requesting..." : `Pickup (${selectedOrders.length})`}
          </button>
        </div>

        {/* =================== BULK STATUS =================== */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as Status[]).map(
            (s) => (
              <button
                key={s}
                disabled={!selectedOrders.length}
                onClick={() => handleBulkStatus(s)}
                className="border px-3 py-1.5 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                {statusLoading === s ? "Updating..." : s}
              </button>
            )
          )}
        </div>

        {/* =================== TABLE =================== */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : paginatedOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found</p>
        ) : (
          <>
            <AllOrderTable
              paginatedOrders={paginatedOrders}
              onDelete={onDeleteInstant}
              onUpdateStatus={onUpdateStatusInstant}
              selectedOrders={selectedOrders}
              onToggleSelect={onToggleSelect}
              onToggleAll={onToggleAll}
              isPickupRequested={(o) => alreadyPicked(o)}
            />

            {/* =================== PAGINATION =================== */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
