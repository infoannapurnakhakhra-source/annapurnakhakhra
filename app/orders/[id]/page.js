
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, Clock, Truck, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Fetch order details
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          alert("Order not found!");
          router.push("/profile");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-700 animate-pulse text-center">
          Loading Order Details...
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Separate tax lines: product taxes (on subtotal) vs shipping taxes
  const productTaxLines = order.taxLines?.filter((taxLine) => {
    const titleLower = (taxLine.title || '').toLowerCase();
    return !titleLower.includes('shipping') && !titleLower.includes('postage') && !titleLower.includes('delivery') && !titleLower.includes('freight');
  }) || [];

  // Calculate tax amount (informational only, since included in subtotal)
  const taxAmount = productTaxLines.reduce((sum, taxLine) => sum + parseFloat(taxLine.price || 0), 0).toFixed(2);

  // Totals: subtotal already includes tax, so total = subtotal + shipping
  const subtotal = parseFloat(order.subtotalPrice || 0).toFixed(2);
  const tax = taxAmount;
  const shippingBase = parseFloat(order.shippingPrice || order.totalShipping || 0);
  const shipping = shippingBase.toFixed(2);
  const displayedTotal = (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header
        className="relative h-48 sm:h-56 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: "url('/b5.webp')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold">Order Details</h1>
          <p className="text-base sm:text-lg md:text-xl mt-2 sm:mt-3">#{order.orderNumber}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 sm:gap-3 text-amber-700 hover:text-amber-900 mb-6 sm:mb-7 md:mb-8 font-medium text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          Back to Orders
        </button>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-100 p-5 sm:p-6 md:p-8 lg:p-12 mb-8 sm:mb-9 md:mb-10">
          {/* Order Info */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 sm:mb-9 md:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#7d4b0e" }}>
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm sm:text-base text-amber-700 mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Placed on{" "}
                {new Date(order.processedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-0">
              <span
                className={`inline-block px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg ${order.financialStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                {order.financialStatus === "PAID" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" /> Pending
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6 sm:pt-7 md:pt-8">
            <h3 className="text-xl sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6" style={{ color: "#7d4b0e" }}>
              <ShoppingBag className="inline w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-2 sm:mr-3" />
              Order Items
            </h3>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {order.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 gap-4"
                >
                  <div className="flex items-center gap-4 sm:gap-5 md:gap-6 w-full sm:w-auto">
                    <div className="bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                      {item.quantity}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 break-words">{item.title}</h4>
                      {item.variantTitle && item.variantTitle !== "Default" && (
                        <p className="text-sm sm:text-base text-amber-700">Variant: {item.variantTitle}</p>
                      )}
                      {item.sku && item.sku !== "N/A" && (
                        <p className="text-xs sm:text-sm text-gray-600">SKU: {item.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xl sm:text-xl md:text-2xl font-bold" style={{ color: "#7d4b0e" }}>
                      ₹{parseFloat(item.total || 0).toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ₹{parseFloat(item.price || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-8 sm:mt-9 md:mt-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-200">
            <div className="space-y-3 sm:space-y-4 text-base sm:text-lg md:text-xl font-medium">
              <div className="flex justify-between">
                <span>Subtotal (incl. tax)</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>

              {/* Tax Breakdown (always show as "Tax (included)" instead of individual lines) */}
              <div className="space-y-2 pt-2 border-t border-amber-200">
                <div className="flex justify-between opacity-50 text-xs sm:text-sm">
                  <span>Tax (included)</span>
                  <span>₹{tax}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl md:text-2xl font-bold pt-3 sm:pt-4 border-t border-amber-300">
                <span>Total</span>
                <span style={{ color: "#7d4b0e" }}>₹{displayedTotal}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mt-8 sm:mt-9 md:mt-10 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border-l-4 border-[#7d4b0e]">
              <p className="font-bold text-xl sm:text-xl md:text-2xl mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3" style={{ color: "#7d4b0e" }}>
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" /> Delivery Address
              </p>
              <p className="text-amber-800 leading-relaxed text-sm sm:text-base md:text-lg">
                <strong>{order.shippingAddress.first_name} {order.shippingAddress.last_name}</strong>
                <br />
                {order.shippingAddress.address1}
                {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.province} - {order.shippingAddress.zip}
                <br />
                {order.shippingAddress.country}
                <br />
                <span className="font-semibold">Phone:</span> {order.shippingAddress.phone}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center py-8 sm:py-10 md:py-12">
          <a
            href="/"
            className="inline-flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl md:text-2xl font-bold shadow-2xl hover:shadow-3xl transition transform hover:scale-105"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}