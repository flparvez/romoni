export interface PathaoAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface OrderPayload {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  amount_to_collect: number;
  delivery_type: number;
  item_type: number;
  item_quantity: number;
  item_weight: string;
  special_instruction?: string;
}

export interface PathaoOrderResponse {
  consignment_id: string;
  tracking_link: string;
  order_id: number;
  status: string;
}

export interface City {
  city_id: number;
  city_name: string;
}

export interface Zone {
  zone_id: number;
  zone_name: string;
}

export interface Area {
  area_id: number;
  area_name: string;
}