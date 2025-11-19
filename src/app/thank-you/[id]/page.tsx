import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderInformationPage from "@/components/OrderInformationPage"; // Fixed typo here
import { SITE_URL } from "@/hooks/serverApi";
import { IOrder } from "@/types";

// ⚡ Define Props for Next.js 15 (Params is a Promise)
type Props = {
  params: Promise<{ id: string }>;
};

/* ----------------------------------------------------------
 ⚡ HELPER: Fetch Order Data
----------------------------------------------------------- */
async function getOrder(id: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/orders/${id}`, {
      cache: "no-store", // Ensure fresh data for new orders
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.order || null; // Ensure we return the order object directly
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

/* ----------------------------------------------------------
 ⚡ METADATA GENERATION
----------------------------------------------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params properly
  const { id } = await params;
  const order:IOrder = await getOrder(id);

  if (!order) {
    return {
      title: "Order Not Found | Unique Store BD",
      description: "The requested order could not be found.",
    };
  }

  return {
    title: `Order #${order.orderId} Confirmed | Unique Store BD`,
    description: `Thank you! Your order #${order.orderId} has been successfully placed.`,
    openGraph: {
      title: `${order.fullName} | Order #${order.orderId} Confirmed`,
      description: `Thank you for shopping with Unique Store BD. Your order #${order.orderId} is confirmed.`,
      images: order.items[0].product.images[0].url
        ? [
            {
              url: order.items[0].product.images[0].url,
              width: 800,
              height: 600,
              alt: order.items[0].product.name,
            },
          ]
        : undefined,
      type: "website",
    },
  };
}

/* ----------------------------------------------------------
 ⚡ MAIN PAGE COMPONENT
----------------------------------------------------------- */
export default async function ThankYou({ params }: Props) {
  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;

  // 2. Fetch Data
  const order = await getOrder(id);

  // 3. Handle Not Found (404)
  if (!order) {
    notFound(); // Shows the default Next.js 404 page
  }

  // 4. Render Page
  return (
    <main className="bg-gray-50 ">
      <div className=" mx-auto px-0 sm:px-6 lg:px-8">
        {/* Pass the order data correctly */}
        <OrderInformationPage order={order} />
      </div>
    </main>
  );
}