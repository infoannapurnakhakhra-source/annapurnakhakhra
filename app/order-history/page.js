"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Package, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Base URL from ENV
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
      alert("Configuration error. Please contact support.");
      return;
    }

    const fetchOrders = async () => {
      const customerId = localStorage.getItem("customerShopifyId");

      if (!customerId) {
        alert("Please login first!");
        router.push("/auth/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId }),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          const sortedOrders = [...data.orders].sort(
            (a, b) => new Date(b.processedAt) - new Date(a.processedAt)
          );
          setOrders(sortedOrders);
        } else {
          localStorage.removeItem("customerShopifyId");
          alert("Session expired. Please login again.");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Fetch orders failed:", error);
        alert("Unable to connect to server. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_BASE_URL, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-700 animate-pulse text-center">
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#7d4b0e]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#7d4b0e]">
              Your Orders
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-amber-700 mt-3 sm:mt-4 px-4">
            Track all your khakhra parcels with love ❤️
          </p>
        </div>

        {/* Orders */}
        {orders.length > 0 ? (
          <div className="grid gap-5 sm:gap-6 md:gap-8">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-amber-100 p-5 sm:p-6 md:p-8"
                style={{
                  animation: `fadeInUp 0.5s ease forwards`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 md:gap-6">
                  <div className="bg-[#7d4b0e] p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl">
                    <Package className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>

                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                      <div>
                        <h3 className="text-xl sm:text-xl md:text-2xl font-bold text-[#7d4b0e]">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm sm:text-base text-amber-700 mt-1">
                          {new Date(order.processedAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <span className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 md:py-5 rounded-full text-xs sm:text-sm font-semibold bg-amber-100 text-amber-800 self-start">
                        {order.fulfillmentStatus || "Processing"}
                      </span>
                    </div>

                    <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5 md:gap-6">
                      <div>
                        <p className="text-xs sm:text-sm text-amber-600">Total</p>
                        <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-[#7d4b0e] mt-1">
                          ₹{order.totalPrice}
                        </p>
                      </div>

                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-[#7d4b0e] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-[#a0682a] transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 md:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-xl px-4">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-amber-300 mb-4 sm:mb-5 md:mb-6" />
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-amber-700">
              No orders yet
            </h2>
            <p className="text-base sm:text-lg text-amber-600 mt-3 sm:mt-4 px-4">
              Start shopping to see your orders here
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 sm:gap-3 mt-6 sm:mt-7 md:mt-8 bg-[#7d4b0e] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-[#a0682a] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              Start Shopping
            </a>
          </div>
        )}

        {/* Footer Links */}
        <div className="text-center mt-12 sm:mt-14 md:mt-16 px-4">
          <a href="/profile" className="text-sm sm:text-base text-[#7d4b0e] underline hover:text-[#a0682a]">
            ← Back to Profile
          </a>
          <br />
          <a
            href="/collection"
            className="inline-flex items-center gap-2 sm:gap-3 mt-6 sm:mt-7 md:mt-8 bg-[#7d4b0e] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-[#a0682a] transition-colors"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            Continue Shopping
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}