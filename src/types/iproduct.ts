// types/product.ts
import mongoose, { Types } from "mongoose";

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

export interface ICategoryRef {
  _id:  string;
  name: string;
  slug: string;
  images?: IProductImage[]
}

export interface IProduct {
   
  // Basic info
  name: string;
  slug: string;
  shortName?: string;
  description?: string;
displayPrice?: number
  // Category relation
  category: ICategoryRef;

  // Pricing
  price: number;
  originalPrice: number;
  discount?: number;
  isFreeDelivery?: boolean;

  // Media
  images: IProductImage[];
  video?: string;

  // Inventory and metrics
  stock: number;
  sold?: number;
  popularityScore?: number;

  // Details
  warranty?: string;
  specifications?: IAttribute[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Reviews
  reviews?: mongoose.Types.ObjectId[] | string[];
  rating?: number;

  // Variants and combos
  variants?: IVariant[];
  isCombo?: boolean;
  comboProducts?: IComboProduct[];

  // Duplicate support
  duplicateOf?: mongoose.Types.ObjectId | string | null;

  // Flags and status
  isFeatured?: boolean;
  isActive?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";

  // Metadata
  lastUpdatedIndex?: number;
  advanced?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IIProduct {
   _id: string;
  // Basic info
  name: string;
  slug: string;
  shortName?: string;
  description?: string;

  // Category relation
  category: ICategoryRef;
displayPrice: number
  // Pricing
  price: number;
  originalPrice?: number;
  discount?: number;
  isFreeDelivery?: boolean;

  // Media
  images: IProductImage[];
  video?: string;

  // Inventory and metrics
  stock: number;
  sold?: number;
  popularityScore?: number;

  // Details
  warranty?: string;
  specifications?: IAttribute[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Reviews
  reviews?: mongoose.Types.ObjectId[] | string[];
  rating?: number;

  // Variants and combos
  variants?: IVariant[];
  isCombo?: boolean;
  comboProducts?: IComboProduct[];

  // Duplicate support
  duplicateOf?: mongoose.Types.ObjectId | string | null;

  // Flags and status
  isFeatured?: boolean;
  isActive?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";

  // Metadata
  lastUpdatedIndex?: number;
  advanced?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
