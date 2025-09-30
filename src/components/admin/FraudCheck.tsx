"use client";

import React from "react";

interface FraudCheckProps {
  phone: string;
  setPhone: (val: string) => void;
  handleFraudCheckByPhone: () => void;
  loading: boolean;
  error: string | null;
  fraudResult: any;
}

const FraudCheck: React.FC<FraudCheckProps> = ({
  phone,
  setPhone,
  handleFraudCheckByPhone,
  loading,
  error,
  fraudResult,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">🛡️ Fraud Check by Phone</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          onClick={handleFraudCheckByPhone}
          disabled={loading || !phone}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? "Checking..." : "Check Now"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {fraudResult && fraudResult.courierData && (
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-medium">Courier Summary</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(fraudResult.courierData).map(([key, courier]: any) => {
              if (key === "summary") return null;
              return (
                <div
                  key={key}
                  className="border rounded-md p-3 flex items-center gap-3 bg-gray-50"
                >
                  <img src={courier.logo} alt={courier.name} className="w-10 h-10" />
                  <div>
                    <p className="font-medium">{courier.name}</p>
                    <p className="text-sm text-gray-600">
                      Success: {courier.success_parcel}/{courier.total_parcel}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ratio: {courier.success_ratio}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {fraudResult.courierData.summary && (
            <div className="mt-4 p-3 rounded bg-green-50">
              <p className="text-sm font-medium">
                ✅ Total: {fraudResult.courierData.summary.total_parcel} | Success:{" "}
                {fraudResult.courierData.summary.success_parcel} | Cancelled:{" "}
                {fraudResult.courierData.summary.cancelled_parcel} | Success Ratio:{" "}
                {fraudResult.courierData.summary.success_ratio}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FraudCheck;
