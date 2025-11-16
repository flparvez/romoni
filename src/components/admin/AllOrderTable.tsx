"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FiExternalLink,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiShield,
} from "react-icons/fi";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import FraudCheck from "./FraudCheck";
import { generateInvoicePdf } from "@/hooks/invoiceGenerator";
import type { IOrder } from "@/types/index";
type Status = "PENDING" | "APPROVED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Props = {
  paginatedOrders: IOrder[];
  onDelete: (id: string) => void;
  
onUpdateStatus: (id: string, status: Status) => void;
  // ✅ Selection control
  selectedOrders: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  // ✅ Disable pickup checkbox (UX hint)
  isPickupRequested: (o: IOrder) => boolean;
};

export default function AllOrderTable({
  paginatedOrders,
  onDelete,
  onUpdateStatus,
  selectedOrders,
  onToggleSelect,
  onToggleAll,
  isPickupRequested,
 
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [fraudResults, setFraudResults] = useState<Record<string, any>>({});
  const [loadingFraud, setLoadingFraud] = useState<string | null>(null);
  const [errorFraud, setErrorFraud] = useState<Record<string, string | null>>({});
  const [showFraudModal, setShowFraudModal] = useState<string | null>(null);

  // Derived
  const selectableThisPage = useMemo(
    () => paginatedOrders.filter((o) => !isPickupRequested(o)).map((o) => o._id),
    [paginatedOrders, isPickupRequested]
  );
  const allSelectedThisPage =
    selectableThisPage.length > 0 &&
    selectableThisPage.every((id) => selectedOrders.includes(id));

  // ✅ Run first fraud check automatically for the first order (on page load)
  useEffect(() => {
    const firstOrder = paginatedOrders?.[0];
    if (firstOrder && firstOrder.phone && !fraudResults[firstOrder._id]) {
      handleFraudCheck(firstOrder._id, firstOrder.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedOrders]);

  const handleFraudCheck = async (orderId: string, phone: string) => {
    try {
      setLoadingFraud(orderId);
      setErrorFraud((prev) => ({ ...prev, [orderId]: null }));

      const res = await fetch("/api/fraud-check/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Fraud check failed");

      setFraudResults((prev) => ({ ...prev, [orderId]: data.data }));
    } catch (err: any) {
      setErrorFraud((prev) => ({ ...prev, [orderId]: err.message }));
    } finally {
      setLoadingFraud(null);
    }
  };

  const toggleRowExpansion = (orderId: string, phone: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else {
        newSet.add(orderId);
        if (!fraudResults[orderId]) handleFraudCheck(orderId, phone);
      }
      return newSet;
    });
  };

  const handlePrintLabel = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`);
    const order = await res.json();
    generateInvoicePdf(order?.order);
  };

  const getBadge = (label: string, color: string) => (
    <Badge className={`${color} font-medium`}>{label}</Badge>
  );

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    APPROVED: "bg-sky-100 text-sky-800",
  };

  const paymentColor: Record<string, string> = {
    BKASH: "bg-green-100 text-green-800",
    NAGAD: "bg-purple-100 text-purple-800",
    COD: "bg-orange-100 text-orange-800",
    PARTIAL: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Recent orders</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {/* Select all (only selectable ones) */}
            <TableHead className="w-[44px]">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={allSelectedThisPage}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="Select all selectable orders on this page"
              />
            </TableHead>
            <TableHead />
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Courier</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedOrders.map((order) => {
            const expanded = expandedRows.has(order._id);
            const pickupRequested = isPickupRequested(order);
            const isSelected = selectedOrders.includes(order._id);

            return (
              <React.Fragment key={order._id}>
                <TableRow
                  className="hover:bg-gray-50"
                  onClick={() => toggleRowExpansion(order._id, order.phone)}
                >
                  {/* Row checkbox (disabled if already pickup requested to hint UX) */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      disabled={pickupRequested}
                      checked={isSelected}
                      onChange={() => onToggleSelect(order._id)}
                      aria-label={`Select order #${order.orderId}`}
                    />
                  </TableCell>

                  <TableCell className="cursor-pointer">
                    {expanded ? <FiChevronUp /> : <FiChevronDown />}
                  </TableCell>

                  <TableCell className="font-medium">#{order.orderId}</TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">{order.fullName}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {order.items?.[0] ? (
                      <div className="flex items-center gap-2">
                        {order.items[0].product?.images?.[0]?.url && (
                          <img
                            src={order.items[0].product.images[0].url}
                            alt={order.items[0].product.name}
                            className="h-8 w-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-xs text-gray-600">
                            {order.items[0].product?.name}
                          </p>
                          <p className="text-xs">
                            {order.items[0].selectedVariantOptions?.Size && (
                              <>Size: {order.items[0].selectedVariantOptions.Size}&nbsp;</>
                            )}
                            {order.items[0].selectedVariantOptions?.Color && (
                              <>| Color: {order.items[0].selectedVariantOptions.Color}</>
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      "No items"
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold">৳{order.totalAmount}</div>
                    {order.paymentType === "PARTIAL" && (
                      <p className="text-xs text-gray-500">Partial</p>
                    )}
                  </TableCell>

                  <TableCell>
                    {order.courierHistory?.[0] ? (
                      <div>
                        <p className="font-medium">{order.courierHistory[0].courier}</p>
                        {order.courierHistory[0].trackingCode && (
                          <p className="text-xs text-gray-500">
                            {order.courierHistory[0].trackingCode}
                          </p>
                        )}
                        {pickupRequested && (
                          <p className="text-xs text-green-700 mt-1">Pickup requested</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </TableCell>

                  <TableCell>{order.trxId || "No note"}</TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(order._id, "APPROVED")}
                          className="h-7 px-2 text-xs"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(order._id, "CANCELLED")}
                          className="h-7 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="flex gap-1">
                        <Link href={`/admin/orders/${order._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            View
                            <FiExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintLabel(order._id)}
                          className="h-7 px-2 text-xs"
                        >
                          <FiPrinter className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={[
                            "DELIVERED",
                            "PENDING",
                            "SHIPPED",
                            "APPROVED",
                          ].includes(order.status)}
                          onClick={() => onDelete(order._id)}
                          className="h-7 px-2 text-xs"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {expanded && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={9}>
                      <div className="grid md:grid-cols-2 gap-4 p-4">
                        <div>
                          <h4 className="font-semibold mb-2">Order Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-500">Order Date:</p>
                            <p>
                              {new Date(order.createdAt).toLocaleDateString()}{" "}
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                            <p className="text-gray-500">Payment:</p>
                            <p>
                              {getBadge(
                                order.paymentType,
                                paymentColor[order.paymentType] || ""
                              )}
                            </p>
                            <p className="text-gray-500">Status:</p>
                            <p>{getBadge(order.status, statusColor[order.status] || "")}</p>
                            <p className="text-gray-500">Delivery:</p>
                            <p>৳{order.deliveryCharge}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Shipping Address</h4>
                          <ul className="text-sm space-y-1">
                            <li>{order.fullName}</li>
                            <li>{order.phone}</li>
                            <li>{order.address}</li>
                            {order.city && <li>{order.city}</li>}
                          </ul>
                        </div>
                      </div>

                      {/* ✅ Fraud Check */}
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                          <FiShield className="text-blue-600" /> Fraud Check
                        </h4>

                        {loadingFraud === order._id && (
                          <p className="text-sm text-gray-500 animate-pulse">
                            🔍 Checking fraud data...
                          </p>
                        )}

                        {errorFraud[order._id] && (
                          <p className="text-sm text-red-500">⚠️ {errorFraud[order._id]}</p>
                        )}

                        {fraudResults[order._id] ? (
                          <div className="grid sm:grid-cols-4 gap-3 mb-3">
                            {[
                              {
                                label: "Success Ratio",
                                value: `${
                                  fraudResults[order._id].courierData?.summary?.success_ratio || "N/A"
                                }%`,
                                color:
                                  "bg-green-50 border-green-200 text-green-700",
                              },
                              {
                                label: "Total Parcels",
                                value:
                                  fraudResults[order._id].courierData?.summary?.total_parcel ||
                                  "N/A",
                                color: "bg-blue-50 border-blue-200 text-blue-700",
                              },
                              {
                                label: "Success Parcels",
                                value:
                                  fraudResults[order._id].courierData?.summary?.success_parcel ||
                                  "N/A",
                                color:
                                  "bg-emerald-50 border-emerald-200 text-emerald-700",
                              },
                              {
                                label: "Cancelled Parcels",
                                value:
                                  fraudResults[order._id].courierData?.summary?.cancelled_parcel ||
                                  "N/A",
                                color: "bg-red-50 border-red-200 text-red-700",
                              },
                            ].map((stat) => (
                              <div
                                key={stat.label}
                                className={`border rounded-lg p-3 text-center ${stat.color}`}
                              >
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <p className="text-lg font-bold">{stat.value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          !loadingFraud && (
                            <p className="text-sm text-gray-400">No fraud data found</p>
                          )
                        )}

                        {fraudResults[order._id] && (
                          <Button
                            size="sm"
                            className="mt-2"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFraudModal(order._id);
                            }}
                          >
                            View Full Fraud Check
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Fraud Modal */}
      {showFraudModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowFraudModal(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <FraudCheck
              phone={paginatedOrders.find((o) => o._id === showFraudModal)?.phone || ""}
              setPhone={() => {}}
              handleFraudCheckByPhone={() => {}}
              loading={false}
              error={null}
              fraudResult={fraudResults[showFraudModal]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
