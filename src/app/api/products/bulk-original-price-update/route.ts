// app/api/products/bulk-original-price-update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { percentage } = body;

    if (typeof percentage !== "number" || percentage <= 0) {
      return NextResponse.json(
        { error: "Percentage must be a positive number." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateFactor = 1 + percentage / 100;

    // This expression calculates the new originalPrice
    const newOriginalPriceExpr = {
      $round: [{ $multiply: ["$price", updateFactor] }, 0],
    };

    const result = await Product.updateMany(
      {}, // Empty filter to match all products
      [
        {
          $set: {
            originalPrice: newOriginalPriceExpr,
            // Recalculate the discount in the same operation
            discount: {
              $cond: {
                if: { $gt: [newOriginalPriceExpr, 0] }, // Avoid division by zero
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $subtract: [newOriginalPriceExpr, "$price"] },
                            newOriginalPriceExpr,
                          ],
                        },
                        100,
                      ],
                    },
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ]
    );

    if (result.modifiedCount > 0) {
      revalidatePath("/");
      revalidatePath("/admin/products");
    }

    return NextResponse.json(
      {
        success: true,
        message: `${result.modifiedCount} products' original prices were updated.`,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error during bulk original price update:", error);
    return NextResponse.json(
      { error: "Failed to update product prices." },
      { status: 500 }
    );
  }
}