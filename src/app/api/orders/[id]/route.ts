import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

import { Product } from "@/models/Product";
import { OrderItem } from "@/models/OrderItem";

/** ---------------- UPDATE ORDER ---------------- */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { status, address, note, fullName, phone, cartItems, paytorider } = body;

    await connectToDatabase();

    // ✅ Validate order exists first
    const existingOrder = await Order.findById(id).populate("items");
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ Build update object - only include fields that are provided
    const updateData: any = {};
    if (status && status !== existingOrder.status) updateData.status = status;
    
    if (address && address !== existingOrder.address) updateData.address = address;
    if (note !== undefined) updateData.note = note; // allow empty string
   
    if (fullName && fullName !== existingOrder.fullName) updateData.fullName = fullName;
    if (phone && phone !== existingOrder.phone) updateData.phone = phone;
    if (paytorider && paytorider !== existingOrder.paytorider) updateData.paytorider = paytorider;

    // ✅ Handle status-specific logic
    if (status && status !== existingOrder.status) {
      if (status === "CANCELLED") {
        updateData.pathaoStatus = "CANCELLED";
        updateData.pathaoTrackingCode = null;
      } else if (status === "DELIVERED") {
        updateData.pathaoStatus = "DELIVERED";
      } else if (status === "SHIPPED" && existingOrder.pathaoStatus === "NOT_REQUESTED") {
        updateData.pathaoStatus = "REQUESTED";
      }

      // Add courier history entry
      const courierHistoryEntry = {
        courier: "ADMIN_UPDATE",
        status: status,
        requestedAt: new Date(),
      };
      updateData.$push = { courierHistory: courierHistoryEntry };
    }

    // ---------------- Update OrderItems if cartItems provided ----------------
    if (cartItems && Array.isArray(cartItems)) {
      for (const item of cartItems) {
        // update each order item by its id
        if (!item._id) continue;
        await OrderItem.findByIdAndUpdate(
          item._id,
          {
            quantity: item.quantity,
            price: item.price,
            selectedVariantOptions: item.selectedVariantOptions || {},
          },
          { new: true, runValidators: true }
        );
      }
    }

    // ✅ Only proceed if there are actual changes
    if (Object.keys(updateData).length > 0) {
      const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("items");

      if (!updatedOrder) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: "Order updated successfully",
      });
    }

    return NextResponse.json({
      success: true,
      order: existingOrder,
      message: "No changes detected",
    });
  } catch (error: any) {
    console.error("Order update error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 });
    }

    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 });
  }
}

/** ---------------- GET SINGLE ORDER ---------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
    //  get products


  try {
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let query: any = { _id: id };

    // ✅ If filtering by status (useful for tabs)
    if (statusFilter) {
      query = { ...query, status: statusFilter.toUpperCase() };
    }

    const order = await Order.findOne(query)
      .populate({
        path: "items",
        model: OrderItem,
        populate: {
          path: "product",
          model: Product,
          select: "name price images",
        },
      })
      // .populate("user", "name email");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve order:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** ---------------- DELETE ORDER ---------------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await connectToDatabase();

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
