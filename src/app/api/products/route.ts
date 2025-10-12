import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import slugify from "slugify";
// ==========================
// POST → Create New Product
// ==========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    if (!body.name  || !body.images?.length || !body.category?._id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = new Product({
      name: body.name,
      slug: slugify(body.name, { lower: true, strict: true }),
      shortName: body.shortName || "",
      description: body.description || "",
      price: Number(body.price),

      displayPrice: body.displayPrice ? Number(body.displayPrice) : Number(body.price),
      
      originalPrice: body.originalPrice || body.displayPrice + 250,
      discount: body.discount || 0,
      stock: Number(body.stock || 0),
      category: body.category,
      
      video: body.video || "",
      lastUpdatedIndex: body.lastUpdatedIndex || "",
      warranty: body.warranty || "7 day replacement warranty",
      images: Array.isArray(body.images) ? body.images : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      rating: Number(body.rating || 0),
      isFeatured: Boolean(body.isFeatured),
      isActive: Boolean(body.isActive ?? true),
      sku: body.sku || "", 
  // ✅ Add variants
  variants: Array.isArray(body.variants)
    ? body.variants.map((v: any) => ({
        name: v.name,
        options: Array.isArray(v.options)
          ? v.options.map((o: any) => ({
              value: o.value,
              price: o.price ? Number(o.price) : undefined,
              stock: o.stock ? Number(o.stock) : 0,
              sku: o.sku || "",
            }))
          : [],
      }))
    : [],

    });

    await product.save();

    // Revalidate cache
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// ==========================
// GET → Fetch All Products
// ==========================
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find()
      .sort({ lastUpdatedIndex: -1 })
      .lean();

const latestUpdate = products.reduce((latest, product) => {
  const updatedAt = product.updatedAt ?? product.createdAt ?? new Date(0);
  return updatedAt > latest ? updatedAt : latest;
}, new Date(0));

  
    
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json(

      { success: true, products, latestUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
