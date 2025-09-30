import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { OrderItem } from "@/models/OrderItem";

export async function GET(request: NextRequest) {

     await connectToDatabase();
  try {
 
       await Product.find({}).lean();
       await Order.find({}).lean();
       await OrderItem.find({}).lean();
    // ✅ Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // ✅ Build filter
    const filter: any = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }

    // ✅ Fetch orders
    const orders = await Order.find(filter)
        .populate({
             path: "items",
             model: OrderItem,
             populate: {
               path: "product",
               model: Product,
               select: "name price images",
             },
           })
           .populate("user", "name email").sort({ createdAt: -1 })
      .lean();

    // ✅ Aggregation for counts
    const countsAgg = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation result into dictionary
    const counts: Record<string, number> = { ALL: 0 };
    let total = 0;
    countsAgg.forEach((c) => {
      if (c._id) {
        counts[c._id] = c.count;
        total += c.count;
      }
    });
    counts.ALL = total;

    return NextResponse.json({ success: true, orders, counts });
  } catch (error: any) {
    console.error("❌ Get orders error:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
