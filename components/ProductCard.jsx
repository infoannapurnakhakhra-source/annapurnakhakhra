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
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    /* ---------------- REVIEWS ---------------- */
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?.id) return;

            try {
                const res = await fetch(
                    `/api/reviews/list?productId=${encodeURIComponent(product.id)}`
                );
                const data = await res.json();
                const reviews = data.reviews || [];

                setReviewCount(reviews.length);

                const avg =
                    reviews.length > 0
                        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                        : 0;

                setAverageRating(avg);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            }
        };

        fetchReviews();
    }, [product?.id]);

    /* ---------------- HANDLERS ---------------- */
    const handleViewClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setModalLoading(true);
        const fetchedProduct = await getProductByHandle(product.handle);
        setModalProduct(fetchedProduct);
        setIsModalOpen(true);
        setModalLoading(false);
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const customerShopifyId = localStorage.getItem("customerShopifyId");
        // Allow guests to add to cart (we'll pass customerShopifyId null when not logged in).

        let variantId =
            product.variantId ||
            product?.variants?.edges?.[0]?.node?.id ||
            product?.variants?.nodes?.[0]?.id ||
            product?.variants?.[0]?.id;

        if (!variantId) {
            alert("No variant available");
            return;
        }

        const cleanVariantId = variantId.includes("gid://")
            ? variantId.split("/").pop()
            : variantId;

        setLoading(true);

        try {
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    variantId: cleanVariantId,
                    quantity: 1,
                    customerShopifyId: customerShopifyId || null,
                    cartId: localStorage.getItem("cartId") || localStorage.getItem("guestCartId") || null,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.error || "Add to cart failed");
            }

            if (data.cart?.id) {
                localStorage.setItem("guestCartId", data.cart.id);
                localStorage.setItem("cartId", data.cart.id);
            }

            // TRACKING CODE START
            const priceVal = Number(product?.price?.amount || 0);
            const currencyVal = product?.price?.currencyCode || 'INR';

            if (typeof window.gtag !== 'undefined') {
                window.gtag('event', 'add_to_cart', {
                    currency: currencyVal,
                    value: priceVal,
                    items: [{
                        item_id: cleanVariantId,
                        item_name: product.title,
                        price: priceVal,
                        quantity: 1
                    }]
                });
            }

            if (typeof window.fbq !== 'undefined') {
                window.fbq('track', 'AddToCart', {
                    content_ids: [cleanVariantId],
                    content_name: product.title,
                    currency: currencyVal,
                    value: priceVal,
                    content_type: 'product'
                });
            }
            // TRACKING CODE END

            window.dispatchEvent(new Event("cart-updated"));
            window.dispatchEvent(new Event("open-cart-drawer"));
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- PRICE ---------------- */
    const price = Number(product?.price?.amount || 0);
    const compareAt = Number(product?.compareAtPrice?.amount || 0);
    const hasDiscount = compareAt > price;

    const discountPercent = hasDiscount
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;

    const isOutOfStock = product?.availableForSale === false;

    /* ---------------- STARS ---------------- */
    const displayRating = reviewCount === 0 ? 5 : averageRating;
    return (
        <>
            <Link href={`/product/${product.handle}`} className="cursor-auto">
                <motion.div className="bg-white/90 backdrop-blur-md border border-white/30 hover:shadow-2xl rounded-3xl overflow-hidden px-3 pb-6 pt-3 group">
                    {/* IMAGE */}
                    <div className="relative h-[220px] md:h-[240px] overflow-hidden rounded-2xl mt-3">
                        {hasDiscount && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                {discountPercent}% OFF
                            </span>
                        )}

                        {product.featuredImage ? (
                            <Image
                                src={product.featuredImage.url}
                                alt={product.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-2xl">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* INFO */}
                    <div className="mt-4">
                        <h6 className="text-gray-600 text-sm">{product.vendor}</h6>

                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${s <= Math.round(displayRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                        }`}
                                />
                            ))}
                            {reviewCount > 0 && (
                                <span className="text-sm text-gray-600">
                                    {averageRating.toFixed(1)} ({reviewCount})
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-[#7C4A0E] line-clamp-2 min-h-[3rem]">
                            {product.title}
                        </h3>

                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xl font-bold text-orange-600">
                                ₹{price}
                            </span>
                            {hasDiscount && (
                                <span className="text-lg line-through text-gray-400">
                                    ₹{compareAt}
                                </span>
                            )}
                        </div>

                        {product.defaultVariant?.title && (
                            <p className="text-xs text-gray-600 font-medium mt-1">
                                Weight: {product.defaultVariant.title}
                            </p>
                        )}
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={loading || isOutOfStock}
                                className={`flex-7 py-3 rounded-lg transition text-sm font-medium ${
                                    isOutOfStock
                                        ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                                        : "bg-[#7d4b0e] text-white hover:bg-yellow-600 cursor-pointer"
                                }`}
                            >
                                {isOutOfStock ? "Restocking Soon" : loading ? "Adding..." : "Add to Cart"}
                            </button>

                            <button
                                onClick={handleViewClick}
                                className="flex-1 flex items-center justify-center bg-[#7d4b0e] text-white py-3 rounded-lg hover:bg-yellow-600 transition cursor-pointer"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </Link>

            {isModalOpen && modalProduct && (
                <ProductModal
                    product={modalProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {showLoginPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm text-center">
                        <h2 className="text-lg font-semibold mb-2">Login Required</h2>
                        <p className="text-sm text-gray-600 mb-5">
                            Please login to add items to your cart.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowLoginPopup(false)}
                                className="px-4 py-2 border rounded-md cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => (window.location.href = "/auth/login")}
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
