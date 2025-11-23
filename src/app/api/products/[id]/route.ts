import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; // ✅ Import Category model for lookup
import slugify from "slugify";

// ==========================================
// POST → Create New Product (Business Ready)
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    // 1. Basic Validation
    if (!body.name || !body.price || !body.images?.length || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields (Name, Price, Image, Category)" },
        { status: 400 }
      );
    }

    // 2. ✅ Fetch Category Details (Crucial for Speed optimization)
    // We store category name/slug inside product to avoid 'populate' queries later
    const categoryDetails = await Category.findById(body.category);
    if (!categoryDetails) {
      return NextResponse.json({ error: "Invalid Category ID" }, { status: 400 });
    }

    // 3. ✅ Smart Slug Generation (Avoids Collision)
    const baseSlug = slugify(body.name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    // 4. Create Product Object
    const product = new Product({
      name: body.name,
      slug,
      shortName: body.shortName || "",
      description: body.description || "",
      
      // Pricing & Profit
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      costPrice: Number(body.costPrice || 0), // 👈 Profit Tracking

      // Inventory
      stock: Number(body.stock || 0),
      lowStockThreshold: Number(body.lowStockThreshold || 5), // 👈 Stock Alert
      sku: body.sku || `SKU-${Date.now().toString().slice(-6)}`, // Auto SKU if missing

      // Optimized Category Embedding
      category: {
        _id: categoryDetails._id,
        name: categoryDetails.name,
        slug: categoryDetails.slug,
      },

      brand: body.brand || "",
      video: body.video || "",
      warranty: body.warranty || "7 days replacement warranty",
      
      images: Array.isArray(body.images) ? body.images : [],
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      
      rating: Number(body.rating || 0),
      isFeatured: Boolean(body.isFeatured),
      isActive: Boolean(body.isActive ?? true),
      status: body.status || "ACTIVE",
      
      seoTitle: body.seoTitle || body.name,
      seoDescription: body.seoDescription || "",
      seoKeywords: body.seoKeywords || [],

      // Variants Handling
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
        
      lastUpdatedIndex: Date.now(),
    });

    await product.save();

    // 5. Revalidate Cache (Frontend will update instantly)
    revalidatePath("/admin/products");
    revalidatePath("/"); // Homepage
    revalidatePath("/products");

    return NextResponse.json({ success: true, message: "Product Created Successfully", product }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

// =============================================================
// GET → Fetch Paginated Products (Search, Filter, Sort)
// =============================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status"); // DRAFT | ACTIVE | ARCHIVED
    const fields = searchParams.get("fields"); // Select specific fields

    const query: any = {};

    /** 🔍 Optimized Search (Regex for partial match) */
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { shortName: regex },
        { sku: regex }, // 👈 Added SKU Search
        { "category.name": regex }
      ];
    }

    /** 🟦 Category Filter */
    if (category) {
      // Check if it's an ID or Slug
      const isMongoId = /^[a-f\d]{24}$/i.test(category);
      if (isMongoId) {
        query["category._id"] = category;
      } else {
        query["category.slug"] = category;
      }
    }

    /** 🟩 Status Filter */
    if (status) {
      query.status = status;
    } else {
    
         query.status = "ACTIVE";
         query.isActive = true;
    
    }

    /** 🟧 Sorting Logic */
    let sortOption: any = { createdAt: -1 }; // Default Newest First
    const sortParam = searchParams.get("sort");

    if (sortParam === "price_asc") sortOption = { price: 1 };
    if (sortParam === "price_desc") sortOption = { price: -1 };
    if (sortParam === "sold") sortOption = { sold: -1 }; // Best Sellers
    if (limit === 18 || limit === 100) sortOption = { lastUpdatedIndex: -1 }; // Custom Logic

    /** ⚡ Field Selection (Projection) */
    let selectFields = "";
    if (fields) {
      selectFields = fields.split(",").join(" ");
    }

    /** 🚀 Execute Query */
    const productsQuery = Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select(selectFields)
      .lean(); // .lean() converts Mongoose doc to Plain JS Object (Much Faster)

    const [products, totalCount] = await Promise.all([
      productsQuery,
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        products,
        meta: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
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