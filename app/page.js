// app/page.js   ← FINAL WORKING VERSION
import { getAllProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/Herosection";
import OurPromiseSection from "@/components/OurPromiseSection";
import KhakhraMakingProcess from "@/components/KhakhraMakingProcess";
import CraftsmanshipHeritageSection from "@/components/CraftsmanshipHeritageSection";
import ShopByOilPreferenceSection from "@/components/ShopByOilPreferenceSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import CallToActionSection from "@/components/CallToActionSection";
import FAQSection from "@/components/FAQSection";

export default async function HomePage() {
  const products = await getAllProducts(50);

  return (
    <div className="bg-[#fdfbf7]">
      <HeroSection />
      <OurPromiseSection />
      <div className="max-w-7xl mx-auto bg-[#fdfbf7] py-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#7C4A0E] text-center m-2">
          Our Top Selling Khakhra
        </h2>
        <p className="mt-4 text-[#cc760e] text-base sm:text-lg md:text-xl leading-relaxed text-center m-2">
          Freshly crafted, lovingly made. Explore our bestsellers from WooCommerce.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <KhakhraMakingProcess/>    
      <CraftsmanshipHeritageSection/>    
      <ShopByOilPreferenceSection/>    
      <TestimonialsCarousel/>    
      <CallToActionSection/>    
      <FAQSection/>    
    </div>
  );
}