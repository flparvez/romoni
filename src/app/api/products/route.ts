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

    if (!body.name || !body.price || !body.images?.length || !body.category?._id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Prevent duplicate slug
    const baseSlug = slugify(body.name, { lower: true });
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = new Product({
      name: body.name,
      slug,
      shortName: body.shortName || "",
      description: body.description || "",
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      stock: Number(body.stock || 0),
      category: body.category,
      brand: body.brand || "",
      video: body.video || "",
      warranty: body.warranty || "7 day replacement warranty",
      images: Array.isArray(body.images) ? body.images : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      rating: Number(body.rating || 0),
      isFeatured: Boolean(body.isFeatured),
      isActive: Boolean(body.isActive ?? true),
      seoTitle: body.seoTitle || body.name,
      seoDescription: body.seoDescription || "",
      seoImage: body.seoImage || body.images?.[0]?.url || "",
      // ✅ Variants (safe mapping)
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

    // Revalidate only necessary pages
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// ==========================
// ==========================
// GET → Fetch Paginated Products (Supports slug or category id)
// =============================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const rawPage = searchParams.get("page"); // <-- important
    const page = Number(rawPage) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const query: any = {};

    /** 🔍 Search Filter */
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { shortName: regex },
        { tags: regex }
      ];
    }

    /** 🟦 CATEGORY FILTER (Slug OR ObjectId) */
    if (category) {
      const isMongoId = /^[a-f\d]{24}$/i.test(category);
      if (isMongoId) {
        query["category._id"] = category;
      } else {
        query["category.slug"] = category;
      }
    }

    /** 🟩 Active Filter */
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }
/** ------------------------------------------------
 * 🟧 Determine sort order 
 * ------------------------------------------------*/
let sortOption: any = { createdAt: -1 }; // default sort

const hasFilters =
  (search && search.trim() !== "") ||
  (category && category.trim() !== "") ||
  page !== 1 ||
  isActive !== null;

// ✔ If NO filters + limit=18 → prioritize lastUpdatedIndex
if (limit === 18) {
  sortOption = { lastUpdatedIndex: -1 };
}


    /** 🟦 Fetch paginated products */
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

  

    return NextResponse.json(
      {
        success: true,
        products,
        currentPage: page,
        totalPages,
        totalCount,
       
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
