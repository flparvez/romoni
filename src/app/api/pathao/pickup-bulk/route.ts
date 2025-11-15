import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order as OrderModel } from "@/models/Order";
import { createPathaoOrder } from "@/lib//pathao"; // assume you have similar helpers
import { ICourierHistory } from "@/types";

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { orderIds } = await req.json() as { orderIds: string[] };
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "orderIds required" }, { status: 400 });
    }

  
    const orders = await OrderModel.find({ _id: { $in: orderIds } });

    const results = await Promise.allSettled(
      orders.map(async (order) => {
        const alreadyRequested =
  order.courierHistory?.some((h: ICourierHistory) => h.isPickupRequested) ?? false;

        if (alreadyRequested) {
          return { orderId: String(order._id), ok: false, message: "Already pickup requested" };
        }

        // build payload with your existing pathao logic/fields
        const resp = await createPathaoOrder(order); // ← implement using your existing single pickup route internals

        order.courierHistory.push({
          courier: "Pathao",
          status: "REQUESTED",
          trackingCode: resp.consignment_id,
          isPickupRequested: true,
          requestedAt: new Date(),
        });
        await order.save();

        return { orderId: String(order._id), ok: true, message: "OK" };
      })
    );

    const normalized = results.map((r, idx) =>
      r.status === "fulfilled" ? r.value : { orderId: String(orders[idx]?._id), ok: false, message: (r as any).reason?.message || "Failed" }
    );

    return NextResponse.json({ success: true, results: normalized }, { status: 200 });
  } catch (e: any) {
    console.error("Pathao bulk error:", e);
    return NextResponse.json({ error: e.message || "Bulk failed" }, { status: 500 });
  }
}
