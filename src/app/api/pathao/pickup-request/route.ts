// src/app/api/pathao/pickup-request/route.ts
import { NextResponse } from "next/server";

import {  Order as OrderModel } from "@/models/Order";
import { OrderPayload, PathaoOrderResponse } from "@/types/pathao";
import { createPathaoOrder } from "@/lib/pathao";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const { orderId }: { orderId: string } = await request.json();

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.pathaoStatus !== "NOT_REQUESTED") {
      return NextResponse.json(
        { message: "Pickup request has already been made for this order." },
        { status: 400 }
      );
    }

    const pathaoPayload: OrderPayload = {
      store_id: 325198, // ✅ আপনার Pathao store ID বসান
      merchant_order_id: order?.orderId || "",
      recipient_name: order.fullName,
      recipient_phone: order.phone,
      recipient_address: order.address,
      amount_to_collect: order.paytorider || 0,
      delivery_type: 48,
      item_type: 2,
      item_quantity: order.items.length,
      item_weight: "1.0",
      special_instruction: `Order ID: ${order.orderId}`,
    };

    const pathaoResponse: PathaoOrderResponse =
      await createPathaoOrder(pathaoPayload);

    // ✅ Order update + courierHistory push
    order.pathaoStatus = "REQUESTED";
    order.pathaoTrackingCode = pathaoResponse.consignment_id;

    order.courierHistory.push({
      courier: "Pathao",
      status: "REQUESTED",
      trackingCode: pathaoResponse.consignment_id,
      isPickupRequested: true,
      requestedAt: new Date(),
    });

    await order.save();

    return NextResponse.json(
      {
        message: "Pickup request successfully sent to Pathao.",
        consignmentId: pathaoResponse.consignment_id,
        trackingUrl: pathaoResponse.tracking_link,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Pathao pickup request handler:", error);
    return NextResponse.json(
      {
        message: "Failed to process pickup request.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
