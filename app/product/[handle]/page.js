// product/[handle]/page.js
import { getProductByHandle } from "@/lib/shopify";
import ProductDetailsClient from "./product-details-client";
import YouMayAlsoLikeServer from "@/components/YouMayAlsoLikeServer";
import Reviews from "@/components/Reviews";
import PromoSection from "@/components/PromoSection";
import BestSellerSection from "@/components/BestSellerSection";
import FAQSection from "@/components/FAQSection";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import WhatsAppCommunitySection from "@/components/WhatsAppCommunitySection";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { handle } = await params;

  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return (
    <>
      <ProductDetailsClient product={product} />
      <PromoSection />
      <BestSellerSection />
      <Reviews productId={product.id} />
      <YouMayAlsoLikeServer />
      <RecentlyViewedProducts/>
      <FAQSection />
      <WhatsAppCommunitySection/>
    </>
  );
}
