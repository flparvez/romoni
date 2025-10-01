// app/api/products/bulk-price-update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { percentage } = body;

    // Validate input
    if (typeof percentage !== "number") {
      return NextResponse.json(
        { error: "Percentage must be a number." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateFactor = 1 + percentage / 100;

    // Use updateMany with an aggregation pipeline for efficiency
    // This updates 'displayPrice' based on the current 'price' field for all documents.
    const result = await Product.updateMany(
      {}, // An empty filter matches all documents
      [
        {
          $set: {
            displayPrice: {
              // Calculate the new price and round it to the nearest integer
              $round: [{ $multiply: ["$price", updateFactor] }, 0],
            },
          },
        },
      ]
    );

    if (result.modifiedCount > 0) {
      // Revalidate cache for all relevant pages
      revalidatePath("/");
      revalidatePath("/admin/products");
      // You should also revalidate specific category pages if you have them
    }

    return NextResponse.json(
      {
        success: true,
        message: `${result.modifiedCount} products updated successfully.`,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error during bulk price update:", error);
    return NextResponse.json(
      { error: "Failed to update product prices." },
      { status: 500 }
    );
  }
}