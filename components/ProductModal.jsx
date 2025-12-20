"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductQuickViewModal({ isOpen, onClose, product }) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const price = Number(selectedVariant?.price?.amount || 0);
  const compare = Number(selectedVariant?.compareAtPrice?.amount || 0);
  const hasDiscount = compare > price;
  const percentage = hasDiscount && compare > 0 ? Math.round(((compare - price) / compare) * 100) : null;

  const allImages = product.images || [];
  const displayImage = allImages[selectedImageIndex]?.url || product.featuredImage?.url || "/placeholder.jpg";

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
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Failed to add to cart");
    }

    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("open-cart-drawer"));

    onClose();          
    setQuantity(1);    

  } catch (error) {
    console.error("Add to cart failed:", error);
    alert("Failed: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleViewDetails = () => {
    const slug = product.handle || product.id;
    router.push(`/product/${slug}`);
    onClose();
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* CLOSE BUTTON */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* LEFT: IMAGE SECTION */}
                  <div className="relative bg-gray-50 p-8">
                    {hasDiscount && (
                      <div className="absolute top-8 left-8 z-10">
                        <span className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                          {percentage}% OFF
                        </span>
                      </div>
                    )}

                    {/* MAIN IMAGE */}
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-xl bg-white p-3 shadow-md">
                        <img
                          src={displayImage}
                          alt={product.title}
                          className="w-full h-[400px] object-cover rounded-lg"
                        />
                      </div>

                      {/* IMAGE NAVIGATION ARROWS */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* THUMBNAIL IMAGES */}
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {allImages.slice(0, 4).map((image, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative overflow-hidden rounded-lg bg-white p-2 cursor-pointer transition-all ${selectedImageIndex === index
                                ? "ring-2 ring-[#7d4b0e] shadow-lg"
                                : "hover:shadow-md"
                              }`}
                          >
                            <img
                              src={image.url}
                              alt={`${product.title} - ${index + 1}`}
                              className="w-full h-16 object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: PRODUCT DETAILS */}
                  <div className="p-8 max-h-[600px] overflow-y-auto">
                    {/* PRODUCT TYPE */}
                    {product.productType && (
                      <div className="inline-block mb-3">
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {product.productType}
                        </p>
                      </div>
                    )}

                    {/* TITLE */}
                    <Dialog.Title as="h2" className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {product.title}
                    </Dialog.Title>

                    {/* PRICE */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
                      {hasDiscount ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-4xl font-bold text-orange-600">
                              ₹{price.toFixed(2)}
                            </span>
                            <span className="text-xl line-through text-gray-400 font-medium">
                              ₹{compare.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#7d4b0e] text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {percentage}% OFF
                            </span>
                            <span className="text-[#7d4b0e] font-semibold text-sm">
                              You save ₹{(compare - price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-4xl font-bold text-orange-600">
                          ₹{price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* VARIANT SELECTOR */}
                    {product.variants.length > 1 && (
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
                        <h3 className="font-semibold mb-3 text-base text-gray-800">
                          Choose Variant:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((variant) => (
                            <button
                              key={variant.id}
                              onClick={() => {
                                setSelectedVariant(variant);
                                setQuantity(1);
                              }}
                              className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${selectedVariant?.id === variant.id
                                  ? "bg-[#7d4b0e] text-white border-[#7d4b0e]"
                                  : "border-gray-300 hover:border-[#7d4b0e]"
                                }`}
                            >
                              {variant.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QUANTITY SELECTOR */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center bg-amber-50 border border-gray-300 rounded-full px-1 py-1 shadow-sm">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-yellow-600 disabled:opacity-40 transition text-xl text-white font-bold"
                        >
                          –
                        </button>
                        <span className="mx-4 text-lg font-semibold min-w-[30px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-yellow-600 text-white transition text-xl font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* ADD TO CART */}
                      <button
                        onClick={handleAddToCart}
                        disabled={loading || !selectedVariant}
                        className="flex-1 bg-[#7d4b0e] text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {loading ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>

                    {/* SHORT DESCRIPTION */}
                    {product.description && (
                      <div className="mb-6">
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* VIEW FULL DETAILS BUTTON */}
                    <button
                      onClick={handleViewDetails}
                      className="w-full border-2 border-[#7d4b0e] text-[#7d4b0e] font-semibold py-3 px-6 rounded-lg hover:bg-[#7d4b0e] hover:text-white transition-all duration-300"
                    >
                      View Full Details
                    </button>

                    {/* TRUST INDICATORS */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>100% Pure</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Fast Delivery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}