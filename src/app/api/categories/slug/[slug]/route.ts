import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";

// GET single category by slug
export async function GET(
  req: NextRequest,
  { params }: {
  params: Promise<{ slug: string }>;
} 
) {
  const { slug } = await params;
  try {
    await connectToDatabase();

    const category = await Category.findOne({ slug })
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
