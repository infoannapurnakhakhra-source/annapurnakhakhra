import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  requestIp: { type: String },
  lastRequestedAt: { type: Date, default: Date.now },
});

// TTL index for auto-expiry
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpCode || mongoose.model("OtpCode", otpCodeSchema);
