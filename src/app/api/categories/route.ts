import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { IProductImage } from "@/types/iproduct";

// GET all categories (with parent + subcategories)
export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({})
      .populate("parentCategory", "name slug")
      .populate("subcategories", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ categories, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST create category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Category.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    let parentCategory = null;
    if (body.parentCategory && body.parentCategory !== "none") {
      parentCategory = body.parentCategory;
    }

    // ✅ FIX: Map the incoming image URLs to the correct object format
    const categoryImages = Array.isArray(body.images) 
      ? body.images.map((url: string): IProductImage => ({ url })) 
      : [];

    const category = new Category({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      images: categoryImages, // ✅ Use the correctly formatted array
      tags: Array.isArray(body.tags) ? body.tags : [],
      parentCategory,
      isFeatured: Boolean(body.isFeatured),
      isActive: Boolean(body.isActive ?? true),
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
    });

    await category.save();

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error.message || error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}