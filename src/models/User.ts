// models/User.ts

import type { IUser } from "@/types/index";
import bcrypt from "bcryptjs";
import mongoose, { Schema, model, models } from "mongoose";




const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    // Add the schema definition for subscriptions
    subscriptions: {
      type: [{
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      }],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const User = models.User || model<IUser>("User", userSchema);