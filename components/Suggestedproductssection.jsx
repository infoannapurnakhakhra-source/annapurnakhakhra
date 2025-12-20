"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import { Star } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MAX_VISIBLE = 40;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ;
const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ;

export default function YouMayAlsoLike({ currentCartItems = [] }) {
  const router = useRouter();
  const sliderRef = useRef(null);

  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productReviews, setProductReviews] = useState({}); 
  
  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${ADMIN_API_BASE_URL.replace(/\/$/, "")}/api/suggested/list?activeOnly=true`
      );
      const data = await res.json();

      if (data.success) {
        const cartProductIds = currentCartItems.map(
          (item) => item.shopifyProductId
        );

        const filtered = (data.products || []).filter(
          (p) => !cartProductIds.includes(p.shopifyProductId)
        );

        setVisible(filtered.slice(0, MAX_VISIBLE));
      }
    } catch (err) {
      console.error("Suggested fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH REVIEWS PER PRODUCT ---------------- */
  const fetchReview = async (shopifyProductId) => {
    if (!shopifyProductId || productReviews[shopifyProductId]) return;

    try {
      const res = await fetch(
        `/api/reviews/list?productId=${encodeURIComponent(
          shopifyProductId
        )}`
      );
      const data = await res.json();

      if (data?.success) {
        setProductReviews((prev) => ({
          ...prev,
          [shopifyProductId]: {
            rating: data.avgRating || 0,
            count: data.totalReviews || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Review fetch failed", err);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    visible.forEach((p) => fetchReview(p.shopifyProductId));
  }, [visible]);

  useEffect(() => {
    const onCartUpdate = () => fetchSuggestions();
    window.addEventListener("cart-updated", onCartUpdate);
    return () =>
      window.removeEventListener("cart-updated", onCartUpdate);
  }, [currentCartItems]);

  /* ---------------- ACTIONS ---------------- */
  const handleAddToCart = async (product) => {
    const customerId = localStorage.getItem("customerShopifyId");

    try {
      const res = await fetch(`${BASE_URL.replace(/\/$/, "")}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: product.variantId,
          quantity: 1,
          customerId: customerId || null,
        }),
      });

      const data = await res.json();
      if (!data?.success) throw new Error();

      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      alert("Failed to add to cart");
    }
  };

  const goToProduct = (handle) => {
    window.dispatchEvent(new Event("close-cart-drawer"));
    setTimeout(() => router.push(`/product/${handle}`), 80);
  };

  if (loading || visible.length === 0) return null;

  /* ---------------- SLIDER SETTINGS ---------------- */
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    arrows: false,
  };

  return (
    <div className="border-t border-gray-200 pt-3 md:pt-5 md:px-5 pb-2 px-2">
      <h3 className="text-sm font-semibold text-[#7d4b0e] mb-3 uppercase tracking-wide">
        You May Also Like
      </h3>

      {/* ---------------- MOBILE ---------------- */}
      <div className="block lg:hidden">
        <Slider ref={sliderRef} {...sliderSettings}>
          {Array.from(
            { length: Math.ceil(visible.length / 2) },
            (_, i) => (
              <div key={i}>
                <div className="flex gap-2 px-1">
                  {[visible[i * 2], visible[i * 2 + 1]].map(
                    (product) =>
                      product && (
                        <MobileProductCard
                          key={product._id}
                          product={product}
                          review={
                            productReviews[
                              product.shopifyProductId
                            ]
                          }
                          onAdd={handleAddToCart}
                          onOpen={goToProduct}
                        />
                      )
                  )}
                </div>
              </div>
            )
          )}
        </Slider>
      </div>

      {/* ---------------- DESKTOP ---------------- */}
      <div className="hidden lg:block space-y-3">
        {visible.map((product) => (
          <DesktopProductCard
            key={product._id}
            product={product}
            review={productReviews[product.shopifyProductId]}
            onAdd={handleAddToCart}
            onOpen={goToProduct}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- STAR RATING (ACCURATE AVG) ---------------- */
function StarRating({ rating = 0, count = 0 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= fullStars) {
          return (
            <Star
              key={i}
              size={12}
              className="fill-yellow-400 text-yellow-400"
            />
          );
        }

        if (i === fullStars + 1 && hasHalf) {
          return (
            <div key={i} className="relative">
              <Star size={12} className="text-gray-300" />
              <Star
                size={12}
                className="fill-yellow-400 text-yellow-400 absolute top-0 left-0"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            </div>
          );
        }

        return (
          <Star
            key={i}
            size={12}
            className="text-gray-300"
          />
        );
      })}

      <span className="text-[11px] font-medium text-gray-700 ml-1">
        {rating.toFixed(1)}
      </span>

      {count > 0 && (
        <span className="text-[10px] text-gray-500">
          ({count})
        </span>
      )}
    </div>
  );
}

/* ---------------- MOBILE CARD ---------------- */
function MobileProductCard({ product, review, onAdd, onOpen }) {
  const price = Number(product.price || 0);
  const compareAt = Number(product.compareAtPrice || 0);

  return (
    <div className="w-1/2 border border-gray-200 rounded-lg p-2 bg-white">
      <div
        onClick={() => onOpen(product.productHandle)}
        className="w-16 h-16 mx-auto mb-1 rounded-md overflow-hidden bg-gray-50 cursor-pointer"
      >
        <img
          src={product.featuredImageUrl}
          alt={product.title}
          className="w-full h-full object-contain"
        />
      </div>

      <h4 className="text-xs font-medium line-clamp-2">
        {product.title}
      </h4>

      <StarRating {...review} />

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-1.5">
             <span className="font-bold text-xs text-orange-600">
               ₹{price}
             </span>
             {compareAt > price && (
              <span className="text-[10px] line-through text-gray-400">
                ₹{compareAt}
              </span>
            )}
          </div>
        <button
          onClick={() => onAdd(product)}
          className="bg-[#7d4b0e] text-white text-[10px] px-2 py-1 rounded"
        >
          ADD
        </button>
      </div>
    </div>
  );
}

/* ---------------- DESKTOP CARD ---------------- */
function DesktopProductCard({ product, review, onAdd, onOpen }) {
  const price = Number(product.price || 0);
  const compareAt = Number(product.compareAtPrice || 0);
  return (
    <div className="flex gap-3 border border-gray-200 rounded-lg p-3 bg-white">
      <div
        onClick={() => onOpen(product.productHandle)}
        className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 cursor-pointer"
      >
        <img
          src={product.featuredImageUrl}
          alt={product.title}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-medium line-clamp-2">
          {product.title}
        </h4>

        <StarRating {...review} />

        <div className="flex justify-between items-center mt-2">
         <div className="flex items-center gap-1.5">
             <span className="font-bold text-xs text-orange-600">
               ₹{price}
             </span>
             {compareAt > price && (
              <span className="text-[10px] line-through text-gray-400">
                ₹{compareAt}
              </span>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            className="bg-[#7d4b0e] text-white text-xs px-3 py-1 rounded"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
