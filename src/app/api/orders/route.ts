import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { IOrderItem, OrderItem } from "@/models/OrderItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";
import { User, IPushSubscription } from "@/models/User";
import webpush from "web-push";

// Configure web-push
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



// ---------------- CREATE ORDER ----------------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      fullName,
      phone,
      address,
      paymentType,
      trxId,
      cartItems,
      paytorider,
      deliveryCharge,
      cartTotal,
    } = body;

    // ---------------- Validation ----------------
    if (
      !fullName ||
      !phone ||
      !address ||
      !paymentType

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

      paymentType,
      trxId: trxId,
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



/** ---------------- SALES ANALYTICS ---------------- */
async function getSalesAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: "DELIVERED",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: { $add: ["$totalAmount", "$deliveryCharge"] } },
        orderCount: { $sum: 1 },
        averageOrderValue: {
          $avg: { $add: ["$totalAmount", "$deliveryCharge"] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

/** ---------------- GET ORDERS ---------------- */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    // Analytics View
    if (view === "analytics") {
      const analyticsData = await getSalesAnalytics();
      return NextResponse.json(
        { success: true, analytics: analyticsData },
        { status: 200 }
      );
    }

    // Orders List
    const orders = await Order.find({})
      .populate({
        path: "items",
        populate: { path: "product", model: "Product" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}