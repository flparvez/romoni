import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "@/types/iproduct";

export interface IProductDocument extends IProduct, Document {}
export interface IProductImage {
  url: string;
  fileId?: string;
  altText?: string;
}

// --- Sub-Schemas ---

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    fileId: { type: String },
    altText: { type: String },
  },
  { _id: false }
);

const VariantOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number },
    sku: { type: String },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    options: { type: [VariantOptionSchema], default: [] },
  },
  { _id: false }
);

const AttributeSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);


// --- Main Product Schema ---

const ProductSchema = new Schema<IProductDocument>(
  {
    // Core Information
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortName: { type: String, trim: true },
    description: { type: String, default: "" },
    sku: { type: String },
    category: new Schema({
        _id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        name: { type: String },
        slug: { type: String },
      }, { _id: false }),

    // Pricing
    price: { type: Number, required: true }, // Your internal base/cost price
    displayPrice: { type: Number }, // The price customers see and pay
    originalPrice: { type: Number }, // The "strikethrough" price for showing a discount
    discount: { type: Number, default: 0 },
    isFreeDelivery: { type: Boolean, default: false },

    // Media
    images: { type: [productImageSchema], required: true },
    video: { type: String },
    reviews: { type: [productImageSchema] },

    // Inventory & Metrics
    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    
    // Specifications & Variants
    warranty: { type: String },
    specifications: { type: [AttributeSchema], default: [] },
    variants: { type: [VariantSchema], default: [] },

    // SEO
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String], default: [] },

    // Combo & Duplicates
    isCombo: { type: Boolean, default: false },
    comboProducts: [{
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      }],
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Product", default: null },

    // Status & Visibility
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },

    // Internal
    lastUpdatedIndex: { type: Number },
    advanced: { type: Number, default: 100 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


// --- Indexes ---

ProductSchema.index({ name: "text", slug: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ popularityScore: -1 });
ProductSchema.index({ "category._id": 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });


// --- Middleware ---

ProductSchema.pre<IProductDocument>("save", function (next) {
  // On creation, if displayPrice isn't set, default it to the base price.
  if (this.isNew && !this.displayPrice) {
    this.displayPrice = this.price;
  }
  
  // ✅ CORRECTED: Calculate discount based on originalPrice and displayPrice.
  // A discount exists only if originalPrice is set and is higher than the displayPrice.
  if (this.originalPrice && this.originalPrice > this.displayPrice) {
    this.discount = Math.round(
      ((this.originalPrice - this.displayPrice) / this.originalPrice) * 100
    );
  } else {
    // Otherwise, there is no discount.
    this.discount = 0;
  }
  
  next();
});


// --- Model Export ---

export const Product: Model<IProductDocument> =
  (mongoose.models.Product as Model<IProductDocument>) ||
  mongoose.model<IProductDocument>("Product", ProductSchema);
