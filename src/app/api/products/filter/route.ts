import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search"); // NEW: Get search query
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const sort = searchParams.get("sort");
    const isFeatured = searchParams.get("isFeatured");
    const isActive = searchParams.get("isActive");

    // Start with price filter and assume only active products should be returned for public search
    const query: any = { 
      price: { $gte: minPrice, $lte: maxPrice },
      isActive: true
    };

    // 1. Implement Text Search
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search, 'i'); // Case-insensitive regex for search
      
      // Use $or to search across multiple fields
      query.$or = [
        { name: { $regex: regex } },
        { shortName: { $regex: regex } },
        // Searching within tags array
        { tags: { $in: [regex] } }, 
        // Note: For large datasets, consider using a dedicated text index for performance
      ];
    }
    
    // 2. Implement Category Filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query["category._id"] = new mongoose.Types.ObjectId(category);
    } 
    // If a category param exists but is invalid (not a Mongo ID), we return no results
    else if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json({ success: true, products: [] }, { status: 200 });
    }

    // 3. Implement Featured/Active Filters (for admin or specific use cases)
    if (isFeatured !== null) query.isFeatured = isFeatured === "true";
    if (isActive !== null) query.isActive = isActive === "true";

    let mongoQuery = Product.find(query);

    // 4. Implement Sorting
    switch (sort) {
      case "price_asc":
        mongoQuery = mongoQuery.sort({ price: 1 });
        break;
      case "price_desc":
        mongoQuery = mongoQuery.sort({ price: -1 });
        break;
      case "best_selling":
        mongoQuery = mongoQuery.sort({ sold: -1 });
        break;
      case "latest":
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
        break;
      case "popular":
        mongoQuery = mongoQuery.sort({ popularityScore: -1 });
        break;
      default:
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const products = await mongoQuery.lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error filtering products:", error);
    return NextResponse.json(
      { error: "Failed to filter products" },
      { status: 500 }
    );
  }
}
