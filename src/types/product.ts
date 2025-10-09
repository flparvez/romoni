

import { ICourierHistory } from "@/models/Order"

import { IUser } from "@/models/User"
import { IProductImage } from "./iproduct"
import { CartItem } from "@/hooks/useCart"

export const SITE_URL = "https://a1romoni.vercel.app"       
  
// export const SITE_URL = "http://localhost:3000";    

export interface IVariantOption {
  value: string
  price?: number
  stock?: number
  sku?: string
}
  


 export interface Params {params : Promise<{id: string}>} 
export interface Iproduct {
  _id: string // MongoDB ObjectId
  name: string
  iname?: string
  slug: string
  description: string
  price: number
  mprice: number
  stock?: number
  category: string
  brand?: string
  video?: string
  tags?: string[]
  specifications?: Record<string, string>
  images: IProductImage[]
  reviews?: IProductImage[]
  featured?: boolean
  rating?: number

  // 🆕 New optional fields
  sizes?: string   // e.g. ["S", "M", "L", "XL"]
  colors?: string  // e.g. ["Red", "Blue", "Black"]
}



export type ProductColumn = {
  _id: string
  name: string
  price: number
  stock: number
  featured: boolean
  createdAt: string
}

export interface IIOrder {
  _id: string;
  user: IUser;
  trxId: string;
  paymentType: string;
  note: string;
  pathaoStatus: "NOT_REQUESTED" | "REQUESTED" | "ACCEPTED" | "DELIVERED";
  pathaoTrackingCode: string;
  orderId: string;
  fullName: string;
  phone: string;
  address: string;
  courierHistory : ICourierHistory[]
  city: string;
paytorider : number
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "APPROVED";
  totalAmount: number;
  deliveryCharge: number;
  items: CartItem[];
  createdAt : Date
  selectedSize : string
  selectedColor : string
}



