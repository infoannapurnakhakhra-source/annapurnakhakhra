"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("razorpay_session");
    if (!data) {
      router.replace("/checkout");
      return;
    }

    startPayment(JSON.parse(data));
  }, []);

  const loadScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  const startPayment = async (data) => {
    await loadScript();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency,
      name: "Annapurna Khakhra",
      handler: async (response) => {
        await verifyPayment(response);
      },
      modal: {
        ondismiss: () => router.replace("/checkout"),
      },
    };

    new window.Razorpay(options).open();
  };

  const verifyPayment = async (response) => {
    const res = await fetch("/api/payment/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    const data = await res.json();

    if (data.success) {
      sessionStorage.removeItem("razorpay_session");
      router.replace(`/thank-you?order=${data.orderId}`);
    } else {
      alert("Payment failed");
      router.replace("/checkout");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Redirecting to payment...</p>
    </div>
  );
}
