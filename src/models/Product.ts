import type { IProduct, IProductImage } from "@/types/index";
import mongoose, { Schema, Model } from "mongoose";




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

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    fileId: { type: String },
    altText: { type: String },
  },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortName: { type: String, trim: true },
    description: { type: String, default: "" },

    category: new Schema({
      _id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
      name: { type: String },
      slug: { type: String },
    }, { _id: false }),

    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    isFreeDelivery: { type: Boolean, default: false },

    images: { type: [productImageSchema], required: true },
    video: { type: String },

    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },

    warranty: { type: String },
    specifications: { type: [AttributeSchema], default: [] },

    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String], default: [] },
    reviews: { type: [productImageSchema] },
    rating: { type: Number, min: 0, max: 5, default: 0 },

    variants: { type: [VariantSchema], default: [] },

    isCombo: { type: Boolean, default: false },
    comboProducts: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],

    duplicateOf: { type: Schema.Types.ObjectId, ref: "Product", default: null },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },

    lastUpdatedIndex: { type: Number },
    advanced: { type: Number , default: 100},
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.index({ price: 1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ popularityScore: -1 });
ProductSchema.index({ "category._id": 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isActive: 1 });

ProductSchema.pre<IProduct>("save", function (next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  } else {
    this.discount = 0;
  }
  next();
});

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);