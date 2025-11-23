import type { IProduct, IProductImage } from "@/types/index";
import mongoose, { Schema, Model } from "mongoose";

// ==========================
// Sub-Schemas (Clean & Modular)
// ==========================

const VariantOptionSchema = new Schema(
  {
    value: { type: String, required: true }, // e.g., "Red", "XL"
    price: { type: Number }, // Overrides base price
    stock: { type: Number }, // Variant specific stock
    sku: { type: String }, // Unique SKU for variant
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Color", "Size"
    options: { type: [VariantOptionSchema], default: [] },
  },
  { _id: false }
);

const AttributeSchema = new Schema(
  {
    key: { type: String, required: true }, // e.g., "Material"
    value: { type: String, required: true }, // e.g., "Cotton"
  },
  { _id: false }
);

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    fileId: { type: String }, // For deleting from cloud storage
    altText: { type: String },
  },
  { _id: false }
);

// ==========================
// Main Product Schema
// ==========================

const ProductSchema = new Schema<IProduct>(
  {
    // 1. Basic Info
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortName: { type: String, trim: true },
    description: { type: String, default: "" },
    
       category: new Schema({
      _id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
      name: { type: String },
      slug: { type: String },
    }, { _id: false }),
    // 3. Pricing & Profit Strategy (Business Core)
    price: { type: Number, required: true, index: true }, // Selling Price
    originalPrice: { type: Number }, // MRP
    discount: { type: Number, default: 0 }, // Auto-calculated
    
    // NEW: Cost Price for Profit Calculation
    costPrice: { type: Number, default: 0 }, 
    
    isFreeDelivery: { type: Boolean, default: false },

    // 4. Media
    images: { type: [ProductImageSchema], required: true },
    video: { type: String },

    // 5. Inventory Management
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 }, // Alert when stock is below 5
    sold: { type: Number, default: 0 },
    sku: { type: String, index: true }, // Main Product SKU
    barcode: { type: String }, // For Barcode Scanner integration
    
    popularityScore: { type: Number, default: 0 },

    // 6. Details
    warranty: { type: String },
    specifications: { type: [AttributeSchema], default: [] },

    // 7. SEO Engine
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String], default: [] },

    // 8. Social Proof
    reviews: { type: [ProductImageSchema] }, // Consider referencing a Review Model later for scale
    rating: { type: Number, min: 0, max: 5, default: 0 },

    // 9. Variants & Combos
    variants: { type: [VariantSchema], default: [] },
    isCombo: { type: Boolean, default: false },
    comboProducts: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],

    duplicateOf: { type: Schema.Types.ObjectId, ref: "Product", default: null },

    // 10. System Control
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true
    },

    lastUpdatedIndex: { type: Number }, // For forcing cache revalidation
    advanced: { type: Number, default: 100 }, // Sorting weight
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==========================
// Indexes for Super Fast Search
// ==========================

// Compound Index for Dashboard List (Most common query: Active products sorted by Created Date)
ProductSchema.index({ status: 1, createdAt: -1 });

// Text Index for Search Bar (Allows searching by Name, SKU, ShortName, Description)
ProductSchema.index(
  { 
    name: "text", 
    shortName: "text", 
    sku: "text", 
    "variants.options.sku": "text" 
  },
  {
    weights: {
      name: 10,
      sku: 5,
      shortName: 3,
      "variants.options.sku": 5
    },
    name: "TextSearchIndex"
  }
);

// Standard Indexes
ProductSchema.index({ price: 1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ popularityScore: -1 });
ProductSchema.index({ "category._id": 1 });
ProductSchema.index({ isFeatured: 1 });

// ==========================
// Middleware (Business Logic)
// ==========================

ProductSchema.pre<IProduct>("save", function (next) {
  // 1. Auto Calculate Discount
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discount = 0;
  }

  // 2. Auto Update Status based on Stock (Optional Automation)
  // If stock is 0, we might not want to archive it, but we can tag it.
  // Currently keeping manual control.

  next();
});

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);