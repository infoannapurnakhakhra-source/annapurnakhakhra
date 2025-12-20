"use client";

import React, { useState, useEffect, useRef } from "react";
import { HandCoins, Award, Package, Lock, FlaskConical, Leaf, Truck, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import AskExpert from "@/components/AskExpert";

export default function ProductDetailsClient({ product }) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0] || null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showEasebuzzModal, setShowEasebuzzModal] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    const customerId = localStorage.getItem("customerShopifyId");
    setLoading(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: quantity,
          customerId: customerId || null, 
        }),
      });

      const data = await res.json();

      
      if (data.success && data.cart?.id) {
        localStorage.setItem("guestCartId", data.cart.id);
        
        localStorage.setItem("cartId", data.cart.id);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to add to cart");
      }

      // Cart update event dispatch
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart-drawer"));

      // Reset quantity
      setQuantity(1);

    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };


  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  // Dynamic price calculation based on selected variant
  const price = selectedVariant?.price?.amount
    ? Number(selectedVariant.price.amount)
    : 0;

  const compare = selectedVariant?.compareAtPrice?.amount
    ? Number(selectedVariant.compareAtPrice.amount)
    : 0;

  const hasDiscount = compare > price && compare > 0;

  const percentage = hasDiscount
    ? Math.round(((compare - price) / compare) * 100)
    : null;

  const allImages = product.images || [];
  const displayImage =
    allImages[selectedImageIndex]?.url ||
    product.featuredImage?.url ||
    "/placeholder.jpg";

  // LIVE COUNTDOWN TIMER - "Order in next 7h 20m 51s"
  function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);

        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

        if (diff < 0) {
          setTimeLeft("0h 0m 0s");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    return <span className="font-bold text-orange-600 text-lg">{timeLeft}</span>;
  }

  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;

    function handleWheel(e) {
      // Only apply custom scroll if within 500px from top
      if (window.scrollY > 100) return;

      const atTop = el.scrollTop === 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;

      if (e.deltaY > 0) {
        // Scroll down
        if (!atBottom) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      } else if (e.deltaY < 0) {
        // Scroll up
        if (!atTop) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);


  const [showStickyBox, setShowStickyBox] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If user closed manually, never show again
      if (closedByUser) return;

      if (window.scrollY > 500) {
        setShowStickyBox(true);
      } else {
        setShowStickyBox(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [closedByUser]);

  const handleClose = () => {
    setClosedByUser(true);
    setShowStickyBox(false);
  };

  useEffect(() => {
    if (!product?.id) return;

    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Remove existing ID to avoid duplicates
    viewed = viewed.filter((id) => id !== product.id);

    viewed.unshift(product.id);

    // limit
    viewed = viewed.slice(0, 10);

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
  }, [product]);


  return (
    <>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* IMAGE SECTION */}
            <div className="space-y-4">
              <div className="relative group">
                {hasDiscount && (
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-red-600 text-white px-5 py-2 text-sm font-bold rounded-full shadow-lg">
                      {percentage}% OFF
                    </span>
                  </div>
                )}

                <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white p-3">
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="rounded-xl w-full object-cover aspect-square transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative overflow-hidden rounded-lg shadow-md bg-white p-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedImageIndex === index
                        ? "ring-2 ring-[#7d4b0e] shadow-lg"
                        : "hover:shadow-lg"
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="rounded-md w-full object-cover aspect-square"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS SECTION */}
            <div
              ref={scrollRef}
              className="space-y-6 md:h-screen"
              style={{
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* {product.productType && (
                <div className="inline-block">
                  <p className="text-gray-500 text-sm uppercase tracking-wider font-medium bg-gray-100 px-4 py-2 rounded-full">
                    {product.productType}
                  </p>
                </div>
              )} */}

              <h1 className="text-4xl lg:text-5xl font-bold text-black mt-2 leading-tight">
                {product.title}
              </h1>
              <p className="text-black text-sm text-gray-500">
                Tax Excluded.{" "}
                <a
                  href="/shipping-policy"
                  className="font-medium text-[#7d4b0e] hover:underline"
                >
                  Shipping
                </a> calculated at checkout.
              </p>


              {/* Easebuzz Money Back Promise Badge */}
              <button
                onClick={() => setShowEasebuzzModal(true)}
                className="w-full bg-pink-50 border border-pink-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
              >
                {/* Top section */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Icon circle */}
                    <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-bold text-xl">₹</span>
                    </div>

                    {/* Text */}
                    <div>
                      <div className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                        Easebuzz
                      </div>
                      <div className="text-xs text-gray-700 font-medium">Money Back Promise</div>
                    </div>
                  </div>

                  {/* Right badge */}
                  <div className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                    On Prepaid Orders
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="mt-3 border-t border-pink-200 pt-2 flex items-center gap-2">
                  <span className="text-red-500 text-lg">⚠</span>
                  <span className="text-xs">
                    <span className="font-semibold text-red-500">Get 100% refund</span> on non-delivery or defects
                  </span>
                </div>
              </button>


              {/* PRICE - Now dynamic based on selected variant */}
              <div className="bg-amber-50 rounded-2xl p-6 border border-orange-100 shadow-md">
                {hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span className="text-5xl font-bold text-orange-600">
                        ₹{price.toFixed(2)}
                      </span>
                      <span className="text-2xl line-through text-gray-400 font-medium">
                        ₹{compare.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#7d4b0e] text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        {percentage}% OFF
                      </span>
                      <span className="text-[#7d4b0e] font-semibold text-sm">
                        You save ₹{(compare - price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-5xl font-bold text-orange-600">
                    ₹{price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* VARIANT SELECTOR */}
              {product.variants.length > 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#7d4b0e]/20">
                  <h3 className="font-semibold text-lg text-[#7d4b0e] mb-4">
                    Choose Variant
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.variants.map((variant) => {
                      const isActive = selectedVariant?.id === variant.id;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={`
              relative rounded-xl px-4 py-4 text-center font-medium
              border-2 transition-all duration-200
              ${isActive
                              ? "border-[#7d4b0e] bg-[#7d4b0e] text-white shadow-md scale-[1.03]"
                              : "border-[#7d4b0e]/40 text-[#7d4b0e] hover:border-[#7d4b0e]"
                            }
            `}
                        >
                          {/* Selected check */}
                          {isActive && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-[#7d4b0e] text-xs flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}

                          <span className="block text-sm font-semibold">
                            {variant.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* QUANTITY */}
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-amber-50 border border-gray-300 rounded-full px-1 py-1 shadow-sm">
                  {/* — BUTTON */}
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 disabled:opacity-40 
                transition shadow-sm text-2xl text-white font-bold"
                  >
                    –
                  </button>
                  <span className="mx-4 text-xl font-semibold min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 text-white transition shadow-sm 
                text-2xl font-bold"
                  >
                    +
                  </button>

                </div>

                {/* ADD TO CART */}
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !selectedVariant}
                  className="w-full bg-[#7d4b0e] text-white font-bold py-6 px-8 rounded-lg 
                hover:bg-yellow-600 transition-all duration-300 text-lg shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? "Adding to Cart..." : "Add to Cart"}
                </button>
              </div>

              <AskExpert />

              {/* DELIVERY TIMELINE & COUNTDOWN - EXACTLY LIKE YOUR IMAGE */}
              <div className="bg-amber-50 rounded-2xl p-6 mt-8 border border-amber-200">
                {/* Timeline */}
                <div className="relative">
                  <div className="flex items-center justify-between relative">
                    {/* Line */}
                    <div className="absolute top-6 left-12 right-12 h-0.5 bg-amber-300"></div>

                    {/* Helper function for dates */}
                    {(() => {
                      const today = new Date();
                      const oneDay = 24 * 60 * 60 * 1000;

                      const orderDate = today;
                      const dispatchStart = new Date(today.getTime() + oneDay);
                      const dispatchEnd = new Date(today.getTime() + 2 * oneDay);

                      const deliveryStartCandidate = new Date(today.getTime() + 3 * oneDay);
                      const endOfDay = new Date(today);
                      endOfDay.setHours(23, 59, 59, 999);

                      const deliveryStart =
                        deliveryStartCandidate.getTime() > endOfDay.getTime()
                          ? new Date(today.getTime() + 4 * oneDay)
                          : deliveryStartCandidate;

                      const deliveryEnd = new Date(today.getTime() + 7 * oneDay);

                      // Format: 11/12
                      const format = (d) =>
                        d.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                        });

                      return (
                        <>
                          {/* Step 1 - Order */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              🛍️
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Order</p>
                            <p className="text-xs text-gray-600">{format(orderDate)}</p>
                          </div>

                          {/* Step 2 - Dispatch */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              ✈️
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Order Dispatch</p>
                            <p className="text-xs text-gray-600">
                              {format(dispatchStart)} – {format(dispatchEnd)}
                            </p>
                          </div>

                          {/* Step 3 - Delivery */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              📦
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Delivery</p>
                            <p className="text-xs text-gray-600">
                              {format(deliveryStart)} – {format(deliveryEnd)}
                            </p>
                          </div>
                        </>
                      );
                    })()}

                  </div>
                </div>

                {/* Countdown Message */}
                <div className="mt-8 space-y-3">
                  <div className="flex flex-col gap-2 bg-white rounded-xl px-5 py-4 shadow-md">
                    {/* Point 1 - Free Shipping */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <p className="text-gray-800 font-medium">
                        Free Shipping In India (On Order Above ₹999)
                      </p>
                    </div>

                    {/* Point 2 - Countdown & Delivery */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <p className="text-gray-800 font-medium">
                        Order within the next <CountdownTimer /> for <strong>dispatch today</strong>, and you'll receive your package between{" "}
                        <strong>
                          {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric' })}
                          {" – "}
                          {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric' })}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

              </div>


              <div className="bg-green-50 rounded-xl p-5 flex items-start gap-4 border border-green-200 shadow-sm">
                <HandCoins className="w-7 h-7 text-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Rewards</h3>
                  <p className="text-gray-700 text-sm">
                    Shop for Rs.999/- & Get Free Shipping
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                {/* Free Shipping */}
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-gray-700" />
                  <span className="text-gray-800 text-sm md:text-base">
                    Free Shipping & Exchanges
                  </span>
                </div>

                {/* Secure Payment */}
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-gray-700" />
                  <span className="text-gray-800 text-sm md:text-base">
                    Flexible and secure payment, pay on delivery
                  </span>
                </div>

                {/* Happy Customers */}
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-gray-700" />
                  <span className="text-gray-800 text-sm md:text-base">
                    800,000+ Happy customers
                  </span>
                </div>
              </div>



              {/* metafeilds */}

              <div className="space-y-3">
                {product.metafields.map((mf, index) => {
                  const isOpen = openIndexes.includes(index);

                  const toggle = () => {
                    setOpenIndexes(prev =>
                      isOpen ? prev.filter(i => i !== index) : [...prev, index]
                    );
                  };

                  // Render the first metafield as a UL, others based on key
                  let content;
                  if (index === 0) {
                    // First metafield value as list
                    const values = Array.isArray(mf.value) ? mf.value : JSON.parse(mf.value);
                    content = (
                      <ul className="list-none  space-y-1 text-gray-700">
                        {values.map((val, i) => (
                          <li key={i}>{val}</li>
                        ))}
                      </ul>
                    );
                  } else if (mf.key === "self_life") {
                    content = <span className="text-gray-700">{mf.value}</span>;
                  } else if (mf.key === "allergy_advice") {
                    content = mf.value.split("\n").map((line, i) => (
                      <p key={i} className="text-gray-700 mb-1">{line}</p>
                    ));
                  } else {
                    content = <span className="text-gray-700">{mf.value}</span>;
                  }

                  return (
                    <div
                      key={`${mf.namespace}.${mf.key}`}
                      className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-200  transition-all duration-300 hover:shadow-xl "
                    >
                      <button
                        onClick={toggle}
                        className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-gray-800 transition-all hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-50/50 focus:outline-none"
                      >
                        <span className="text-lg">
                          <span className="text-black">{mf.key}</span>
                        </span>
                        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-[#7d4b0e]" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#7d4b0e]" />
                          )}
                        </div>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                      >
                        <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 py-5">
                          {content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              {/* TRUST BADGES */}
              <div className="flex xl:flex-nowrap flex-wrap  xl:justify-between justify-center gap-10 py-6">

                {/* 1. 100% Pure */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-black border-4 border-yellow-500 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-10 h-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-black text-center">100% Pure</p>
                </div>

                {/* 2. Secure Payment */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-black border-4 border-yellow-500 flex items-center justify-center">
                    <Lock className="text-yellow-400 w-10 h-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-black text-center">Secure Payment</p>
                </div>

                {/* 3. Zero Preservative */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-black border-4 border-yellow-500 flex items-center justify-center">
                    <FlaskConical className="text-yellow-400 w-10 h-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-black text-center">Zero Preservative</p>
                </div>

                {/* 4. Freshly Made Everyday */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-black border-4 border-yellow-500 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-10 h-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-black text-center">
                    Freshly Made Everyday
                  </p>
                </div>

                {/* 5. Fast Shipping */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-black border-4 border-yellow-500 flex items-center justify-center">
                    <Truck className="text-yellow-400 w-10 h-10" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-black text-center">Fast Shipping</p>
                </div>

              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          {product.descriptionHtml && (
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200">
                <h3 className="font-bold mb-6 text-2xl text-gray-800 text-center">
                  Product Details
                </h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700 text-left leading-relaxed text-center"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            </div>
          )}
        </div>
      </div>



      {/* EASEBUZZ MONEY BACK PROMISE POPUP */}
      {showEasebuzzModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000a3] bg-opacity-0"
          onClick={() => setShowEasebuzzModal(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white p-6 relative">
              <button
                onClick={() => setShowEasebuzzModal(false)}
                className="absolute top-4 right-4 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">₹</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Protected by Easebuzz</h3>
                  <p className="text-pink-100">Money Back Promise</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-200">
                <p className="text-gray-700">
                  If your order is <strong>incorrect, damaged, or not delivered</strong>,<br />
                  get <strong>100% refund at zero cost</strong> from Easebuzz.
                </p>
                <p className="text-sm text-amber-600 font-medium mt-3">Valid on Prepaid orders only</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex justify-center items-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">100% Refund</p>
                    <p className="text-sm text-gray-600">on non-delivery or damaged items</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex justify-center items-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">100% Free</p>
                    <p className="text-sm text-gray-600">no hidden charges</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEasebuzzModal(false)}
                className="w-full bg-[#7d4b0e] text-white font-bold py-4 rounded-xl"
              >
                Yes, got it
              </button>
            </div>
          </div>
        </div>
      )}
      {showStickyBox && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

              {/* Left Section - Product Info */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <img
                  src={displayImage}
                  alt="product"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#7d4b0e] text-xs sm:text-sm truncate">
                    {product.title}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-[#7d4b0e]">
                    ₹{price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Right Section - Variant, Quantity & Add to Cart */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

                {/* Variant Selector */}
                {product.variants?.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedVariant?.id || ""}
                      onChange={(e) => {
                        const variant = product.variants.find(v => v.id === e.target.value);
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className="appearance-none bg-white border-2 border-gray-300 rounded-lg 
                  px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 
                  text-xs sm:text-sm font-medium text-gray-900 cursor-pointer
                  hover:border-gray-400 focus:outline-none focus:border-[#7d4b0e] 
                  focus:ring-2 focus:ring-[#7d4b0e]/20 transition-all"
                    >
                      <option value="">Select Variant</option>
                      {product.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.title}
                        </option>
                      ))}
                    </select>

                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center bg-amber-50 border border-gray-300 rounded-full px-1 py-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 disabled:opacity-40 
                transition text-lg sm:text-xl text-white font-bold"
                  >
                    –
                  </button>

                  <span className="mx-2 sm:mx-3 text-sm sm:text-base font-semibold min-w-[24px] text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 transition 
                text-lg sm:text-xl text-white font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !selectedVariant}
                  className="bg-[#7d4b0e] text-white font-semibold 
              px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 rounded-lg 
              hover:bg-yellow-600 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-md hover:shadow-lg whitespace-nowrap
              text-xs sm:text-sm flex items-center gap-2"
                >
                  {loading ? "Adding..." : "ADD TO CART"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

