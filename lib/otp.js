import crypto from "crypto";
import OtpCode from "@/lib/models/OtpCode";
import VerifiedEmail from "@/lib/models/VerifiedEmail";
import { sendOtpEmail } from "@/lib/email";

// Generate a secure 6-digit OTP
export function generateOtp() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

// Save OTP to DB
export async function saveOtp(email, code, ip) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  await OtpCode.deleteMany({ email }); // Remove old codes
  await OtpCode.create({ email, code, expiresAt, requestIp: ip, lastRequestedAt: new Date() });
  return expiresAt;
}

// Verify OTP
export async function verifyOtp(email, code) {
  const otpDoc = await OtpCode.findOne({ email });
  if (!otpDoc || otpDoc.expiresAt < new Date()) return { verified: false, reason: "expired" };
  if (otpDoc.code !== code) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return { verified: false, reason: "invalid" };
  }
  await OtpCode.deleteOne({ email });
  await markEmailVerified(email);
  return { verified: true };
}

// Check if email is verified (within 24h)
export async function isEmailVerified(email) {
  const doc = await VerifiedEmail.findOne({ email });
  if (!doc || doc.expiresAt < new Date()) return false;
  return true;
}

// Mark email as verified (24h)
export async function markEmailVerified(email) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await VerifiedEmail.findOneAndUpdate(
    { email },
    { email, verifiedAt: new Date(), expiresAt },
    { upsert: true }
  );
  return expiresAt;
}

// Send OTP email
export async function sendOtp(email, ip) {
  const code = generateOtp();
  const expiresAt = await saveOtp(email, code, ip);
  await sendOtpEmail(email, code);
  return expiresAt;
}
