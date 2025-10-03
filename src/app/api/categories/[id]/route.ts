import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { IdParams } from "@/app/admin/orders/[id]/page";

// GET single category by ID
export async function GET(
  req: NextRequest,
  { params }: IdParams 
) {
  const { id } = await params;
  try {
    await connectToDatabase();

    const category = await Category.findById(id)
      .populate("parentCategory", "name slug")
      .populate("subcategories", "name slug");

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(
  req: NextRequest,
  { params }: IdParams
) {
  const { id } = await params;
  try {
    const body = await req.json();

    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // ✅ Normalize parentCategory
    let parentCategory = null;
    if (body.parentCategory && body.parentCategory !== "none") {
      parentCategory = body.parentCategory;
    }

 

    category.name = body.name ?? category.name;
    category.slug = body.slug ?? category.slug;
    category.description = body.description ?? category.description;
    category.images = body.images || category.images;
    category.tags = Array.isArray(body.tags) ? body.tags : category.tags;
    category.parentCategory = parentCategory;
    category.isFeatured = body.isFeatured ?? category.isFeatured;
    category.isActive = body.isActive ?? category.isActive;
    category.lastIndex = body.lastIndex ?? category.lastIndex;
    category.seoTitle = body.seoTitle ?? category.seoTitle;
    category.seoDescription = body.seoDescription ?? category.seoDescription;
    category.seoKeywords = Array.isArray(body.seoKeywords)
      ? body.seoKeywords
      : category.seoKeywords;

    await category.save();

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  req: NextRequest,
  { params }: IdParams
) {
  const { id } = await params;
  try {
    await connectToDatabase();

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
