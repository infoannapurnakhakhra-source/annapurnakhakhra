"use client";

import Reviews from "@/components/Reviews";

export default function ReviewsTestPage() {
  const testProductId = "gid://shopify/Product/"; // put any test ID

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reviews Component Test</h1>

      <Reviews productId={testProductId} />
    </div>
  );
}
