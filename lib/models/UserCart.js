// models/UserCart.js
// lib/models/UserCart.js

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  variantId: { type: String, required: true },
  title: { type: String, required: true },
  productTitle: { type: String, default: "Unknown" },
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  image: { type: String, default: "" },
});

const userCartSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  cartId: { type: String },
  checkoutUrl: { type: String },
  totalQuantity: { type: Number, default: 0 },
  items: [itemSchema],

  // 🔥 IMPORTANT FLAG
  isCompleted: { type: Boolean, default: false },

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserCart ||
  mongoose.model("UserCart", userCartSchema);

