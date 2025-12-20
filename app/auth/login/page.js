"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          storeName: process.env.SHOPIFY_STORE_DOMAIN,
        }),
      });

      const data = await res.json();
      console.log("Send OTP response:", data);

      if (data.success) {
        alert("OTP sent to your WhatsApp!");
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          storeName:process.env.SHOPIFY_STORE_DOMAIN,
          enteredOtp: otp.trim(),
        }),
      });

      const data = await res.json();
      console.log("Verify OTP response:", data);

      if (data.success) {
        // Save the Shopify Customer ID in localStorage
        localStorage.setItem("customerShopifyId", data.user.storeEntry.shopifyCustomerId);

        alert("Login successful!");
        // Login success ke baad
        localStorage.removeItem("guestCartId");

        router.push("/profile"); // Redirect to profile (same for new & old users)
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-12 p-8 border rounded-xl shadow-xl bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#7d4b0e]">
        Welcome to Annapurna Khakhra
      </h1>

      {/* Step 1: Enter Phone Number */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <input
            type="tel"
            placeholder="Enter your phone number (e.g. 8320708895)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-4 border rounded-lg text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7d4b0e] text-white py-4 rounded-lg text-xl font-bold hover:bg-[#5a360a] disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <p className="text-center text-gray-700 font-medium ">
            Enter OTP sent to <strong>{phone}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            className="w-full p-4 border rounded-lg text-lg text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7d4b0e] text-white py-4 rounded-lg text-xl font-bold hover:bg-[#5a360a] disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-[#7d4b0e] underline text-center mt-4"
          >
            Resend OTP
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered? You will be logged in with the same account.
          </p>
        </form>
      )}

      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </div>
  );
}