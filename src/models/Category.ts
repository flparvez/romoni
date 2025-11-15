
import mongoose, { Schema, Document, Model } from "mongoose";
import type { ICategory } from "../types/index";



const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    images: { type: [ImageSchema], default: [] },
    tags: { type: [String], default: [] },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    lastIndex: { type: String , default: "0" },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual: fetch subcategories automatically
CategorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});


CategorySchema.index({ isFeatured: 1 });
CategorySchema.index({ isActive: 1 });

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);