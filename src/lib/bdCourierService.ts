const BD_COURIER_API_BASE_URL = "https://bdcourier.com/api/courier-check";
const BD_COURIER_API_KEY = process.env.BD_COURIER_API_KEY;

if (!BD_COURIER_API_KEY) {
  console.warn("⚠️ BD Courier API key missing in environment variables");
}

export interface BDCourierFraudCheckPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_amount: number;
  order_id: string;
  merchant_id?: string;
}

export interface BDCourierFraudCheckResponse {
  success: boolean;
  fraud_score?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  reasons?: string[];
  recommendation?: "PROCEED" | "REVIEW" | "CANCEL";
  details?: {
    phone_blacklisted?: boolean;
    address_issues?: string[];
    previous_chargebacks?: number;
    trust_score?: number;
  };
  error?: string;
  message?: string;
}

export async function checkFraudWithBDCourier(
  payload: BDCourierFraudCheckPayload
): Promise<BDCourierFraudCheckResponse> {
  if (!BD_COURIER_API_KEY) {
    throw new Error("BD Courier API key not configured in environment variables.");
  }

  try {
    const response = await fetch(BD_COURIER_API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BD_COURIER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        
        phone: payload.customer_phone,
       
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = text;
      try {
        const errJson = JSON.parse(text);
        errorMessage = errJson.message || errJson.error || text;
      } catch (_) {}
      throw new Error(`BD Courier API error (${response.status}): ${errorMessage}`);
    }

    return JSON.parse(text) as BDCourierFraudCheckResponse;
  } catch (err: any) {
    throw new Error(err.message || "BD Courier fraud check request failed");
  }
}


export async function testBDCourierConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    const testPayload: BDCourierFraudCheckPayload = {
      customer_name: "Test Customer",
      customer_phone: "01700000000",
      customer_address: "Test Address, Dhaka",
      order_amount: 1000,
      order_id: "TEST123",
    };

    await checkFraudWithBDCourier(testPayload);
    return { connected: true, message: "✅ Connection successful" };
  } catch (err: any) {
    return { connected: false, message: err.message || "❌ Connection failed" };
  }
}
