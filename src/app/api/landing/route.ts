import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LandingPageContent, ILandingPageContent } from "@/models/Landing";
import mongoose from "mongoose";

const sortByOrder = <T extends { order: number }>(arr?: T[]) => (Array.isArray(arr) ? [...arr].sort((a, b) => a.order - b.order) : []);
const normalizeSections = (sections?: ILandingPageContent["sections"]) =>
  Array.isArray(sections)
    ? sections.map(s => ({ ...s, bulletPoints: sortByOrder(s.bulletPoints) })).sort((a, b) => a.order - b.order)
    : [];

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body?.pageIdentifier) {
      return NextResponse.json({ error: "pageIdentifier is required" }, { status: 400 });
    }

    const pageIdentifier = String(body.pageIdentifier).trim().toLowerCase();

    const exists = await LandingPageContent.findOne({ pageIdentifier }).lean();
    if (exists) return NextResponse.json({ error: "pageIdentifier already exists" }, { status: 409 });

    const products = Array.isArray(body.products)
      ? body.products
          .map((id: unknown) => (mongoose.Types.ObjectId.isValid(String(id)) ? new mongoose.Types.ObjectId(String(id)) : null))
          .filter(Boolean) as mongoose.Types.ObjectId[]
      : [];

    const doc = await new LandingPageContent({
      pageIdentifier,
      isDeliveryChargeFree: !!body.isDeliveryChargeFree,
      heroTitle: body.heroTitle ?? "Your Product Title",
      heroSubtitle: body.heroSubtitle ?? "",
      logoUrl: body.logoUrl ?? "",
      ctaText: body.ctaText ?? "Order Now",
      products,
      sections: normalizeSections(body.sections),
      contactNumber: body.contactNumber ?? "01XXXXXXXX",
      workingHours: body.workingHours ?? "10 AM - 10 PM (Daily)",
      faqTitle: body.faqTitle ?? "Frequently Asked Questions",
      faqData: sortByOrder(body.faqData),
      footerText: body.footerText ?? "© Your Company. All rights reserved.",
      theme: body.theme ?? undefined,
      seo: body.seo ?? undefined,
    }).save();

    return NextResponse.json({ success: true, landing: doc }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create landing page" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const pages = await LandingPageContent.find().sort({ updatedAt: -1 }).lean<ILandingPageContent[]>();
    return NextResponse.json({ success: true, pages }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch landing pages" }, { status: 500 });
  }
}
