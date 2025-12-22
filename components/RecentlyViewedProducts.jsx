"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import { getAllProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* =======================
   CUSTOM BREAKPOINT HOOK
   ======================= */
function useScreenWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

export default function RecentlyViewedProducts() {
  const [products, setProducts] = useState([]);
  const screenWidth = useScreenWidth();

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

  if (!products.length) return null;

  /* =======================
     CUSTOM BREAKPOINT LOGIC
     ======================= */
  let slidesToShow = 1;
  let arrows = false;
  let centerMode = true;
  let variableWidth = false;
  let centerPadding = "16px";

  /* MOBILE */
  if (screenWidth < 640) {
    slidesToShow = 1;
    centerMode = true;
    variableWidth = true;
  }

  /* TABLET */
  if (screenWidth >= 640 && screenWidth < 1024) {
    slidesToShow = 2;
    centerMode = false;
    variableWidth = false;
  }

  /* LAPTOP */
  if (screenWidth >= 1024 && screenWidth < 1280) {
    slidesToShow = 3;
    arrows = true;
  }

  /* DESKTOP */
  if (screenWidth >= 1280) {
    slidesToShow = 4;
    arrows = true;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    arrows,
    centerMode,
    variableWidth,
    centerPadding,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section className="mt-12 bg-yellow-100">
      <h2 className="text-xl sm:text-2xl font-semibold py-6 text-center">
        Recently Viewed
      </h2>

      <div className="relative px-2 sm:px-6 md:px-12 pb-10">
        <Slider {...settings}>
          {products.map((product, index) => (
            <div
              key={product.id || index}
              className="px-2"
              style={variableWidth ? { width: 280 } : undefined}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

/* =======================
   ARROWS
   ======================= */

function NextArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Next"
      className="absolute top-1/2 right-[-32px] -translate-y-1/2
                 bg-[#7d4b0e] hover:bg-yellow-600
                 text-white p-2 rounded shadow z-20"
    >
      ➡
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Previous"
      className="absolute top-1/2 left-[-32px] -translate-y-1/2
                 bg-[#7d4b0e] hover:bg-yellow-600
                 text-white p-2 rounded shadow z-20"
    >
      ⬅
    </button>
  );
}
