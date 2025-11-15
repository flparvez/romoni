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

interface Props {
  initialOrders: IOrder[];
  initialCounts: Record<string, number>;
}

export default function AllOrders({ initialOrders, initialCounts }: Props) {

  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("ALL");

  // ✅ selection
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierService>("STEADFAST");
  const [pickupLoading, setPickupLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: number; fail: number } | null>(null);
  const [statusLoading, setStatusLoading] = useState<Status | null>(null);

  // ------- Helpers -------
  const alreadyPicked = (o: IOrder) =>
    Array.isArray(o.courierHistory) &&
    o.courierHistory.some((h: { isPickupRequested?: boolean }) => !!h?.isPickupRequested);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/orders/filter${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
      const data = await res.json();
      setOrders(data.orders || []);
      setCounts(data.counts || {});
      setSelectedOrders([]); // reset selection when list changes
    } catch (error: any) {
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  }, [statusFilter]);

  useEffect(() => {
    // When switching away from "ALL", refetch server-side filtered data
    if (statusFilter !== "ALL") fetchOrders();
    // For "ALL", we keep initial SSR data for speed
  }, [fetchOrders, statusFilter]);

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(
    () => orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [orders, currentPage]
  );

  // Select-all only selects orders that are pickup-eligible (UX nicety)
  const selectableIds = useMemo(
    () => paginatedOrders.filter((o) => !alreadyPicked(o)).map((o) => o._id),
    [paginatedOrders]
  );

  const onToggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (checked: boolean) => {
    setSelectedOrders(checked ? selectableIds : []);
  };

  // ------- BULK PICKUP -------
  const handleBulkPickup = async () => {
    if (selectedOrders.length === 0) return toast.error("Select at least one order.");
    setPickupLoading(true);
    setBulkResult(null);
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
      if (!res.ok) throw new Error(data.error || "Bulk pickup failed");

      const ok = (data.results || []).filter((r: { ok: boolean }) => r.ok).length;
      const fail = (data.results || []).length - ok;
      setBulkResult({ ok, fail });

      toast.success(`Pickup requested. Success: ${ok}, Failed: ${fail}`);
      await fetchOrders();
    } catch (e: any) {
      toast.error(e.message || "Bulk pickup failed");
    } finally {
      setPickupLoading(false);
      setSelectedOrders([]);
    }
  };

  // ------- BULK STATUS -------
  const handleBulkStatus = async (newStatus: Status) => {
    if (selectedOrders.length === 0) return toast.error("Select at least one order.");
    setStatusLoading(newStatus);
    try {
      // loop client-side; you also can implement /api/orders/bulk-status if you prefer
      const results = await Promise.allSettled(
        selectedOrders.map((id) =>
          fetch(`/api/orders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      const ok = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length;
      const fail = results.length - ok;
      toast.success(`Status updated → ${newStatus}. Success: ${ok}, Failed: ${fail}`);
      await fetchOrders();
    } catch (e: any) {
      toast.error(e.message || "Bulk status update failed");
    } finally {
      setStatusLoading(null);
      setSelectedOrders([]);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 overflow-x-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <Link href="/admin/orders" className="border px-3 py-1.5 rounded-md text-sm">
            View All
          </Link>
        </div>

        {/* Status filters (fast, responsive) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((status) => (
            <button
              key={status}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                statusFilter === status ? "bg-black text-white" : "bg-white"
              }`}
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
            >
              {status}{" "}
              <span className="ml-1 text-muted-foreground">({counts[status] || 0})</span>
            </button>
          ))}
        </div>

        {/* BULK BAR */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4 p-3 rounded-md border bg-gray-50">
          {/* Courier select */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Courier:</label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value as CourierService)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="STEADFAST">Steadfast</option>
              <option value="PATHAO">Pathao</option>
            </select>
          </div>

          {/* Bulk actions Summary */}
          <div className="text-sm text-gray-600">
            Selected: <b>{selectedOrders.length}</b> &nbsp;|&nbsp; Page selectable (not already picked):{" "}
            {selectableIds.length}
          </div>

          {/* Bulk Pickup */}
          <div className="flex gap-2 ml-0 lg:ml-auto">
            <button
              disabled={pickupLoading || selectedOrders.length === 0}
              onClick={handleBulkPickup}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {pickupLoading ? "Requesting..." : `Request Pickup (${selectedOrders.length})`}
            </button>
          </div>
        </div>

        {/* Bulk Status Buttons (Option B) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as Status[]).map(
            (s) => (
              <button
                key={s}
                disabled={statusLoading !== null || selectedOrders.length === 0}
                onClick={() => handleBulkStatus(s)}
                className={`px-3 py-1.5 rounded-md text-sm border hover:bg-gray-100 disabled:opacity-60 ${
                  statusLoading === s ? "opacity-70" : ""
                }`}
              >
                {statusLoading === s ? "Updating..." : s}
              </button>
            )
          )}
        </div>

        {/* Last run summary */}
        {bulkResult && (
          <div className="mb-4 text-sm rounded-md border p-2 bg-white">
            <span className="text-green-700 font-semibold">Success: {bulkResult.ok}</span>
            <span className="mx-3 text-gray-400">|</span>
            <span className="text-red-700 font-semibold">Failed: {bulkResult.fail}</span>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : paginatedOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders found</p>
        ) : (
          <>
            <AllOrderTable
              paginatedOrders={paginatedOrders}
              onDelete={async (id) => {
                if (!confirm("Delete this order?")) return;
                const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
                if (res.ok) {
                  toast.success("Deleted");
                  fetchOrders();
                } else {
                  toast.error("Delete failed");
                }
              }}
              onUpdateStatus={async (id, newStatus) => {
                const res = await fetch(`/api/orders/${id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                });
                if (!res.ok) toast.error("Failed to update status");
                else {
                  toast.success("Status updated");
                  fetchOrders();
                }
              }}
              selectedOrders={selectedOrders}
              onToggleSelect={onToggleSelect}
              onToggleAll={onToggleAll}
              isPickupRequested={(o) => alreadyPicked(o)}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="border rounded-md px-3 py-1.5 text-sm disabled:opacity-60"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="border rounded-md px-3 py-1.5 text-sm disabled:opacity-60"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
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
