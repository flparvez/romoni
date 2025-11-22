import mongoose, { Document, Schema, model, models } from "mongoose";
import type { IProduct } from "../types/index";

export interface IBulletPoint { text: string; order: number; }
export interface IFAQ { question: string; answer: string; order: number; }
export interface ISection { key: string; title: string; bulletPoints: IBulletPoint[]; order: number; }

export interface ILandingPageContent extends Document {
  pageIdentifier: string;
  isDeliveryChargeFree: boolean;
  heroTitle: string;
  heroSubtitle: string;
  videoUrl?: string;
  logoUrl: string;
  ctaText: string;
  products: IProduct[]; // refs Product
  sections: ISection[];
  section1Title?: string;
  section1BulletPoints?: IBulletPoint[];
  section2Title?: string;
  section2BulletPoints?: IBulletPoint[];
  section3Title?: string;
  section3BulletPoints?: IBulletPoint[];
  contactNumber: string;
  workingHours: string;
  faqTitle: string;
  faqData: IFAQ[];
  footerText: string;
  theme?: { primary?: string; secondary?: string; accent?: string; darkMode?: boolean; };
  seo?: { title?: string; description?: string; keywords?: string[]; ogImage?: string; };
  createdAt: Date;
  updatedAt: Date;
}

const BulletPointSchema = new Schema<IBulletPoint>({ text: { type: String, required: true, trim: true }, order: { type: Number, required: true, default: 0 } }, { _id: false });
const FAQSchema = new Schema<IFAQ>({ question: { type: String, required: true, trim: true }, answer: { type: String, required: true, trim: true }, order: { type: Number, required: true, default: 0 } }, { _id: false });
const SectionSchema = new Schema<ISection>({ key: { type: String, required: true, trim: true, lowercase: true }, title: { type: String, required: true, trim: true }, bulletPoints: { type: [BulletPointSchema], default: [] }, order: { type: Number, required: true, default: 0 } }, { _id: false });

const LandingPageContentSchema = new Schema<ILandingPageContent>(
  {
    pageIdentifier: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    isDeliveryChargeFree: { type: Boolean, default: false },
    heroTitle: { type: String, default: "Your Product Title" },
    heroSubtitle: { type: String, default: "Explain why this product matters." },
    logoUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    ctaText: { type: String, default: "Order Now" },
products: {
  type: [mongoose.Schema.Types.Mixed],
  default: [],
},

    sections: { type: [SectionSchema], default: [] },
    section1Title: { type: String },
    section1BulletPoints: { type: [BulletPointSchema], default: undefined },
    section2Title: { type: String },
    section2BulletPoints: { type: [BulletPointSchema], default: undefined },
    section3Title: { type: String },
    section3BulletPoints: { type: [BulletPointSchema], default: undefined },
    contactNumber: { type: String, default: "01XXXXXXXX" },
    workingHours: { type: String, default: "10 AM - 10 PM (Daily)" },
    faqTitle: { type: String, default: "Frequently Asked Questions" },
    faqData: { type: [FAQSchema], default: [] },
    footerText: { type: String, default: "© Your Company. All rights reserved." },
    theme: {
      primary: { type: String, default: undefined },
      secondary: { type: String, default: undefined },
      accent: { type: String, default: undefined },
      darkMode: { type: Boolean, default: undefined },
    },
    seo: {
      title: { type: String, trim: true, default: undefined },
      description: { type: String, trim: true, default: undefined },
      keywords: { type: [String], default: undefined },
      ogImage: { type: String, default: undefined },
    },
  },
  { timestamps: true, minimize: true, versionKey: false }
);

LandingPageContentSchema.pre("validate", function (next) {
  if ((!this.sections || this.sections.length === 0) && (this.section1Title || this.section2Title || this.section3Title)) {
    const toSection = (key: string, title?: string, points?: IBulletPoint[]) =>
      title ? { key, title, bulletPoints: (points ?? []).sort((a, b) => a.order - b.order), order: Number(key.replace(/\D/g, "")) || 0 } : null;
    const normalized = [
      toSection("section1", this.section1Title, this.section1BulletPoints),
      toSection("section2", this.section2Title, this.section2BulletPoints),
      toSection("section3", this.section3Title, this.section3BulletPoints),
    ].filter(Boolean) as ISection[];
    if (normalized.length) this.sections = normalized.sort((a, b) => a.order - b.order);
  }
  next();
});

LandingPageContentSchema.pre("save", function (next) {
  if (Array.isArray(this.sections)) {
    this.sections.sort((a, b) => a.order - b.order);
    this.sections.forEach(s => s.bulletPoints.sort((a, b) => a.order - b.order));
  }
  if (Array.isArray(this.faqData)) this.faqData.sort((a, b) => a.order - b.order);
  next();
});

export const LandingPageContent =
  models.LandingPageContent ||
  model<ILandingPageContent>("LandingPageContent", LandingPageContentSchema);
