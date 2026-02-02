// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function TestimonialsCarousel({
//   title = "What Our Customers Say.",
//   testimonials = [
//     {
//       text: "Khakhra Bliss is a game-changer! Fresh, crunchy, and packed with authentic flavor.",
//       author: "Anjali R.",
//       image: "/t2.webp",
//     },
//     {
//       text: "The Ghee Khakhra is divine. It's like having a piece of home delivered to my door.",
//       author: "Vikram P.",
//       image: "/t1.webp",
//     },
//     {
//       text: "Perfect snack for my family. Crispy and delicious!",
//       author: "Priya S.",
//       image: "/t6.webp",
//     },
//     {
//       text: "Love the variety! Every flavor is unique and tasty.",
//       author: "Rahul D.",
//       image: "/t3.webp",
//     },
//   ],
//   autoPlay = true,
//   autoPlayInterval = 10000,
// }) {
//   const [startIndex, setStartIndex] = useState(0);
//   const autoPlayRef = useRef();

//   // Number of testimonials visible based on screen size
//   const getVisibleCount = () => {
//     if (typeof window !== "undefined") {
//       if (window.innerWidth >= 1024) return 3; // Desktop
//       if (window.innerWidth >= 640) return 2; // Tablet
//       return 1; // Mobile
//     }
//     return 3;
//   };

//   const [visibleCount, setVisibleCount] = useState(getVisibleCount());

//   useEffect(() => {
//     const handleResize = () => setVisibleCount(getVisibleCount());
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const prevSlide = () => {
//     setStartIndex(
//       startIndex === 0 ? testimonials.length - 1 : startIndex - 1
//     );
//   };

//   const nextSlide = () => {
//     setStartIndex((startIndex + 1) % testimonials.length);
//   };

//   const handleManualNavigation = (dir) => {
//     dir === "next" ? nextSlide() : prevSlide();
//     if (autoPlayRef.current) clearInterval(autoPlayRef.current);
//     if (autoPlay) {
//       autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
//     }
//   };

//   useEffect(() => {
//     if (autoPlay) {
//       autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
//     }
//     return () => clearInterval(autoPlayRef.current);
//   }, [startIndex]);

//   // Get visible testimonials with wrapping
//   const getVisibleTestimonials = () => {
//     const visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(testimonials[(startIndex + i) % testimonials.length]);
//     }
//     return visible;
//   };

//   return (
//     <section className="relative w-full bg-white py-20 md:py-28">
//       <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
//         {/* Title */}
//         <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#7C4A0E] leading-snug mb-14">
//           {title}
//         </h2>

//         {/* Testimonials Carousel Container */}
//         <div className="relative max-w-6xl mx-auto">
//           {/* Navigation Buttons - Outside the grid */}
//           <motion.button
//             whileTap={{ scale: 0.85 }}
//             onClick={() => handleManualNavigation("prev")}
//             aria-label="Previous testimonials"
//             className="absolute -left-4 sm:-left-6 lg:-left-16 top-1/2 -translate-y-1/2 z-10 bg-[#7C4A0E] shadow-lg p-3 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
//           >
//             <ChevronLeft className="h-6 w-6 text-white" />
//           </motion.button>

//           <motion.button
//             whileTap={{ scale: 0.85 }}
//             onClick={() => handleManualNavigation("next")}
//             aria-label="Next testimonials"
//             className="absolute -right-4 sm:-right-6 lg:-right-16 top-1/2 -translate-y-1/2 z-10 bg-[#7C4A0E] shadow-lg p-3 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
//           >
//             <ChevronRight className="h-6 w-6 text-white" />
//           </motion.button>

//           {/* Testimonials Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {getVisibleTestimonials().map((testimonial, idx) => {
//               const actualIndex = (startIndex + idx) % testimonials.length;
//               return (
//                 <AnimatePresence key={actualIndex} mode="wait">
//                   <motion.div
//                     key={`${actualIndex}-${startIndex}`}
//                     // initial={{ opacity: 0, x: 100 }}
//                     // animate={{ opacity: 1, x: 0 }}
//                     // exit={{ opacity: 0, x: -100 }}
//                     transition={{
//                       duration: 0.4,
//                       ease: "easeInOut",
//                     }}
//                     className="p-8 flex flex-col items-center bg-[#fcf8f2] rounded-3xl border border-amber-100"
//                   >
//                     {/* Image */}
//                     <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl mb-4 ring-4 ring-[#f5c890]">
//                       <img
//                         src={testimonial.image}
//                         alt={testimonial.author}
//                         className="w-full h-full object-cover"
//                         loading="lazy"
//                       />
//                     </div>

//                     {/* Quote Icon */}
//                     <Quote className="w-8 h-8 text-[#7C4A0E] opacity-90 mb-3" />

//                     {/* Text */}
//                     <p className="text-[#7C4A0E] text-base md:text-lg font-body mb-2 leading-relaxed">
//                       "{testimonial.text}"
//                     </p>

//                     {/* Author */}
//                     <p className="text-[#cc760e] font-semibold font-heading text-sm md:text-base tracking-wide">
//                       — {testimonial.author}
//                     </p>
//                   </motion.div>
//                 </AnimatePresence>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



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
  autoPlayInterval = 10000,
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
      startIndex === 0 ? testimonials.length - 1 : startIndex - 1
    );
  };

  const nextSlide = () => {
    setStartIndex((startIndex + 1) % testimonials.length);
  };

  const handleManualNavigation = (dir) => {
    dir === "next" ? nextSlide() : prevSlide();
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
  }, [startIndex]);

  // Get visible testimonials with wrapping
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(testimonials[(startIndex + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <section className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold font-heading text-[#7C4A0E] leading-snug mb-8 sm:mb-10 md:mb-12 lg:mb-14">
          {title}
        </h2>

        {/* Testimonials Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Buttons - Outside the grid */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleManualNavigation("prev")}
            aria-label="Previous testimonials"
            className="absolute -left-2 xs:-left-3 sm:-left-4 md:-left-6 lg:-left-10 top-1/2 -translate-y-1/2 z-10 bg-[#7C4A0E] shadow-lg p-2 sm:p-2.5 md:p-3 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleManualNavigation("next")}
            aria-label="Next testimonials"
            className="absolute -right-2 xs:-right-3 sm:-right-4 md:-right-6 lg:-right-10 top-1/2 -translate-y-1/2 z-10 bg-[#7C4A0E] shadow-lg p-2 sm:p-2.5 md:p-3 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </motion.button>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {getVisibleTestimonials().map((testimonial, idx) => {
              const actualIndex = (startIndex + idx) % testimonials.length;
              return (
                <AnimatePresence key={actualIndex} mode="wait">
                  <motion.div
                    key={`${actualIndex}-${startIndex}`}
                    // initial={{ opacity: 0, x: 100 }}
                    // animate={{ opacity: 1, x: 0 }}
                    // exit={{ opacity: 0, x: -100 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col items-center bg-[#fcf8f2] rounded-2xl sm:rounded-3xl border border-amber-100"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl mb-3 sm:mb-4 ring-4 ring-[#f5c890]">
                      <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Quote Icon */}
                    <Quote className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#7C4A0E] opacity-90 mb-2 sm:mb-3" />

                    {/* Text */}
                    <p className="text-[#7C4A0E] text-sm sm:text-base md:text-lg font-body mb-2 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <p className="text-[#cc760e] font-semibold font-heading text-xs sm:text-sm md:text-base tracking-wide">
                      — {testimonial.author}
                    </p>
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}