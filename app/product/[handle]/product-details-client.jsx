"use client";

import React, { useState, useEffect, useRef } from "react";
import { HandCoins, Award, Package, Lock, FlaskConical, Leaf, Truck, ChevronDown, ChevronUp, ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import AskExpert from "@/components/AskExpert";
import addToCartClient from "@/lib/cartClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import LiveStats from "@/components/LiveStats";


export default function ProductDetailsClient({ product }) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0] || null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviewsSummary, setReviewsSummary] = useState({ average: 0, total: 0 });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Swipe state for mobile image navigation
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const imageRef = useRef(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && selectedImageIndex < allImages.length - 1) {
        // Swipe left - next image
        setSelectedImageIndex((prev) => prev + 1);
      } else if (diff < 0 && selectedImageIndex > 0) {
        // Swipe right - previous image
        setSelectedImageIndex((prev) => prev - 1);
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const customerShopifyId = localStorage.getItem("customerShopifyId");

    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    let variantId = selectedVariant.id;

    if (!variantId) {
      alert("No variant available");
      return;
    }

    const cleanVariantId = variantId.includes("gid://")
      ? variantId.split("/").pop()
      : variantId;

    // ✅ SAFETY: ensure quantity is a number
    const finalQuantity = Number(quantity);

    if (!finalQuantity || finalQuantity < 1) {
      alert("Invalid quantity");
      return;
    }

    setLoading(true);

    try {
      await addToCartClient({
        variantId: cleanVariantId,
        quantity: finalQuantity, // ✅ FIXED HERE
        customerShopifyId: customerShopifyId || null,
        product: product, // analytics
      });

      window.dispatchEvent(new Event("open-cart-drawer"));
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(`Failed to add: ${err.message}`);
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




  const [showStickyBox, setShowStickyBox] = useState(true); // Always show sticky box
  const [closedByUser, setClosedByUser] = useState(false);

  // Removed scroll logic - sticky box is always visible now

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

  useEffect(() => {
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    window.addEventListener("open-cart-drawer", openCart);
    window.addEventListener("close-cart-drawer", closeCart);

    return () => {
      window.removeEventListener("open-cart-drawer", openCart);
      window.removeEventListener("close-cart-drawer", closeCart);
    };
  }, []);

  // VIEW CONTENT TRACKING (New)
  useEffect(() => {
    if (!product) return;

    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "ViewContent", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: Number(product.priceRange?.minVariantPrice?.amount || selectedVariant?.price?.amount || 0),
        currency: product.priceRange?.minVariantPrice?.currencyCode || selectedVariant?.price?.currencyCode || "INR",
      });
    }
  }, [product]);

  // FETCH REVIEWS (Real)
  useEffect(() => {
    async function fetchReviewSummary() {
      if (!product?.id) return;
      try {
        const res = await fetch(`/api/reviews/list?productId=${encodeURIComponent(product.id)}`);
        const data = await res.json();
        const reviewList = data.reviews || [];

        if (reviewList.length > 0) {
          const avg = reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length;
          setReviewsSummary({ average: avg, total: reviewList.length });
        } else {
          setReviewsSummary({ average: 0, total: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch review summary:", err);
      }
    }
    fetchReviewSummary();
  }, [product?.id]);

  // Truncation logic for mobile description
  const getTruncatedHtml = (html, wordLimit) => {
    if (!html) return "";
    // Strip HTML tags to count words accurately
    const stripped = html.replace(/<[^>]*>/g, " ");
    const words = stripped.split(/\s+/).filter((w) => w.length > 0);
    if (words.length <= wordLimit) return null;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const truncatedDescription = getTruncatedHtml(product.descriptionHtml, 50);

  return (
    <>
      <Breadcrumbs currentTitle={product.title} />
      <div className="min-h-screen bg-white py-1 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 items-start">
            {/* IMAGE SECTION - Mobile/Tablet Slider + Desktop Grid */}
            <div className="space-y-6">
              <div className="relative group">
                {hasDiscount && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-red-600 text-white px-4 py-1.5 text-sm font-bold rounded-full shadow-lg">
                      {percentage}% OFF
                    </span>
                  </div>
                )}

                {/* Featured Image with Swipe Support */}
                <div
                  ref={imageRef}
                  className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-2 sm:p-4"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="rounded-xl w-full object-cover aspect-square transform group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />

                  {/* Navigation Buttons - Mobile & Tablet */}
                  {allImages.length > 1 && (
                    <>
                      {/* Left Button */}
                      <button
                        onClick={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
                        disabled={selectedImageIndex === 0}
                        className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>

                      {/* Right Button */}
                      <button
                        onClick={() => setSelectedImageIndex((prev) => Math.min(allImages.length - 1, prev + 1))}
                        disabled={selectedImageIndex === allImages.length - 1}
                        className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="space-y-3 px-1">
                  {/* Mobile & Tablet: Horizontal Scrollable Thumbnails */}
                  <div className="lg:hidden">
                    <div className="flex gap-2 overflow-x-auto p-2 pl-2 snap-x snap-mandatory scrollbar-hide">
                      {allImages.map((image, index) => {
                        const isSelected = selectedImageIndex === index;
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`
                              relative flex-shrink-0 w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden 
                              ${isSelected
                                ? "ring-1 ring-[#7d4b0e] shadow-md scale-105"
                                : "ring-1 ring-gray-200 hover:ring-[#7d4b0e]/40"
                              }
                            `}
                          >
                            <img
                              src={image.url}
                              alt={`View ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Selected indicator */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#7d4b0e]/10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-[#7d4b0e] rounded-full shadow-sm"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop: Grid of 2 thumbnails */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 pb-6 pt-4">
                    {allImages.map((image, index) => {
                      const isSelected = selectedImageIndex === index;

                      let buttonClasses = `
                        relative w-full aspect-square rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
                        ${isSelected
                          ? "ring-2 ring-[#7d4b0e] shadow-md"
                          : "ring-1 ring-gray-200 hover:ring-[#7d4b0e]/40"
                        }
                      `;

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={buttonClasses}
                        >
                          <img
                            src={image.url}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#7d4b0e] rounded-full shadow-sm bg-white"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILS SECTION */}
            <div
              className="space-y-6 md:pb-28"
            >
              <h1 className="text-xl  lg:text-4xl font-bold text-black md:mt-2 mb-1 md:mb-2 mt-0 leading-tight">
                {product.title}
              </h1>

              <div className="flex gap-2 flex-wrap hidden">
                {product.tags && product.tags.map((tag, idx) => (
                  <span key={idx} className="inline-block bg-yellow-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-md">
                    {tag}
                  </span>
                ))}
              </div>
              {/* PRICE - Now dynamic based on selected variant */}
              <div className="mb-0 md:mb-2">
                {hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span className="text-xl lg:text-2xl line-through text-gray-400 font-medium">
                        ₹{compare.toFixed(2)}
                      </span>
                      <span className="text-2xl lg:text-4xl font-bold text-orange-600">
                        ₹{price.toFixed(2)}
                      </span>
                      <span className="bg-[#7d4b0e] text-white px-4 py-1.5 rounded-full text-[8px] md:text-sm  font-semibold shadow-sm">
                        {percentage}% OFF
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-3xl lg:text-5xl font-bold text-orange-600">
                    ₹{price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-black text-[9px] md:text-[12px] text-gray-500 mb-1 md:mb-3">
                Tax Included.{" "}
                <a
                  href="/shipping-policy"
                  className="font-medium text-[#7d4b0e] hover:underline"
                >
                  Shipping
                </a> calculated at checkout.
              </p>

              {/* REVIEW STARS & COUNT */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(reviewsSummary.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {reviewsSummary.total > 0 ? reviewsSummary.average.toFixed(1) : "0.0"}
                </span>
                <span className="text-sm text-gray-500">
                  ({reviewsSummary.total} reviews)
                </span>
              </div>
              <LiveStats />


              <div className="bg-green-50 rounded-xl p-5 flex items-start gap-4 border border-green-200 shadow-sm mb-3 md:mb-4">
                <HandCoins className="w-7 h-7 text-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Rewards</h3>
                  <p className="text-gray-700 text-sm">
                    Shop for Rs.499/- & Get Free Shipping
                  </p>
                </div>

              </div>


              {/* Easebuzz Money Back Promise Badge */}
              {/* Razorpay Secure Payment Badge */}
              <button
                onClick={() => setShowRazorpayModal(true)}
                className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer"
              >
                {/* Top section */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Icon circle */}
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-xl">₹</span>
                    </div>

                    {/* Text */}
                    <div>
                      <div className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                        Razorpay
                      </div>
                      <div className="text-xs text-gray-700 font-medium">Secure Payment Partner</div>
                    </div>
                  </div>

                  {/* Right badge */}
                  <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    Trusted by Millions
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="mt-3 border-t border-blue-200 pt-2 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">🛡️</span>
                  <span className="text-xs">
                    <span className="font-semibold text-blue-700">100% Secure Payments</span> & Buyer Protection
                  </span>
                </div>
              </button>





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
              relative rounded-lg px-2 py-2 sm:px-4 sm:py-4 text-center font-medium
              border-2 transition-all duration-200 cursor-pointer
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
                    className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 disabled:opacity-40 
                transition shadow-sm text-xl lg:text-2xl text-white font-bold cursor-pointer"
                  >
                    –
                  </button>
                  <span className="md:mx-4 mx-2 text-xl font-semibold min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full 
                bg-[#7d4b0e] hover:bg-yellow-600 text-white transition shadow-sm 
                text-xl lg:text-2xl font-bold cursor-pointer"
                  >
                    +
                  </button>

                </div>

                {/* ADD TO CART */}
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !selectedVariant || selectedVariant?.availableForSale === false}
                  className={`w-full font-bold md:py-6 md:px-8 px-2 py-3 rounded-lg text-md md:text-lg shadow-lg transition-all duration-300 ${selectedVariant?.availableForSale === false
                    ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                    : "bg-[#7d4b0e] text-white hover:bg-yellow-600 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    }`}
                >
                  {selectedVariant?.availableForSale === false ? "Restocking Soon" : loading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={loading || !selectedVariant || selectedVariant?.availableForSale === false}
                className={`w-full font-bold md:py-6 md:px-8 px-2 py-3 rounded-lg text-md md:text-lg shadow-lg transition-all duration-300 ${selectedVariant?.availableForSale === false
                  ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                  : "bg-[#7d4b0e] text-white hover:bg-yellow-600 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  }`}
              >
                {selectedVariant?.availableForSale === false ? "Restocking Soon" : "Buy Now"}
              </button>

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
                        Free Shipping on Orders Above <b>₹499</b>
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
                        className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-gray-800 transition-all hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-50/50 focus:outline-none cursor-pointer"
                      >
                        <span className="text-base lg:text-lg">
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
              <div className="flex flex-nowrap justify-between gap-2 sm:gap-6 py-3">

                {/* 1. 100% Pure */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black border border-yellow-500 sm:border-4 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-5 h-5 sm:w-10 sm:h-10" />
                  </div>
                  <p className="mt-0.5 sm:mt-2 text-[9px] sm:text-sm font-semibold text-black text-center leading-tight">
                    100% Pure
                  </p>
                </div>

                {/* 2. Secure Payment */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black border border-yellow-500 sm:border-4 flex items-center justify-center">
                    <Lock className="text-yellow-400 w-5 h-5 sm:w-10 sm:h-10" />
                  </div>
                  <p className="mt-0.5 sm:mt-2 text-[9px] sm:text-sm font-semibold text-black text-center leading-tight">
                    Secure Pay
                  </p>
                </div>

                {/* 3. Zero Preservative */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black border border-yellow-500 sm:border-4 flex items-center justify-center">
                    <FlaskConical className="text-yellow-400 w-5 h-5 sm:w-10 sm:h-10" />
                  </div>
                  <p className="mt-0.5 sm:mt-2 text-[9px] sm:text-sm font-semibold text-black text-center leading-tight">
                    No Preserv.
                  </p>
                </div>

                {/* 4. Freshly Made */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black border border-yellow-500 sm:border-4 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-5 h-5 sm:w-10 sm:h-10" />
                  </div>
                  <p className="mt-0.5 sm:mt-2 text-[9px] sm:text-sm font-semibold text-black text-center leading-tight">
                    Fresh Made
                  </p>
                </div>

                {/* 5. Fast Shipping */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black border border-yellow-500 sm:border-4 flex items-center justify-center">
                    <Truck className="text-yellow-400 w-5 h-5 sm:w-10 sm:h-10" />
                  </div>
                  <p className="mt-0.5 sm:mt-2 text-[9px] sm:text-sm font-semibold text-black text-center leading-tight">
                    Fast Ship
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* DESCRIPTION */}
          {product.descriptionHtml && (
            <div className="md:mt-16 mt-5 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200">
                <h3 className="font-bold mb-6 text-2xl text-gray-800 text-center">
                  Product Details
                </h3>

                {/* Mobile View with Truncation */}
                <div className="md:hidden">
                  <div className="text-xs text-gray-700 text-left leading-relaxed text-center">
                    {isDescriptionExpanded || !truncatedDescription ? (
                      <>
                        <div
                          className="inline"
                          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                        />
                        <button
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="mt-3 text-[#7d4b0e] font-bold text-xs uppercase tracking-wider block mx-auto hover:underline cursor-pointer"
                        >
                          Read Less
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="inline">{truncatedDescription}</span>
                        <button
                          onClick={() => setIsDescriptionExpanded(true)}
                          className="ml-1 text-[#7d4b0e] font-bold text-xs uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          Read More
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop View (Full) */}
                <div className="hidden md:block">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 text-left leading-relaxed text-center"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* RAZORPAY SECURE PAYMENT POPUP */}
      {showRazorpayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000a3] bg-opacity-0"
          onClick={() => setShowRazorpayModal(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#0a2444] to-[#3395ff] text-white p-6 relative">
              <button
                onClick={() => setShowRazorpayModal(false)}
                className="absolute top-4 right-4 text-white cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-bold">₹</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Secured by Razorpay</h3>
                  <p className="text-blue-100 text-sm">Most Trusted Payment Gateway</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-blue-50 rounded-xl p-5 text-center border border-blue-100">
                <p className="text-gray-700">
                  Your payment is processed securely via <strong>Razorpay</strong>.<br />
                  We ensure <strong>100% Payment Protection</strong> on every transaction.
                </p>
                <p className="text-sm text-blue-600 font-medium mt-3">PCI-DSS Compliant • 128-bit Encryption</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex justify-center items-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Cards, UPI & Netbanking</p>
                    <p className="text-sm text-gray-600">All major payment modes accepted</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex justify-center items-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Instant Refunds</p>
                    <p className="text-sm text-gray-600">Automated refunds for failed transactions</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRazorpayModal(false)}
                className="w-full bg-[#0a2444] hover:bg-[#3395ff] transition-colors text-white font-bold py-4 rounded-xl cursor-pointer"
              >
                Okay, got it
              </button>
            </div>
          </div>
        </div>
      )}
      {showStickyBox && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:gap-3">

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

              <div>

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
                  px-2 sm:px-4 py-2 sm:py-2.5 pr-2 md:pr-10 
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
                <div className="bg-amber-50 border border-gray-300 rounded-lg md:px-3 px-2 md:py-2 py-1 shadow-sm w-fit">
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuantity(isNaN(value) || value < 1 ? 1 : value);
                    }}
                    className="w-8 sm:w-20 text-center text-sm sm:text-base font-semibold bg-transparent outline-none border-none focus:ring-0"
                  />
                </div>


                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !selectedVariant || selectedVariant?.availableForSale === false}
                  className={`font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 rounded-lg transition-all shadow-md whitespace-nowrap text-xs sm:text-sm flex items-center gap-2 ${selectedVariant?.availableForSale === false
                    ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                    : "bg-[#7d4b0e] text-white hover:bg-yellow-600"
                    }`}
                >
                  {selectedVariant?.availableForSale === false ? (
                    "Restocking Soon"
                  ) : loading ? (
                    "Adding..."
                  ) : (
                    <>
                      {/* Mobile */}
                      <span className="sm:hidden">ADD TO CART</span>

                      {/* Tablet & Desktop */}
                      <span className="hidden sm:inline">ADD TO CART</span>
                    </>
                  )}
                </button>


              </div>
            </div>
          </div>
        </div>
      )}
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">
              Login Required
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              You are not logged in. Please login to add items to your cart.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="px-4 py-2 border rounded-md text-gray-700 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLoginPopup(false);
                  window.location.href = "/auth/login";
                }}
                className="px-4 py-2 bg-black text-white rounded-md cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}