import mongoose from "mongoose";

const shopTokenSchema = new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ShopToken || mongoose.model("ShopToken", shopTokenSchema);
