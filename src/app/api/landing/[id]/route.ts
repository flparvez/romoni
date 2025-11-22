import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LandingPageContent } from "@/models/Landing";

import type { IProduct } from "@/types/index";
import "@/models/Product";
import { Product } from "@/models/Product";

export interface IParams  { params: Promise<{ id: string }> }
// ---- Helpers ----
const sortByOrder = <T extends { order?: number }>(arr?: T[]) =>
  Array.isArray(arr) ? [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

const normalizeSections = (sections?: any[]) =>
  Array.isArray(sections)
    ? sections
        .map((s) => ({
          ...s,
          bulletPoints: sortByOrder(s.bulletPoints),
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

// ---- GET Landing Page ----
export async function GET(
  _req: NextRequest,
  { params }:IParams
) {
  const { id } = await params;
  try {
    await connectToDatabase();

const landing = await LandingPageContent.findById(id)
  .populate("products")
  .lean();

    if (!landing) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, landing }, { status: 200 });
  } catch (error) {
    console.error("GET Landing Error:", error);
    return NextResponse.json({ error: "Failed to fetch landing page" }, { status: 500 });
  }
}

// ---- UPDATE Landing Page ----
export async function PATCH(
  req: NextRequest,
  { params }: IParams
) {

   const { id } = await params;
  try {
    await connectToDatabase();
    const body = await req.json();

    const updates: Record<string, unknown> = { ...body };

    // Normalize sections & FAQ
    if (Array.isArray(body.sections)) updates.sections = normalizeSections(body.sections);
    if (Array.isArray(body.faqData)) updates.faqData = sortByOrder(body.faqData);

    // Normalize products array
if (Array.isArray(body.products)) {
  updates.products = body.products; // <-- store full product objects
}


    const updated = await LandingPageContent.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate<{ products: IProduct[] }>("products", "_id name price slug images stock isActive")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, landing: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH Landing Error:", error);
    return NextResponse.json({ error: "Failed to update landing page" }, { status: 500 });
  }
}

// ---- DELETE Landing Page ----
export async function DELETE(
  _req: NextRequest,
  { params }:IParams
) {
   const { id } = await params;
  try {
    await connectToDatabase();

    const deleted = await LandingPageContent.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Landing page deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Landing Error:", error);
    return NextResponse.json({ error: "Failed to delete landing page" }, { status: 500 });
  }
}
