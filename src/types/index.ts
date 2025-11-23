

import mongoose, { Schema, Document } from "mongoose";



export interface IdParams {
  params: Promise<{ id: string }>;
}
export interface SlugParams {
  params: Promise<{ slug: string }>;
}

// ==========================
// Product Related Types
// ==========================
export interface IProductImage {
  url: string;
  fileId?: string;
  altText?: string;
}

  export interface IVariantOption {
    value: string;
    price?: number;
    stock?: number;
    sku?: string;
  }

  export interface IVariant {
    name: string;
    options: IVariantOption[];
  }

export interface IAttribute {
  key: string;
  value: string;
}

export interface IComboProduct {
  product: mongoose.Types.ObjectId | string;
  quantity: number;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: mongoose.Types.ObjectId | string | null;
  tags ?: string[];
  lastIndex ?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: Date;
  updatedAt?: Date;

  images?: IProductImage[];
}

// ==========================
// Product Model Type
// ==========================
export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  costPrice?: number;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  shortName?: string;
  description?: string;

  category: ICategory;

  price: number;
  originalPrice?: number;
  discount?: number;
  isFreeDelivery?: boolean;

  images: IProductImage[];
  video?: string;

  stock: number;
  sold?: number;
  popularityScore?: number;

  warranty?: string;
  specifications?: IAttribute[];

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  reviews?: IProductImage[];
  rating?: number;

  variants?: IVariant[];
  isCombo?: boolean;
  comboProducts?: IComboProduct[];

  duplicateOf?: mongoose.Types.ObjectId | string | null;

  isFeatured?: boolean;
  isActive?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";

  lastUpdatedIndex?: number;
  advanced?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==========================
// User Types
// ==========================
export interface IPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  subscriptions?: IPushSubscription[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ==========================
// Order Types
// ==========================
export interface IOrderItem {
  order: Schema.Types.ObjectId;
  product: IProduct;
  quantity: number;
  price: number;
  variant?: string;
  selectedVariantOptions?: Record<string, string>;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "APPROVED";
export type PaymentType = "FULL" | "PARTIAL";
export type PathaoStatus = "NOT_REQUESTED" | "REQUESTED" | "ACCEPTED" | "DELIVERED" | "CANCELLED";

export interface ICourierHistory {
 courier: string;
  status: string;
  trackingCode?: string;
  isPickupRequested?: boolean;

  requestedAt: Date;
}

export interface IOrder extends Document {
  _id: string;
  orderId?: string;
  user?: Schema.Types.ObjectId;
  fullName: string;
  phone: string;
  note?: string;
  address: string;
  city?: string;

  paymentType: PaymentType;
  trxId?: string;
  status: OrderStatus;
  totalAmount: number;
  paytorider: number;
  deliveryCharge: number;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt?: Date;

  pathaoStatus: PathaoStatus;
  pathaoTrackingCode?: string;
  courierHistory: ICourierHistory[];
}
