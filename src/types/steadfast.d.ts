export interface SteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string; // This is a Steadfast specific field
 recipient_address: string;
  cod_amount: number;
  note: string;
  weight: string;
  package_code: string;
  merchant_id: string;
  // You will need to map your data to these fields
}

export interface SteadfastOrderResponse {
  status: number;
  consignment: {
    consignment_id: string;
    tracking_code: string;
  };
}

export interface SteadfastLocation {
  id: number;
  name: string;
}
