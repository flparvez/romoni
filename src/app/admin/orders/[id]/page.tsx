import OrderDetailsClient from "@/components/admin/OrderDetailsClient";

import { SITE_URL } from "@/hooks/serverApi";
 interface IdParams {
  params: Promise<{ id: string }>;
}


const ERROR_MESSAGES = {
  FAILED_FETCH: 'Failed to fetch orders',
  NOT_FOUND: 'Order not found',
} as const;

export default async function AdminOrderDetailsPage({ params }: IdParams) {
  const { id } = await params;

  try {
 const response = await fetch(`${SITE_URL}/api/orders/${id}`);
   
    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.FAILED_FETCH);
    }

    const data = await response.json();

    if (!data?.order) {
      return (
        <div className="p-6 text-amber-500 flex items-center gap-2">
          <span>⚠️</span>
          <span>{ERROR_MESSAGES.NOT_FOUND}</span>
        </div>
      );
    }

    return <OrderDetailsClient order={data.order} />;
  } catch (error) {
    console.error('Order fetch error:', error);
    
    return (
      <div className="p-6 text-red-500 flex items-center gap-2">
        <span>❌</span>
        <span>{ERROR_MESSAGES.FAILED_FETCH}</span>
      </div>
    );
  }
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: IdParams) {
  const { id } = await params;
  
  return {
    title: `Order #${id} | Admin Dashboard`,
    description: `View details for order #${id}`,
  };
}

