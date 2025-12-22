"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "@/components/ProductCard";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* =======================
   CUSTOM BREAKPOINT HOOK
   ======================= */
function useScreen() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

export default function YouMayAlsoLikeSlider({ products = [] }) {
  const screenWidth = useScreen();

  if (!products.length) return null;

  /* =======================
     CUSTOM BREAKPOINT LOGIC
     ======================= */
  let slidesToShow = 1;
  let arrows = false;
  let centerMode = true;
  let centerPadding = "16px";

  if (screenWidth >= 640) {
    slidesToShow = 2;
    centerMode = false;
  }

  if (screenWidth >= 1024) {
    slidesToShow = 3;
    arrows = true;
  }

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
    centerPadding,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section className="mt-6 sm:mt-8 md:mt-12 bg-amber-100">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold py-4 text-center">
        You May Also Like
      </h2>

      <div className="relative px-3 sm:px-6 md:px-12 lg:px-14 pb-10">
        <Slider {...settings}>
          {products.map((product, index) => (
            <div key={product.id || index} className="px-2 sm:px-3">
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
      className="absolute top-1/2 right-[-36px] -translate-y-1/2
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
      className="absolute top-1/2 left-[-36px] -translate-y-1/2
                 bg-[#7d4b0e] hover:bg-yellow-600
                 text-white p-2 rounded shadow z-20"
    >
      ⬅
    </button>
  );
}
