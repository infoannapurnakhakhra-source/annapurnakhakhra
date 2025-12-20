"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import { getAllProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function RecentlyViewedProducts() {
  const [products, setProducts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Fix hydration issue
  }, []);

  useEffect(() => {
    async function load() {
      const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      if (!ids.length) return;

      const allProducts = await getAllProducts(100);

      const viewedProducts = ids
        .map((id) => allProducts.find((p) => p.id === id))
        .filter(Boolean);

      setProducts(viewedProducts);
    }

    load();
  }, []);

  if (!products.length || !mounted) return null;

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="mt-12 relative bg-yellow-100 backdrop-blur-md">
      <h2 className="text-2xl font-semibold py-6 text-center">Recently Viewed</h2>

      <div className="min-h-[200px] relative px-10 pb-10">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="p-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}


function SampleNextArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 right-[-30px] z-20 transform -translate-y-1/2 
                 bg-[#7d4b0e] hover:bg-yellow-600 text-white p-2 rounded-sm shadow"
    >
      ➡
    </button>
  );
}

function SamplePrevArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 left-[-30px] z-20 transform -translate-y-1/2 
                 bg-[#7d4b0e] hover:bg-yellow-600 text-white p-2 rounded-sm shadow"
    >
      ⬅
    </button>
  );
}
