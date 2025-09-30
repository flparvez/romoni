"use client";

import React, { useState } from "react";
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
  FiEdit,
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
import { IIOrder } from "@/types/product";

const AllOrderTable = ({
  paginatedOrders,
  onDelete,
  onUpdateStatus,
}: {
  paginatedOrders: IIOrder[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [fraudResults, setFraudResults] = useState<Record<string, any>>({});
  const [loadingFraud, setLoadingFraud] = useState<string | null>(null);
  const [errorFraud, setErrorFraud] = useState<Record<string, string | null>>(
    {}
  );
  const [showFraudModal, setShowFraudModal] = useState<string | null>(null);

  const toggleRowExpansion = async (orderId: string, phone: string) => {
    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);

      // Auto fetch fraud data if not already loaded
      if (!fraudResults[orderId] && phone) {
        setLoadingFraud(orderId);
        setErrorFraud((prev) => ({ ...prev, [orderId]: null }));

        try {
          const res = await fetch("/api/fraud-check/phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Fraud check failed");
          }

          setFraudResults((prev) => ({ ...prev, [orderId]: data.data }));
        } catch (err: any) {
          setErrorFraud((prev) => ({ ...prev, [orderId]: err.message }));
        } finally {
          setLoadingFraud(null);
        }
      }
    }

    setExpandedRows(newExpandedRows);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={`${
          statusColors[status] || "bg-gray-100 text-gray-800"
        } font-medium`}
      >
        {status}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      BKASH: "bg-green-100 text-green-800",
      NAGAD: "bg-purple-100 text-purple-800",
      COD: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge
        className={`${
          methodColors[method] || "bg-gray-100 text-gray-800"
        } font-medium`}
      >
        {method}
      </Badge>
    );
  };

  const handlePrintLabel = async (orderId: string) => {
    //  fetch order by id
const res = await fetch(`/api/orders/${orderId}`)
  

    const order = await res.json();

    generateInvoicePdf(order?.order)
   

  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of recent orders</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[50px]"></TableHead>
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
          {paginatedOrders.map((order) => (
            <React.Fragment key={order._id}>
              <TableRow
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleRowExpansion(order._id, order.phone)}
              >
                <TableCell>
                  {expandedRows.has(order._id) ? (
                    <FiChevronUp className="h-4 w-4" />
                  ) : (
                    <FiChevronDown className="h-4 w-4" />
                  )}
                </TableCell>
                {/* <Link href={`/admin/orders/${order._id}`}> */}
                
                 <TableCell className="font-medium">#{order.orderId}</TableCell>
                 {/* </Link> */}
                <TableCell>
                  <div>
                    <div className="font-medium">{order.fullName}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[220px] truncate">
             
                    {order?.items
                      ?  <div>
                        {/* image */}
                        {order.items[0]?.product?.images?.[0] && (
                          <img
                            src={order.items[0].product.images[0].url}
                            alt={order.items[0].product.name}
                            className="h-8 w-8 object-cover rounded mr-2 inline-block"
                          />
                        )}
                        <h3>{order.items[0].selectedVariantOptions?.Size} </h3>
                        <b>{order.items[0].selectedVariantOptions?.Color}</b>
                      </div>
                      : "No items"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">৳{order.totalAmount}</div>
                  {order.paymentType === "PARTIAL" && (
                    <div className="text-xs text-gray-500">Partial payment</div>
                  )}
                </TableCell>
                <TableCell>
                  {order.courierHistory?.length > 0 ? (
                    <div>
                      <div className="font-medium">
                        {order.courierHistory[0].courier}
                      </div>
                      {order.courierHistory[0].trackingCode && (
                        <div className="text-xs text-gray-500">
                          {order.courierHistory[0].trackingCode}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate text-sm">
                  </div>
                    {order.trxId || "No note"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(order._id, "APPROVED");
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        Approved
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(order._id, "CANCELLED");
                        }}
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
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 px-2 text-xs"
                        > View
                          <FiExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintLabel(order._id);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <FiPrinter className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={order.status === "DELIVERED" || order.status === "PENDING" || order.status === "SHIPPED" || order.status === "APPROVED" }
                        
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(order._id);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              {expandedRows.has(order._id) && (
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={8}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      <div>
                        <h4 className="font-semibold mb-2">Order Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Order Date:</div>
                          <div>
                            {new Date(order.createdAt).toLocaleDateString()},{" "}
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>

                          <div className="text-gray-500">Payment Type:</div>
                          <div>{order.paymentType}</div>

                          <div className="text-gray-500">Status:</div>
                          <div>{getStatusBadge(order.status)}</div>

                          <div className="text-gray-500">Delivery Charge:</div>
                          <div>৳{order.deliveryCharge}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                        <div className="text-sm">
                          <li>{order.fullName}</li>
                          <li>{order.phone}</li>
                          <li>{order.address}</li>
                          {order.city && <div>{order.city}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Fraud Check Section */}
               {/* Fraud Check Section */}
<div className="mt-6 border-t pt-4">
  <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
    <FiShield className="text-blue-600" /> Fraud Check
  </h4>

  {loadingFraud === order._id && (
    <p className="text-sm text-gray-500 animate-pulse">🔍 Checking fraud data...</p>
  )}

  {errorFraud[order._id] && (
    <p className="text-sm text-red-500">⚠️ {errorFraud[order._id]}</p>
  )}

  {fraudResults[order._id] ? (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500">Success Ratio</p>
        <p className="text-lg font-bold text-green-700">
          {fraudResults[order._id].courierData?.summary?.success_ratio || "N/A"}%
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500">Total Parcels</p>
        <p className="text-lg font-bold text-blue-700">
          {fraudResults[order._id].courierData?.summary?.total_parcel || "N/A"}
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500">Success Parcels</p>
        <p className="text-lg font-bold text-emerald-700">
          {fraudResults[order._id].courierData?.summary?.success_parcel || "N/A"}
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500">Cancelled Parcels</p>
        <p className="text-lg font-bold text-red-700">
          {fraudResults[order._id].courierData?.summary?.cancelled_parcel || "N/A"}
        </p>
      </div>
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
          ))}
        </TableBody>
      </Table>

      {/* Fraud Modal */}
      {showFraudModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowFraudModal(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <FraudCheck
              phone={
                paginatedOrders.find((o) => o._id === showFraudModal)?.phone ||
                ""
              }
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
};

export default AllOrderTable;
