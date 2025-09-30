// models/User.ts

import bcrypt from "bcryptjs";
import mongoose, { Schema, model, models } from "mongoose";

// Define a type for the Push Subscription object
export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
  subscriptions?: IPushSubscription[]; // Add this line
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

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