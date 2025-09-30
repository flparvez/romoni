
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

import { revalidatePath } from "next/cache";

import { NextRequest, NextResponse } from "next/server";

// ==========================
export async function GET(
  req: NextRequest,
  { params }: {params : Promise<{slug: string}>} 
) {
    const {slug} = (await params)
  try {
    await connectToDatabase();
    const product = await Product.findOne({slug}).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}