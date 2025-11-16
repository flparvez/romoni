import { Schema, model, models } from "mongoose";

import type { ICourierHistory, IOrder } from "@/types/index";




const courierHistorySchema = new Schema<ICourierHistory>(
  {
    courier: { type: String, required: true },
    status: { type: String, required: true },
    trackingCode: { type: String },
    isPickupRequested: { type: Boolean, default: false },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },

    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String},

  
    paymentType: {
      type: String,
      enum: ["FULL", "PARTIAL"],
      default: "FULL",
      // required: true,
    },

    pathaoStatus: {
      type: String,
      enum: ["NOT_REQUESTED", "REQUESTED", "ACCEPTED", "DELIVERED", "CANCELLED"],
      default: "NOT_REQUESTED",
    },
    pathaoTrackingCode: { type: String, sparse: true },

    trxId: {
      type: String,
      
      },
  

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    totalAmount: { type: Number, required: true, min: [0, "Total amount must be positive"] },
    paytorider: { type: Number,  min: [0, "Total amount must be positive"] },
    deliveryCharge: { type: Number, required: true, min: [0, "Delivery charge must be positive"] },

    items: [{ type: Schema.Types.ObjectId, ref: "OrderItem", required: true }],

    courierHistory: [courierHistorySchema],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// Indexes for performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ phone: 1 });
orderSchema.index({ "courierHistory.courier": 1 });

// Auto-generate 3-digit orderId
orderSchema.pre("validate", async function (next) {
  if (this.isNew && !this.orderId) {
    let isUnique = false;
    let generatedId;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      generatedId = Math.floor(100 + Math.random() * 900).toString();
      const exists = await models.Order?.exists({ orderId: generatedId });
      if (!exists) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error("Failed to generate unique order ID"));
    }

    this.orderId = generatedId;
  }
  next();
});

// Update courier history on status change
orderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    const existingEntry = this.courierHistory.find(
      (entry) => entry.status === this.status && entry.courier === "ADMIN_UPDATE"
    );
    if (!existingEntry) {
      this.courierHistory.push({
        courier: "ADMIN_UPDATE",
        status: this.status,
        requestedAt: new Date(),
      } as ICourierHistory);
    }
  }
  next();
});

// Static method: order counts by status
orderSchema.statics.getStatusCounts = async function () {
  const results = await this.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {
    ALL: 0,
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    APPROVED: 0,
  };

  let total = 0;
  results.forEach((result) => {
    counts[result._id] = result.count;
    total += result.count;
  });

  counts.ALL = total;
  return counts;
};

export const Order = models.Order || model<IOrder>("Order", orderSchema);