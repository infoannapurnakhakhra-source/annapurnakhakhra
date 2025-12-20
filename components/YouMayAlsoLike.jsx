"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "@/components/ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function YouMayAlsoLikeSlider({ products }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!products?.length) return null;
  if (!mounted) return null;

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
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
          centerMode: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
          centerMode: false,
        },
      },
    ],
  };

  return (
    <section className="mt-6 sm:mt-8 md:mt-12 relative bg-amber-100 backdrop-blur-md">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold py-3 sm:py-4 md:py-6 text-center px-2 sm:px-4">
        You May Also Like
      </h2>
      <div className="min-h-[250px] sm:min-h-[200px] relative px-8 sm:px-10 md:px-12 lg:px-14 pb-6 sm:pb-8 md:pb-10">
        <Slider {...settings}>
          {products.map((product, index) => (
            <div key={product.id || index} className="px-2 sm:px-2 md:px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

// Custom arrows positioned inside the slider container
function SampleNextArrow({ className, style, onClick }) {
  return (
    <button
      className="absolute top-1/2 text-white right-0 sm:right-[-20px] md:right-[-30px] transform -translate-y-1/2 z-20 bg-[#7d4b0e] hover:bg-yellow-600 p-2 sm:p-2 md:p-2.5 rounded-sm shadow transition-colors duration-200"
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      aria-label="Next slide"
    >
      <span className="text-base sm:text-base md:text-lg">➡</span>
    </button>
  );
}

function SamplePrevArrow({ className, style, onClick }) {
  return (
    <button
      className="absolute top-1/2 text-white left-0 sm:left-[-20px] md:left-[-30px] transform -translate-y-1/2 z-20 bg-[#7d4b0e] hover:bg-yellow-600 p-2 sm:p-2 md:p-2.5 rounded-sm shadow transition-colors duration-200"
      style={{ ...style, display: 'block' }}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <span className="text-base sm:text-base md:text-lg">⬅</span>
    </button>
  );
}