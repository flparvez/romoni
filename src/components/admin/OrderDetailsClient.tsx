"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { City, Zone, Area } from "@/types/pathao";
import { IIOrder } from "@/types/product";
import { generateInvoicePdf } from "@/hooks/invoiceGenerator";
import FraudCheck from "./FraudCheck";
import { CartItem } from "@/hooks/useCart";

interface Props {
  order: IIOrder;
}

type CourierService = "PATHAO" | "STEADFAST";

export default function OrderDetailsClient({ order }: Props) {
  const router = useRouter();

  // 🔹 State Management
  const [form, setForm] = useState({
    status: order?.status,
    paymentType: order?.paymentType,
    address: order?.address,
    cityId: "",
    zoneId: "",
    areaId: "",
    note: order?.note || "", // Added note field
  });
  const [selectedCourier, setSelectedCourier] =
    useState<CourierService>("STEADFAST");

  const [pickupLoading, setPickupLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // 🔹 Courier History
  const isPickupRequested =
    order.courierHistory && order.courierHistory.length > 0;
  const currentCourier =
    order.courierHistory && order.courierHistory.length > 0
      ? order.courierHistory[order.courierHistory.length - 1]
      : null;

  // 🔹 Fraud check
  const [phone, setPhone] = useState(order.phone || "");
  const [loading, setLoading] = useState(false);
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // 📌 Pathao Location API Fetching
  // ===============================
  useEffect(() => {
    if (selectedCourier !== "PATHAO" || cities.length > 0) return;
    fetch("/api/pathao/cities")
      .then((res) => res.json())
      .then((data) => setCities(data?.data || []))
      .catch((err) => console.error("Failed to fetch cities:", err));
  }, [selectedCourier, cities.length]);

  useEffect(() => {
    if (!form.cityId) {
      setZones([]);
      setAreas([]);
      setForm((prev) => ({ ...prev, zoneId: "", areaId: "" }));
      return;
    }
    fetch(`/api/pathao/zones/${form.cityId}`)
      .then((res) => res.json())
      .then((data) => setZones(data?.data || []))
      .catch((err) => console.error("Failed to fetch zones:", err));
  }, [form.cityId]);

  useEffect(() => {
    if (!form.zoneId) {
      setAreas([]);
      setForm((prev) => ({ ...prev, areaId: "" }));
      return;
    }
    fetch(`/api/pathao/areas/${form.zoneId}`)
      .then((res) => res.json())
      .then((data) => setAreas(data?.data || []))
      .catch((err) => console.error("Failed to fetch areas:", err));
  }, [form.zoneId]);

  // ===============================
  // 📌 Handlers
  // ===============================
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCourierChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCourier(e.target.value as CourierService);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");

      setMessage({ type: "success", text: "✅ Order updated successfully" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "❌ Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    if (
      selectedCourier === "PATHAO" &&
      (!form.cityId || !form.zoneId || !form.areaId)
    ) {
      return setMessage({
        type: "warning",
        text: "⚠️ Please select City, Zone and Area for Pathao pickup.",
      });
    }

    setPickupLoading(true);
    setMessage(null);

    try {
      const endpoint =
        selectedCourier === "PATHAO"
          ? "/api/pathao/pickup-request"
          : "/api/steadfast/pickup-request";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pickup request failed");

      setMessage({
        type: "success",
        text: `✅ ${selectedCourier} pickup requested! Tracking: ${data.consignmentId}`,
      });
      router.refresh();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `❌ ${selectedCourier} pickup failed: ${error.message}`,
      });
    } finally {
      setPickupLoading(false);
    }
  };

  const handleFraudCheckByPhone = async () => {
    setLoading(true);
    setError(null);
    setFraudResult(null);

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
      setFraudResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPickupDisabled =
    pickupLoading ||
    isPickupRequested ||
    (selectedCourier === "PATHAO" &&
      (!form.cityId || !form.zoneId || !form.areaId));

  // ===============================
  // 📌 UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📦 Order #{order.orderId}
          </h1>
          <button
            onClick={() => generateInvoicePdf(order)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm sm:text-base"
          >
            📄 Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🔹 Order Information */}
          <OrderInfo order={order} currentCourier={currentCourier} />

          {/* 🔹 Management Section */}
          <div className="space-y-6">
            <ManageOrder
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
            <OrderItems order={order} />

            {/* 🔹 Shipping Management Inline */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">🚚 Shipping Management</h2>

              {/* Courier Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Courier</label>
                <select
                  value={selectedCourier}
                  onChange={handleCourierChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">-- Select Courier --</option>
                  <option value="PATHAO">Pathao</option>
                  <option value="STEADFAST">SteadFast</option>
                </select>
              </div>

              {/* City, Zone, Area */}
              {selectedCourier === "PATHAO" && (
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <select
                      name="cityId"
                      value={form.cityId || ""}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.city_id} value={city.city_id}>
                          {city.city_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Zone</label>
                    <select
                      name="zoneId"
                      value={form.zoneId || ""}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone.zone_id} value={zone.zone_id}>
                          {zone.zone_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Area</label>
                    <select
                      name="areaId"
                      value={form.areaId || ""}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="">Select Area</option>
                      {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>
                          {area.area_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Pickup Button */}
              <button
                onClick={handlePickup}
                disabled={isPickupDisabled}
                className={`w-full py-2 rounded-md text-white font-medium ${
                  isPickupRequested
                    ? "bg-green-600"
                    : pickupLoading
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isPickupRequested
                  ? "✅ Pickup Requested"
                  : pickupLoading
                  ? "Requesting Pickup..."
                  : "Request Pickup"}
              </button>
            </div>

            {/* Fraud Check */}
            <FraudCheck
              phone={phone}
              setPhone={setPhone}
              handleFraudCheckByPhone={handleFraudCheckByPhone}
              loading={loading}
              error={error}
              fraudResult={fraudResult}
            />
          </div>
        </div>

        {/* 🔹 Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================
// 📌 Sub Components
// ===============================
const OrderInfo = ({ order, currentCourier }: any) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h2 className="text-xl font-semibold mb-4">Order Information</h2>
    <div className="space-y-3 text-sm">
      <InfoRow label="Customer" value={order.fullName} />
      <InfoRow label="Phone" value={order.phone} />
      <InfoRow label="Address" value={order.address} />
      <InfoRow label="Total Amount" value={`৳${order.totalAmount}`} />
      <InfoRow label="Delivery Charge" value={`৳${order.deliveryCharge}`} />
      <InfoRow label="Status" value={order.status} />
      <InfoRow label="Payment Method" value={order.paymentType} />
      <InfoRow
        label="Order Date"
        value={new Date(order.createdAt).toLocaleString()}
      />
      {order.note && <InfoRow label="Note" value={order.note} />}
      {currentCourier && (
        <InfoRow
          label="Courier"
          value={`${currentCourier.service}: ${currentCourier.trackingCode} (${currentCourier.status})`}
        />
      )}
    </div>
  </div>
);

const ManageOrder = ({ form, handleChange, handleSubmit, loading }: any) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Manage Order</h2>
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        
        {/* Note Field */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Add any notes about this order..."
          />
        </div>
        
        <SelectField
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={[
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ]}
        />
        <SelectField
          label="paymentType"
          name="paymentType"
          value={form.paymentType}
          onChange={handleChange}
          options={["COD", "BKASH", "PARTIAl"]}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:bg-gray-400"
      >
        {loading ? "Updating..." : "Update Order"}
      </button>
    </div>
  </div>
);

const OrderItems = ({ order }: any) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6">
    <h2 className="text-2xl font-bold mb-6 text-gray-900">🛍️ Order Items</h2>
    <div className="space-y-5">
      {order?.items?.map((item: CartItem) => (
        <div
          key={item.product?._id}
          className="flex items-center gap-5 bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300"
        >
          {/* Product Image */}
          <img
            src={item.product?.images[0]?.url}
            alt={item.product?.name}
            className="w-20 h-20 rounded-lg object-cover border"
          />

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{item.product?.name}</h3>
            <p className="text-sm text-gray-600">
              Qty: <span className="font-medium">{item.quantity}</span> × ৳{item.price}
            </p>

            {/* Size & Color */}
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {item.selectedVariantOptions && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Size: {item.selectedVariantOptions.Size || "N/A"}
                </span>
              )}
              {item.selectedVariantOptions && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Color: {item.selectedVariantOptions.Color || "N/A"}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 🔹 Helper Components
const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span className="font-medium text-gray-700">{label}:</span>
    <span>{value}</span>
  </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded-md p-2"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);