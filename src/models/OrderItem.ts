import { Schema, model, models, Document } from "mongoose";

export interface IOrderItem extends Document {
  order: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId; // Linked with Product model
  quantity: number;
  price: number;
  variant?: string; // e.g., "Size: Large" or "Color: Red"
 selectedVariantOptions?: Record<string, string>; // { Size: "M", Color: "Red" }
}

const OrderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedVariantOptions: { type: Object, default: {} }, // <- new
});



export const OrderItem = models.OrderItem || model<IOrderItem>("OrderItem", OrderItemSchema);