import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import webpush from "web-push";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// If you are using a separate OrderItem model, keep this, otherwise it might be unused but I kept it as requested
import { OrderItem } from "@/models/OrderItem"; 
import { Types } from "mongoose";
import { User } from "@/models/User";
import { IPushSubscription } from "@/types";

// Prevent Next.js from caching this API route
export const dynamic = "force-dynamic";

/** ---------------- CONFIGURE WEB PUSH SAFELY ---------------- */
try {
  if (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_MAILTO
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_MAILTO,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (err) {
  console.warn("⚠ Web Push config skipped:", err);
}

/** ---------------- SALES ANALYTICS FUNCTION ---------------- */
async function getSalesAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: "DELIVERED",
      },
    },
    {
      $project: {
        totalOrderValue: { $add: ["$totalAmount", "$deliveryCharge"] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        totalSales: { $sum: "$totalOrderValue" },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: "$totalOrderValue" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

/** ---------------- GET ORDERS (PAGINATED & FILTERED) ---------------- */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // ?view=analytics

    // ✅ Analytics view (Keep existing logic)
    if (view === "analytics") {
      const analyticsData = await getSalesAnalytics();
      return NextResponse.json({ success: true, analytics: analyticsData });
    }

    // ✅ Extract Pagination & Filter Params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "ALL";
    const skip = (page - 1) * limit;

    // 1. Build Query Filter
    const query: any = {};
    if (status !== "ALL") {
      query.status = status;
    }

    // 2. Parallel Execution for Speed:
    //    a) Fetch Orders (Paginated)
    //    b) Count specific filtered orders (for pagination)
    //    c) Aggregate ALL Status Counts (for Tabs)
    const [orders, totalFilteredCount, statusStats] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items",
          populate: { path: "product", model: "Product", select: "name images" } // Optimization: Select only needed fields
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      Order.countDocuments(query),
      
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    // 3. Format Status Counts Object
    const counts: Record<string, number> = { ALL: 0 };
    let totalAll = 0;

    statusStats.forEach((stat) => {
      counts[stat._id] = stat.count;
      totalAll += stat.count;
    });
    counts["ALL"] = totalAll;

    // 4. Calculate Pagination Info
    const totalPages = Math.ceil(totalFilteredCount / limit);

    return NextResponse.json({ 
      success: true, 
      orders, 
      counts, 
      totalPages, 
      currentPage: page 
    });

  } catch (error) {
    console.error("❌ Get Orders API Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}



// ---------------- CREATE ORDER ----------------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      fullName,
      phone,
      address,
      // paymentType,
      // trxId,
      cartItems,
      paytorider,
      deliveryCharge,
      cartTotal,
    } = body;

    // ---------------- Validation ----------------
    if (
      !fullName ||
      !phone ||
      !address 
      // !paymentType

    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


    await connectToDatabase();

    // ---------------- Create Order ----------------
    const order = await Order.create({
      user: session?.user?.id ?? undefined,
      fullName,
      phone,
      address,

      // paymentType,
      // trxId: trxId,
      deliveryCharge,
      totalAmount: cartTotal + deliveryCharge,
      paytorider:paytorider,
      items: [],
      pathaoStatus: "NOT_REQUESTED",
      pathaoTrackingCode: "",
      courierHistory: [],
    });

    // ---------------- Create OrderItems ----------------
const orderItemIds = await Promise.all(
  cartItems.map(async (item: any) => {
    const orderItem = await OrderItem.create({
      order: order._id,
      product: new Types.ObjectId(item.productId),
      quantity: item.quantity,
      price: item.price,
      selectedVariantOptions: item.selectedVariantOptions || {},
    });
    return orderItem._id;
  })
);

    order.items = orderItemIds;
    await order.save();

    // ---------------- Send Push Notifications ----------------
    try {
      const admins = await User.find({ role: "ADMIN" }).lean();

      const payload = JSON.stringify({
        title: "New Order Received",
        body: `Order #${order.orderId} by ${order.fullName}. Total: ৳${order.totalAmount}`,
        data: {
          orderId: order._id.toString(),
          customerName: order.fullName,
        },
      });

      const notificationPromises =
        admins.flatMap((admin) =>
          admin.subscriptions?.map((sub: IPushSubscription) =>
            webpush.sendNotification(sub, payload).catch((err) => {
              console.error("Push failed:", err.message);
            })
          ) ?? []
        ) || [];

      await Promise.all(notificationPromises);
    } catch (pushError) {
      console.error("Push notification failed:", pushError);
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
