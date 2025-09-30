// app/api/fraud-check/phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkFraudWithBDCourier } from "@/lib/bdCourierService";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Fake order payload for fraud check
    const payload = {
      customer_name: "Unknown",
      customer_phone: phone.trim(),
      customer_address: "N/A",
      order_amount: 0,
      order_id: `CHECK-${Date.now()}`,
    };

    const result = await checkFraudWithBDCourier(payload);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Fraud check failed" },
      { status: 500 }
    );
  }
}
