"use client";

import { useState } from "react";

export default function CheckoutModal({ onClose, cart }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    city: "",
    province: "",
    country: "India",
    zip: "",
  });

  // STEP 1 — SEND OTP
  const sendOtp = async () => {
    if (!email) return alert("Enter your email");

    setLoading(true);
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        shop:process.env.SHOPIFY_STORE_DOMAIN,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setStep(2);
    } else {
      alert(data.message || "Failed to send OTP");
    }
  };

  // STEP 2 — VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    setLoading(true);
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        shop: process.env.SHOPIFY_STORE_DOMAIN,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setStep(3);
    } else {
      alert("Invalid OTP");
    }
  };

  // STEP 4 — CREATE ORDER (Yeh wala use karo)
const placeOrder = async () => {
  if (!cart?.id) return alert("Cart not found");

  const body = {
    shop: process.env.SHOPIFY_STORE_DOMAIN,
    cartId: cart.id,
    email,
    shippingAddress: address,
    lineItems: cart.lines.edges.map((item) => ({
      variant_id: item.node.merchandise.id.split("/").pop(),
      quantity: item.node.quantity,
      price: item.node.merchandise.price.amount,
    })),
  };

  setLoading(true);

  try {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.success && data.orderId) {
          onClose();

      localStorage.setItem("recentOrderId", data.orderId);
     
      if (confirm(`Order placed successfully!\n\nOrder ID: #${data.orderId}\n\nPress OK to continue`)) {
        window.location.replace(`/thank-you?order=${data.orderId}`);
      } else {
        window.location.replace(`/thank-you?order=${data.orderId}`);
      }
    } else {
      alert(data.message || "Failed to place order");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong! Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-center">
          Checkout — Step {step}
        </h2>

        {/* STEP 1 — EMAIL */}
        {step === 1 && (
          <>
            <input
              type="email"
              className="w-full p-3 border rounded mb-4"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full bg-black text-white py-3 rounded"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <>
            <input
              type="text"
              className="w-full p-3 border rounded mb-4"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="w-full bg-black text-white py-3 rounded"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 — ADDRESS */}
        {step === 3 && (
          <div className="space-y-3">
            {Object.keys(address).map((field) => (
              <input
                key={field}
                className="w-full p-3 border rounded"
                placeholder={field}
                value={address[field]}
                onChange={(e) =>
                  setAddress({ ...address, [field]: e.target.value })
                }
              />
            ))}
            <button
              className="w-full bg-black text-white py-3 rounded"
              onClick={() => setStep(4)}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 4 — PLACE ORDER */}
        {step === 4 && (
          <button
            className="w-full bg-green-600 text-white py-3 rounded"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        )}

        <button
          className="w-full mt-3 py-2 text-gray-500"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
