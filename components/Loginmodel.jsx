"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function LoginModal({ isOpen, onClose }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const isValidPhone = (value) => /^[6-9]\d{9}$/.test(value);
  const isValidOtp = (value) => /^\d{6}$/.test(value);

  // Close modal and reset state
  const handleClose = () => {
    setPhone("");
    setOtp("");
    setStep("phone");
    setError("");
    setLoading(false);
    onClose();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

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

      if (data.success) {
        alert("OTP sent to your WhatsApp!");
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidOtp(otp.trim())) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);

    try {
      const guestCartId = localStorage.getItem("guestCartId");

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          storeName: process.env.SHOPIFY_STORE_DOMAIN,
          enteredOtp: otp.trim(),
          guestCartId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const shopifyId = data.user.storeEntry.shopifyCustomerId;
        localStorage.setItem("customerShopifyId", shopifyId);

        // 🔥 TRUST backend first; respect merge result
        const merge = data.user?.merge;
        const finalCartId = data.cartId || (merge?.merged ? merge.mergedCartId : guestCartId);

        if (finalCartId) {
          localStorage.setItem("cartId", finalCartId);
        }

        // Ensure server-side association is stable by fetching cart with new context
        try {
          const resCart = await fetch("/api/cart/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerShopifyId: shopifyId, cartId: localStorage.getItem("cartId") || null }),
          });
          const cartData = await resCart.json();
          if (cartData?.cart?.id) {
            localStorage.setItem("cartId", cartData.cart.id);
          }
        } catch (e) {
          // ignore - we still follow merge flag below
        }

        // Only clear guestCartId if backend actually merged the guest cart
        if (merge?.merged) {
          localStorage.removeItem("guestCartId");
        }

        window.dispatchEvent(new Event("customer-updated"));
        window.dispatchEvent(new Event("cart-updated"));

        // Close modal and redirect
        handleClose();
        router.push("/");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-opacity-50 z-50 transition-opacity "
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4  z-[9999]">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <h2 className="text-3xl font-bold text-center mb-2 text-[#7d4b0e]">
            Welcome Back!
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Login to Annapurna Khakhra
          </p>

          {/* Step 1: Enter Phone Number */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="Enter your 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#7d4b0e] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7d4b0e] text-white py-4 rounded-lg text-lg font-bold hover:bg-[#5a360a] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
              </button>

              <p className="text-center text-sm text-gray-500">
                We'll send a secure OTP to verify your number
              </p>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-center text-gray-700 text-sm">
                  OTP sent from <strong>+91 8128109049</strong> to
                </p>
                <p className="text-center text-[#7d4b0e] font-bold text-lg">
                  {phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7d4b0e] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7d4b0e] text-white py-4 rounded-lg text-lg font-bold hover:bg-[#5a360a] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify OTP & Login"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full text-[#7d4b0e] font-medium text-center mt-4 hover:underline cursor-pointer"
              >
                ← Change Phone Number
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-sm text-gray-600 hover:text-[#7d4b0e] font-medium cursor-pointer disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Already registered? You'll be logged in automatically.
              </p>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}