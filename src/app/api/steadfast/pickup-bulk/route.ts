import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order as OrderModel } from "@/models/Order";
import { createSteadfastOrder, testSteadfastConnection } from "@/lib/steadfastService";
import type { SteadfastOrderPayload, SteadfastOrderResponse } from "@/types/steadfast";
import { ICourierHistory } from "@/types";

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { orderIds } = await req.json() as { orderIds: string[] };
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "orderIds required" }, { status: 400 });
    }

    const okConn = await testSteadfastConnection();
    if (!okConn) {
      return NextResponse.json({ error: "Steadfast API connection failed" }, { status: 500 });
    }

    const orders = await OrderModel.find({ _id: { $in: orderIds } });

    const results = await Promise.allSettled(
      orders.map(async (order) => {
        // skip if already pickup requested
const alreadyRequested = order.courierHistory.some(
  (h: ICourierHistory) => h.isPickupRequested
);

        if (alreadyRequested) {
          return { orderId: String(order._id), ok: false, message: "Already pickup requested" };
        }

        const payload: SteadfastOrderPayload = {
          merchant_id: "1651105",
          invoice: order.orderId || "N/A",
          recipient_name: order.fullName,
          recipient_phone: order.phone,
          recipient_address: order.address,
          cod_amount: order.paytorider || 0,
          note: `Order from A1 Romoni , Order ID: ${order.orderId}`,
          weight: "0.5",
          package_code: "P",
        };

        const resp: SteadfastOrderResponse = await createSteadfastOrder(payload);

        // update order
        order.pathaoStatus = "REQUESTED"; // kept to match your single route
        order.pathaoTrackingCode = resp.consignment.tracking_code;
        order.courierHistory.push({
          courier: "Steadfast",
          status: "REQUESTED",
          trackingCode: resp.consignment.tracking_code,
          isPickupRequested: true,
          requestedAt: new Date(),
        });
        await order.save();

        return { orderId: String(order._id), ok: true, message: resp.consignment.tracking_code || "OK" };
      })
    );

    const normalized = results.map((r, idx) =>
      r.status === "fulfilled" ? r.value : { orderId: String(orders[idx]?._id), ok: false, message: (r as any).reason?.message || "Failed" }
    );

    return NextResponse.json({ success: true, results: normalized }, { status: 200 });
  } catch (e: any) {
    console.error("Steadfast bulk error:", e);
    return NextResponse.json({ error: e.message || "Bulk failed" }, { status: 500 });
  }
}
