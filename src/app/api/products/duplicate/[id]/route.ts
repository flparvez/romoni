import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import type { IdParams } from "@/types/index";

export async function POST(req: NextRequest, { params }: IdParams) {
  try {
    await connectToDatabase();
  const {id} = (await params)

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const duplicated = new Product({
      ...product.toObject(),
      _id: undefined, // MongoDB will generate new _id
      slug: product.slug + "-copy-" + Date.now(), // unique slug
      name: product.name + " (Copy)",
      isActive: false, // optional: duplicated product is inactive by default
    });

    await duplicated.save();
    return NextResponse.json({ success: true, product: duplicated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to duplicate product" }, { status: 500 });
  }
}
