"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import AllOrderTable from "@/components/admin/AllOrderTable";
import type { IOrder } from "@/types/index";

const STATUSES = ["ALL", "PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Status = typeof STATUSES[number];
type CourierService = "STEADFAST" | "PATHAO";

export default function AllOrders({ 
  initialOrders, 
  initialCounts,
  totalPages,
  currentPage 
}: {
  initialOrders: IOrder[];
  initialCounts: Record<string, number>;
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State
  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [counts, setCounts] = useState(initialCounts); // Keep counts in sync if needed
  
  // Selection State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierService>("STEADFAST");
  
  // Loading States
  const [pickupLoading, setPickupLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Sync props to state (Server to Client Handover)
  useEffect(() => {
    setOrders(initialOrders);
    setCounts(initialCounts);
  }, [initialOrders, initialCounts]);

  // --- URL Update Handler (Super Fast Filtering) ---
  const updateFilter = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, String(value));
    if (key !== "page") params.set("page", "1"); // Reset page on filter change

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const statusFilter = (searchParams.get("status") as Status) || "ALL";

  // --- Selection Logic ---
  const alreadyPicked = (o: IOrder) =>
    Array.isArray(o.courierHistory) && o.courierHistory.some((h) => h?.isPickupRequested);

  const selectableIds = orders.filter((o) => !alreadyPicked(o)).map((o) => o._id);

  const onToggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleAll = (state: boolean) => {
    setSelectedOrders(state ? selectableIds : []);
  };

  // --- Actions (Optimistic UI) ---

  const onUpdateStatusInstant = async (id: string, newStatus: string) => {
    // ⚡ Optimistic Update
    const prevOrders = [...orders];
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o) as IOrder[]);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Updated");
      router.refresh();
    } catch {
      setOrders(prevOrders); // Rollback
      toast.error("Update failed");
    }
  };

  const onDeleteInstant = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    
    // ⚡ Optimistic Delete
    const prevOrders = [...orders];
    setOrders(prev => prev.filter(o => o._id !== id));

    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted");
      router.refresh();
    } catch {
      setOrders(prevOrders);
      toast.error("Delete failed");
    }
  };

  // --- Bulk Actions ---

  const handleBulkAction = async (action: 'courier' | 'delete' | 'status', payload?: any) => {
    if (!selectedOrders.length) return toast.error("Select orders first");
    if (!confirm("Are you sure?")) return;

    setBulkLoading(true);
    try {
        let endpoint = "";
        let body: any = { orderIds: selectedOrders };

        if (action === 'courier') {
            endpoint = "/api/orders/bulk-courier";
            body.courier = selectedCourier;
        } else if (action === 'delete') {
            endpoint = "/api/orders/bulk-delete";
        } else if (action === 'status') {
             // Handle bulk status manually via Promise.all if API doesn't support bulk status
             // Assuming user wants existing logic:
             await Promise.all(selectedOrders.map(id => 
                fetch(`/api/orders/${id}`, { 
                    method: 'PUT', 
                    body: JSON.stringify({ status: payload }) 
                })
             ));
             toast.success("Bulk status updated");
             router.refresh();
             setBulkLoading(false);
             setSelectedOrders([]);
             return;
        }

        if(endpoint) {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Success");
            router.refresh();
        }
    } catch (err) {
        toast.error("Operation failed");
    } finally {
        setBulkLoading(false);
        setSelectedOrders([]);
    }
  };

  const handleBulkPickup = async () => {
      if (!selectedOrders.length) return toast.error("Select orders first");
      setPickupLoading(true);
      try {
          const endpoint = selectedCourier === "STEADFAST" ? "/api/steadfast/pickup-bulk" : "/api/pathao/pickup-bulk";
          await fetch(endpoint, { method: "POST", body: JSON.stringify({ orderIds: selectedOrders }) });
          toast.success("Pickup Requested");
          router.refresh();
      } catch {
          toast.error("Pickup failed");
      } finally {
          setPickupLoading(false);
          setSelectedOrders([]);
      }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border mt-4">
      <div className="p-4 sm:p-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Orders <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{initialCounts.ALL || 0}</span>
          </h2>
          <button onClick={() => router.refresh()} className="p-2 hover:bg-gray-100 rounded-full transition">
             <RefreshCw className={`w-5 h-5 text-gray-600 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => updateFilter("status", status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === status 
                  ? "bg-black text-white border-black shadow-md" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
              }`}
            >
              {status} 
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === status ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[status] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk Action Bar */}
        <div className="bg-gray-50 border rounded-lg p-3 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between">
           <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
               <button 
                disabled={!selectedOrders.length || bulkLoading}
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 bg-white border text-red-600 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
               >
                 Delete ({selectedOrders.length})
               </button>

               <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>

               <select 
                value={selectedCourier} 
                onChange={(e) => setSelectedCourier(e.target.value as CourierService)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
               >
                   <option value="STEADFAST">Steadfast</option>
                   <option value="PATHAO">Pathao</option>
               </select>

               <button 
                 disabled={!selectedOrders.length || bulkLoading}
                 onClick={() => handleBulkAction('courier')}
                 className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
               >
                 Change Courier
               </button>
               
               <button 
                 disabled={!selectedOrders.length || pickupLoading}
                 onClick={handleBulkPickup}
                 className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
               >
                 {pickupLoading && <Loader2 className="w-3 h-3 animate-spin"/>}
                 Request Pickup
               </button>
           </div>
           
           {/* Bulk Status Dropdown could go here */}
           <div className="flex gap-1 overflow-x-auto w-full lg:w-auto">
             {["APPROVED", "SHIPPED", "DELIVERED"].map((s) => (
                 <button
                   key={s}
                   disabled={!selectedOrders.length || bulkLoading}
                   onClick={() => handleBulkAction('status', s)}
                   className="px-2 py-1 border bg-white text-xs rounded hover:bg-gray-100 disabled:opacity-50"
                 >
                   Set {s}
                 </button>
             ))}
           </div>
        </div>

        {/* Table Area */}
        <div className="relative min-h-[300px]">
           {isPending && (
             <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
             </div>
           )}
           
           {orders.length === 0 ? (
               <div className="text-center py-20 text-gray-500">No orders found.</div>
           ) : (
               <AllOrderTable
                paginatedOrders={orders}
                onDelete={onDeleteInstant}
                onUpdateStatus={onUpdateStatusInstant as any}
                selectedOrders={selectedOrders}
                onToggleSelect={onToggleSelect}
                onToggleAll={onToggleAll}
                isPickupRequested={alreadyPicked}
              />
           )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 border-t pt-6">
            <button
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", currentPage - 1)}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
               Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter("page", currentPage + 1)}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}