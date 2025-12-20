"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestimonialsCarousel({
  title = "What Our Customers Say.",
  testimonials = [
    {
      text: "Khakhra Bliss is a game-changer! Fresh, crunchy, and packed with authentic flavor.",
      author: "Anjali R.",
      image: "/t2.webp",
    },
    {
      text: "The Ghee Khakhra is divine. It's like having a piece of home delivered to my door.",
      author: "Vikram P.",
      image: "/t1.webp",
    },
    {
      text: "Perfect snack for my family. Crispy and delicious!",
      author: "Priya S.",
      image: "/t6.webp",
    },
    {
      text: "Love the variety! Every flavor is unique and tasty.",
      author: "Rahul D.",
      image: "/t3.webp",
    },
  ],
  autoPlay = true,
  autoPlayInterval = 6000,
}) {
  const [startIndex, setStartIndex] = useState(0);
  const autoPlayRef = useRef();

  // Number of testimonials visible based on screen size
  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3; // Desktop
      if (window.innerWidth >= 640) return 2; // Tablet
      return 1; // Mobile
    }
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const prevSlide = () => {
    setStartIndex(
      startIndex === 0 ? testimonials.length - visibleCount : startIndex - 1
    );
  };

  const nextSlide = () => {
    setStartIndex(
      startIndex + visibleCount >= testimonials.length ? 0 : startIndex + 1
    );
  };

  const handleManualNavigation = (direction) => {
    direction === "next" ? nextSlide() : prevSlide();
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (autoPlay) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
    return () => clearInterval(autoPlayRef.current);
  }, []);

  // Handle slicing for infinite loop effect
  const getVisibleTestimonials = () => {
    if (startIndex + visibleCount <= testimonials.length) {
      return testimonials.slice(startIndex, startIndex + visibleCount);
    } else {
      // Wrap around for the last few items
      return [
        ...testimonials.slice(startIndex, testimonials.length),
        ...testimonials.slice(0, visibleCount - (testimonials.length - startIndex)),
      ];
    }
  };

  return (
    <section className="relative w-full bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#7C4A0E] leading-snug mb-14">
          {title}
        </h2>

        {/* Testimonials Grid */}
        <div className="relative">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto`}
          >
            {getVisibleTestimonials().map((testimonial, idx) => (
              <AnimatePresence key={startIndex + idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#fcf8f2] rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-amber-100"
                >
                  {/* Image */}
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl mb-4 ring-4 ring-[#f5c890]">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-[#7C4A0E] opacity-90 mb-3" />

                  {/* Text */}
                  <p className="text-[#7C4A0E] text-base md:text-lg font-body mb-2 leading-relaxed">
                    “{testimonial.text}”
                  </p>

                  {/* Author */}
                  <p className="text-[#cc760e] font-semibold font-heading text-sm md:text-base tracking-wide">
                    — {testimonial.author}
                  </p>
                </motion.div>
              </AnimatePresence>
            ))}
          </div>

          {/* Navigation Buttons */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleManualNavigation("prev")}
            aria-label="Previous testimonials"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#7C4A0E] shadow-lg p-3 rounded-full hover:scale-110 transition-transform border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <ChevronLeft className="h-6 w-6 text-[#ffffff]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleManualNavigation("next")}
            aria-label="Next testimonials"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#7C4A0E] shadow-lg p-3 rounded-full hover:scale-110 transition-transform border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <ChevronRight className="h-6 w-6 text-[#ffffff]" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
