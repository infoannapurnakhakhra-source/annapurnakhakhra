import mongoose from "mongoose";

const verifiedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  verifiedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  meta: { type: Object },
});

// TTL index for auto-expiry
verifiedEmailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.VerifiedEmail || mongoose.model("VerifiedEmail", verifiedEmailSchema);
