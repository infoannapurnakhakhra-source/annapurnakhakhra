"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroSection({
  images = ["/b9.webp"], // slideshow images
  autoSlideInterval = 5000, // 5 sec interval
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto slideshow
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [images.length, autoSlideInterval]);

  const currentAlt = `Image ${currentImageIndex + 1}`;

  // Scroll top on load (optional)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <header className="w-full overflow-hidden bg-gray-50">
      <div className="overflow-hidden relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[650px] 2xl:h-[1200]">
        <Image
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={currentAlt}
          fill
          priority
          className="
            object-cover
            transition-all 
            duration-1000 
            ease-out 
            animate-fadeIn
            brightness-75
          "
          onError={(e) => {
            e.target.src = "/fallback-hero.jpg";
          }}
        />
      </div>
    </header>
  );
}
