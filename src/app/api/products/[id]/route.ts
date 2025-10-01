import { IdParams } from "@/app/admin/orders/[id]/page";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Params } from "@/types/product";

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
// Define the expected types for the request body
interface IVariantOption {
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
}

interface IVariant {
  name: string;
  options: IVariantOption[];
}
// Helper function to safely cast to number
const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};


// ==========================
// GET → Fetch single product by ID
// ==========================
export async function GET(
  req: NextRequest,
  { params }:IdParams
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT → Update product by ID
// ==========================
export async function PUT(
  req: NextRequest,
  { params }: IdParams
) {
  try {
    const body = await req.json();
  const { id } = await params;

    if (!body.name || !body.price || !body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or images empty" },
        { status: 400 }
      );
    }

    await connectToDatabase();
// 2. Construct the Update Fields Object
    // Use an interface for updateFields if available, or 'Record<string, any>'
    const updateFields: Record<string, any> = {
      // Basic Fields
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      shortName: body.shortName || "",
      description: body.description || "",
      warranty: body.warranty || "",
      video: body.video || "",

      // Numeric Fields with Type Casting
      price: safeNumber(body.price),
displayPrice: body.displayPrice ? Number(body.displayPrice) : Number(body.price),
      
      originalPrice: body.originalPrice || 0,
      stock: safeNumber(body.stock),
      sold: safeNumber(body.sold, 0), // Default to 0 if not provided
      popularityScore: safeNumber(body.popularityScore, 0),
      rating: safeNumber(body.rating, 0),
      lastUpdatedIndex: body.lastUpdatedIndex ? safeNumber(body.lastUpdatedIndex) : undefined,
      advanced: safeNumber(body.advanced, 100),

      // Boolean Fields
      isFreeDelivery: Boolean(body.isFreeDelivery ?? false),
      isCombo: Boolean(body.isCombo ?? false),
      isFeatured: Boolean(body.isFeatured ?? false),
      isActive: Boolean(body.isActive ?? true),

      // Array Fields (Ensure they are arrays)
      images: Array.isArray(body.images) ? body.images : [], // Type: IProductImage[]
      specifications: Array.isArray(body.specifications) ? body.specifications : [], // Type: AttributeSchema
      seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [], // Type: IReview[] - assuming this type, update as necessary

      // SEO & Status
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      status: body.status || "ACTIVE", // Should be one of the enum values
      
      // Category (Nested Object) - Ensure all fields are present or removed
      category: body.category && body.category._id ? {
          _id: body.category._id,
          name: body.category.name || "",
          slug: body.category.slug || "",
      } : null,
      
      // DuplicateOf (ObjectId)
      duplicateOf: body.duplicateOf || null,
    };
    
    // 3. Handle Variants (Complex Nested Array)
    if (Array.isArray(body.variants)) {
        const filteredVariants: IVariant[] = body.variants.filter(
            (v: IVariant) => v.name && v.options?.length > 0
        );

        updateFields.variants = filteredVariants.map((v) => ({
            name: v.name,
            options: Array.isArray(v.options)
                ? v.options.map((o: IVariantOption) => ({
                    value: o.value,
                    price: o.price ? safeNumber(o.price) : undefined,
                    stock: o.stock ? safeNumber(o.stock, 0) : 0,
                    sku: o.sku || "",
                }))
                : [],
        }));
    } else {
        // If 'variants' is explicitly null or undefined in the body, remove it from the document
        updateFields.variants = []; 
    }

    // 4. Handle Combo Products
    if (body.isCombo && Array.isArray(body.comboProducts)) {
        updateFields.comboProducts = body.comboProducts.map((comboItem: any) => ({
            product: comboItem.product, // Assuming this is a valid ObjectId
            quantity: safeNumber(comboItem.quantity, 1),
        })).filter((item: any) => item.product); // Filter out any items without a product ID
    } else {
        updateFields.comboProducts = []; // Clear combo products if not a combo or data is missing
    }


    // 5. Mongoose Update Operation
    // Use $set and $unset if you need partial updates, but for a full PUT, setting all fields is standard.
    // The `new: true` option returns the updated document.
    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true, // Crucial for enforcing schema rules during update
    }).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 6. Revalidation (Next.js Cache Management)
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${updatedProduct.slug}`); // Revalidate the product detail page

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
// ==========================
// DELETE → Remove product by ID
// ==========================
export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
    const {id} = (await params)
  try {
    await connectToDatabase();
    const deletedProduct = await Product.findByIdAndDelete(id).lean();

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json(
      { success: true, product: deletedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
