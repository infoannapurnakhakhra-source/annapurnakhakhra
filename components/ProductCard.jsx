"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Star } from "lucide-react";
import ProductModal from "./ProductModal";
import { getProductByHandle } from "@/lib/shopify";

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;

      try {
        const res = await fetch(
          `/api/reviews/list?productId=${encodeURIComponent(product.id)}`
        );
        const data = await res.json();
        const reviewList = data.reviews || [];

        setReviewCount(reviewList.length);

        // Calculate average rating
        const avg =
          reviewList.length > 0
            ? reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length
            : 0;
        setAverageRating(avg);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchReviews();
  }, [product?.id]);

  const handleViewClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setModalLoading(true);

    const fetchedProduct = await getProductByHandle(product.handle);
    setModalProduct(fetchedProduct);
    setIsModalOpen(true);
    setModalLoading(false);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!product.variantId) {
      alert("Please select a variant");
      return;
    }

    const customerId = localStorage.getItem("customerShopifyId");
    const variantId = product.variantId.includes("gid://")
      ? product.variantId.split("/").pop()
      : product.variantId;
    setLoading(true);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          quantity: 1,
          customerId: customerId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Add to cart failed");
      }

      // 🔥 YE LINE ADD KARO – cartId ko localStorage mein save karo
      if (data.cart?.id) {
        localStorage.setItem("guestCartId", data.cart.id);
        localStorage.setItem("cartId", data.cart.id);
      }

      // TRACKING CODE START
      const priceVal = Number(product?.price?.amount || 0);
      const currencyVal = product?.price?.currencyCode || 'INR';

      // GA4
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'add_to_cart', {
          currency: currencyVal,
          value: priceVal,
          items: [{
            item_id: product.id,
            item_name: product.title,
            price: priceVal,
            quantity: 1
          }]
        });
      }

      // Meta Pixel
      if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'AddToCart', {
          content_ids: [product.id],
          content_name: product.title,
          currency: currencyVal,
          value: priceVal,
          content_type: 'product'
        });
      }
      // TRACKING CODE END

      // Events dispatch karo
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart-drawer"));



    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // Price logic
  const price = Number(product?.price?.amount || 0);
  const compareAt = Number(product?.compareAtPrice?.amount || 0);
  const hasDiscount = compareAt > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;

  // Render star rating
  const renderStars = () => {

    const displayRating = reviewCount === 0 ? 5 : averageRating;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(displayRating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Link href={`/product/${product.handle}`}>
        <motion.div
          whileHover={{
            // scale: 1.02,
            // boxShadow: "0px 25px 40px rgba(0,0,0,0.15)",
          }}

          className="bg-white/90 backdrop-blur-md border border-white/30 hover:shadow-2xl rounded-3xl overflow-hidden px-3 pb-6 pt-3 group cursor-pointer"
        >
          {/* IMAGE */}
          <div className="relative h-[220px] md:h-[240px] overflow-hidden rounded-2xl mt-3">
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.title}
                fill
                className="object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-2xl">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="mt-4">
            <h6 className="text-gray-600 text-sm">{product.vendor}</h6>

            {/* RATING */}
            <div className="flex items-center gap-2 mt-2">
              {renderStars()}
              {reviewCount > 0 && (
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviewCount})
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-[#7C4A0E] line-clamp-2 min-h-[3rem]">
              {product.title}
            </h3>




            {/* PRICE */}
            <div className="flex items-center gap-2 mt-2">
              {hasDiscount ? (
                <>
                  <span className="text-xl font-bold text-orange-600">
                    ₹{price}
                  </span>
                  <span className="text-lg line-through text-gray-400">
                    ₹{compareAt}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-orange-600">
                  ₹{price}
                </span>
              )}
            </div>

            {/* BUTTONS */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex-7 bg-[#7d4b0e] text-white py-3 rounded-lg hover:bg-yellow-600 transition font-medium text-sm disabled:opacity-70"
              >
                {loading ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={handleViewClick}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7d4b0e] text-white py-3 rounded-lg font-medium hover:bg-yellow-600 transition"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            {isModalOpen && modalProduct && (
              <ProductModal
                product={modalProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </motion.div>
      </Link>
    </>
  );
}
