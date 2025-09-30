// src/app/api/steadfast/pickup-request/route.ts
import { NextResponse } from "next/server";
import { IOrder, Order as OrderModel } from "@/models/Order";
import {
  SteadfastOrderPayload,
  SteadfastOrderResponse,
} from "@/types/steadfast";
import { connectToDatabase } from "@/lib/db";
import {
  createSteadfastOrder,
  testSteadfastConnection,
} from "@/lib/steadfastService";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    // Test connection first
    const connectionTest = await testSteadfastConnection();
    if (!connectionTest) {
      return NextResponse.json(
        {
          message:
            "Steadfast API connection failed. Check credentials and base URL.",
        },
        { status: 500 }
      );
    }

    const { orderId }: { orderId: string } = await request.json();

    const order: IOrder | null = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

 

    const payload: SteadfastOrderPayload = {
      merchant_id: "1651105",
      invoice: order.orderId || "N/A",
      recipient_name: order.fullName,
      recipient_phone: order.phone,
      recipient_address: order.address,
      cod_amount:order.paytorider || 0,
      note: `Order from A1 Romoni , Order ID: ${order.orderId}`,
      weight: "0.5",
      package_code: "P",
    };

    const steadfastResponse: SteadfastOrderResponse =
      await createSteadfastOrder(payload);

    // ✅ Update order with courierHistory
    order.pathaoStatus = "REQUESTED";
    order.pathaoTrackingCode = steadfastResponse.consignment.tracking_code;

    order.courierHistory.push({
      courier: "Steadfast",
      status: "REQUESTED",
      trackingCode: steadfastResponse.consignment.tracking_code,
      isPickupRequested: true,
      requestedAt: new Date(),
    });

    await order.save();

    return NextResponse.json(
      {
        message: "Pickup request successfully sent to Steadfast.",
        consignmentId: steadfastResponse.consignment.tracking_code,
        trackingUrl: `https://steadfast.com.bd/track-parcel/${steadfastResponse.consignment.tracking_code}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Steadfast pickup request handler:", error);
    return NextResponse.json(
      {
        message: "Failed to process pickup request.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
