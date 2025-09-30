'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

// Define the shape of the data we expect from the parent
interface SalesData {
  _id: string
  totalSales: number
}

interface SalesChartCardProps {
  data: SalesData[]
}

export function SalesChartCard({ data }: SalesChartCardProps) {
 
  // Handle the case where there is no data to display
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Sales Analytics</h3>
          <p className="text-sm text-muted-foreground mt-4">
            No sales data available for the last 30 days.
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentage change based on the received data
  const calculateTrend = () => {
    if (data.length < 2) return { percentage: 0, isUp: true }; // Default for single data point
    
    // Use the first and last elements for trend calculation
    const firstDaySales = data[0].totalSales;
    const lastDaySales = data[data.length - 1].totalSales;
    
    // Avoid division by zero
    if (firstDaySales === 0) {
      return { percentage: 100, isUp: lastDaySales > 0 };
    }
    
    const percentage = ((lastDaySales - firstDaySales) / firstDaySales) * 100;
    
    return {
      percentage: Math.abs(percentage),
      isUp: percentage >= 0
    };
  };

  const trend = calculateTrend();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Sales Analytics</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <div className="flex items-center gap-1">
            {trend.isUp ? (
              <FiTrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <FiTrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend.percentage.toFixed(1)}% {trend.isUp ? 'increase' : 'decrease'}
            </span>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => value.split('-')[2]} // Show only day
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `৳${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`৳${value.toFixed(2)}`, 'Total Sales']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalSales" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}