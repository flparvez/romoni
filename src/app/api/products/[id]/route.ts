import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; // ✅ Import Category for safe updates
import type { IdParams } from "@/types/index";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// Helper: Safe Type Casting
// ==========================
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// ==========================
// GET → Fetch single product by ID
// ==========================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ==========================
// PUT → Update product by ID (With Business Logic)
// ==========================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const body = await req.json();
    const { id } = await params;

    // 1. Basic Validation
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Product Name and Price are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. 🟢 Business Logic: Auto Calculate Discount
    const price = safeNumber(body.price);
    const originalPrice = safeNumber(body.originalPrice);
    let finalDiscount = safeNumber(body.discount, 0);

    if (originalPrice > price) {
      finalDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    } else {
      finalDiscount = 0;
    }

    // 3. 🟢 Smart Category Handling
    // If frontend sends only ID or incomplete category data, fetch full details
    let categoryData = body.category;
    
    // Check if category is just an ID string or an object with ID
    const categoryId = typeof body.category === 'string' ? body.category : body.category?._id;

    if (categoryId) {
        // If name or slug is missing, fetch from DB to ensure data integrity
        if (!body.category?.name || !body.category?.slug) {
            const freshCategory = await Category.findById(categoryId);
            if (freshCategory) {
                categoryData = {
                    _id: freshCategory._id,
                    name: freshCategory.name,
                    slug: freshCategory.slug
                };
            }
        }
    }

    // 4. Construct the Update Fields Object
    const updateFields: Record<string, any> = {
      // Basic Info
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"), // Keep slug stable ideally
      shortName: body.shortName || "",
      description: body.description || "",
      brand: body.brand || "",
      video: body.video || "",
      warranty: body.warranty || "",

      // Pricing & Profit (Updated)
      price: price,
      originalPrice: originalPrice,
      discount: finalDiscount,
      costPrice: safeNumber(body.costPrice, 0), // 👈 Profit Tracking Logic

      // Inventory
      stock: safeNumber(body.stock),
      lowStockThreshold: safeNumber(body.lowStockThreshold, 5),
      sku: body.sku, 
      
      // Metrics
      sold: safeNumber(body.sold, 0),
      popularityScore: safeNumber(body.popularityScore, 0),
      rating: safeNumber(body.rating, 0),
      lastUpdatedIndex: Date.now(), // Force cache refresh
      advanced: safeNumber(body.advanced, 100),

      // Boolean Flags
      isFreeDelivery: Boolean(body.isFreeDelivery ?? false),
      isCombo: Boolean(body.isCombo ?? false),
      isFeatured: Boolean(body.isFeatured ?? false),
      isActive: Boolean(body.isActive ?? true),
      status: body.status || "ACTIVE",

      // Arrays
      images: Array.isArray(body.images) ? body.images : [],
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],

      // SEO
      seoTitle: body.seoTitle || body.name,
      seoDescription: body.seoDescription || "",

      // Nested Objects
      category: categoryData,
      duplicateOf: body.duplicateOf || null,
    };

    // 5. Handle Variants Safely
    if (Array.isArray(body.variants)) {
      updateFields.variants = body.variants.map((v: any) => ({
        name: v.name,
        options: Array.isArray(v.options)
          ? v.options.map((o: any) => ({
              value: o.value,
              price: o.price ? safeNumber(o.price) : undefined,
              stock: o.stock ? safeNumber(o.stock, 0) : 0,
              sku: o.sku || "",
            }))
          : [],
      }));
    } else {
      updateFields.variants = [];
    }

    // 6. Handle Combo Products
    if (body.isCombo && Array.isArray(body.comboProducts)) {
      updateFields.comboProducts = body.comboProducts
        .map((comboItem: any) => ({
          product: comboItem.product,
          quantity: safeNumber(comboItem.quantity, 1),
        }))
        .filter((item: any) => item.product);
    } else {
      updateFields.comboProducts = [];
    }

    // 7. Execute Update
    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true, // Return updated document
      runValidators: true, // Validate against Schema
    }).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 8. Revalidation (Cache Clear)
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${updatedProduct.slug}`); 

    return NextResponse.json(
      { success: true, message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// ==========================
// DELETE → Remove product by ID
// ==========================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(id).lean();

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Revalidate
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}