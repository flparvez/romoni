import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { IdParams } from "@/types/index";



// ==========================
// GET /api/category/[id]
// ==========================
export async function GET(_req: NextRequest, { params }: IdParams) {
  const { id } = await params;
  try {
    await connectToDatabase();
    const category = await Category.findById(id)
      .populate("parentCategory", "name slug")
      .populate("subcategories", "name slug")
      .lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("GET Category Error:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// ==========================
// PUT /api/category/[id]
// ==========================
export async function PUT(req: NextRequest, { params }: IdParams) {
    const { id } = await params;
  try {
    await connectToDatabase();
    const body = await req.json();

    // Normalize parentCategory
    const parentCategory = body.parentCategory === "none" ? null : body.parentCategory;

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          name: body.name,
          slug: body.slug,
          description: body.description,
          images: body.images,
          tags: body.tags ?? [],
          parentCategory,
          isFeatured: body.isFeatured,
          isActive: body.isActive,
          seoTitle: body.seoTitle,
          seoDescription: body.seoDescription,
          seoKeywords: body.seoKeywords ?? [],
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// ==========================
// DELETE /api/category/[id]
// ==========================
export async function DELETE(_req: NextRequest, { params }: IdParams) {
    const { id } = await params;
  try {
    await connectToDatabase();
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
