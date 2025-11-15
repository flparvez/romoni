// components/admin/SalesChartCard.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface SalesData {
  _id: string;
  totalSales: number;
}

export default function SalesChartCard({ data }: { data: SalesData[] }) {
  if (!data || data.length === 0)
    return (
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <p className="text-sm text-muted-foreground mt-4">No sales data available.</p>
      </div>
    );

  const first = data[0].totalSales;
  const last = data[data.length - 1].totalSales;
  const diff = first === 0 ? 100 : ((last - first) / first) * 100;
  const isUp = diff >= 0;

  return (
    <div className="rounded-lg border bg-card shadow-sm p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Sales Analytics</h3>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium">
          {isUp ? <FiTrendingUp className="text-green-500" /> : <FiTrendingDown className="text-red-500" />}
          <span className={isUp ? "text-green-500" : "text-red-500"}>
            {Math.abs(diff).toFixed(1)}% {isUp ? "increase" : "decrease"}
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="_id" tickFormatter={d => d.split("-")[2]} />
            <YAxis tickFormatter={v => `৳${v}`} />
            <Tooltip formatter={v => `৳${v}`} />
            <Line type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
