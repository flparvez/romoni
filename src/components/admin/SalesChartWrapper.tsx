// components/admin/SalesChartWrapper.tsx
import { getSalesAnalytics } from "@/lib/action";
import SalesChartCard from "./SalesChartCard";

export default async function SalesChartWrapper() {
  const data = await getSalesAnalytics();
  return <SalesChartCard data={data} />;
}
