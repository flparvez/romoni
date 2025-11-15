import type { IOrderItem } from "@/types/index";
import { Schema, model, models } from "mongoose";


const OrderItemSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedVariantOptions: { type: Object, default: {} }, // <- new
});



export const OrderItem = models.OrderItem || model<IOrderItem>("OrderItem", OrderItemSchema);