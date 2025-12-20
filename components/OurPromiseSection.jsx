"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.1, 0.25, 1]
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1]
    },
  },
};

export default function OurPromiseSection({
  image = "12.webp",
  title = "Our Promise: Purity in Every Bite.",
  introText = "At Annapurna Khakhra, we believe that real taste comes from real ingredients. Every khakhra is handmade in small batches, prepared with premium wheat, pure spices, and the warmth of traditional Gruh Udhyog values.",
  promiseItems = [
    "Clean, hygienic preparation",
    "Pure ingredients with no shortcuts",
    "Authentic slow-roasting technique",
    "Home-style recipe passed down through generations",
  ],
  ctaText = "Learn More",
  ctaHref = "about",
}) {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-white py-20 md:py-32 overflow-hidden"
    >
      {/* ANIMATED BACKGROUND PATTERN */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #F59E0B 2px, transparent 0)",
          backgroundSize: "80px 80px",
          y,
        }}
      />

      {/* FLOATING ACCENT SHAPES */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 right-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        style={{ opacity }}
      >
        {/* ⭐ ENHANCED 3D IMAGE SECTION ⭐ */}
        <motion.div
          className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] group"
          variants={itemVariants}
        >
          <motion.div
            className="relative w-full h-full overflow-hidden rounded-[32px] shadow-2xl"
            whileHover={{
              rotateY: 8,
              rotateX: -5,
              scale: 1.02,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            style={{
              perspective: "1400px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* DECORATIVE RING */}
            <div className="absolute -inset-4 bg-[#7C4A0E] rounded-[36px] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            
            {/* IMAGE CONTAINER */}
            <div className="relative w-full h-full overflow-hidden rounded-[32px] ring-1 ring-amber-300/40 group-hover:ring-amber-400/60 transition-all duration-500">
              <motion.img
                src={image}
                alt="Fresh ingredients used to craft authentic khakhra"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                style={{ 
                  transform: "translateZ(60px)",
                  filter: "brightness(1.05) contrast(1.08)",
                }}
              />

              {/* ENHANCED OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none" />
              
              {/* SHIMMER EFFECT */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: "linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </div>

            {/* FLOATING BADGE */}
            <motion.div
              className="absolute top-2 right-2 bg-[#7C4A0E] font-heading text-white font-bold px-6 py-3 rounded-2xl shadow-xl"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.8, 
                type: "spring", 
                stiffness: 200 
              }}
            >
              100% Pure
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ⭐ ENHANCED CONTENT SECTION ⭐ */}
        <motion.div
          className="flex flex-col justify-center space-y-8"
          variants={containerVariants}
        >
          {/* TITLE WITH IMPROVED GRADIENT */}
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            variants={itemVariants}
          >
            <span className="bg-[#7C4A0E] font-heading bg-clip-text text-transparent drop-shadow-sm">
              {title}
            </span>
          </motion.h2>

          {/* INTRO TEXT */}
          <motion.p
            className="text-[#cc760e] font-body text-lg sm:text-xl lg:text-1xl max-w-1xl leading-relaxed font-light"
            variants={itemVariants}
          >
            {introText}
          </motion.p>

          {/* ENHANCED PROMISE LIST */}
          <motion.ul
            className="space-y-5 text-slate-700 text-base sm:text-lg lg:text-xl max-w-2xl"
            variants={itemVariants}
          >
            {promiseItems.map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start group cursor-default"
                variants={listItemVariants}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className="relative mr-5 mt-1 flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    delay: 0.5 + index * 0.1,
                  }}
                >
                  <div className="absolute inset-0 bg-[#cc760e] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative w-7 h-7 bg-[#7C4A0E] rounded-full shadow-lg flex items-center justify-center ring-2 ring-white group-hover:ring-[#cc760e] transition-all duration-300">
                    <motion.span 
                      className="text-white text-sm font-bold"
                      whileHover={{ scale: 1.2 }}
                    >
                      ✓
                    </motion.span>
                  </div>
                </motion.div>
                <span className="group-hover:text-[#cc760e] font-heading text-[#7C4A0E] transition-colors duration-300 font-medium">
                  {item}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* ENHANCED CTA BUTTON */}
          <motion.a
            href={ctaHref}
            className="group relative inline-flex items-center font-body justify-center gap-3 bg-gradient-to-r from-[#7C4A0E] to-[#aa7534] text-white font-bold px-10 py-5 rounded-2xl shadow-xl overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              y: -4,
              boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.4)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* BUTTON BACKGROUND ANIMATION */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            <span className="relative z-10 text-lg">{ctaText}</span>
            
            <motion.span
              className="relative z-10 text-xl"
              animate={{ x: [0, 4, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              →
            </motion.span>

            {/* SHINE EFFECT */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              }}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* ENHANCED BOTTOM WAVE */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
        <motion.svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-20 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <motion.path
            d="M0,20 Q300,60 600,40 T1200,20 L1200,80 L0,80 Z"
            fill="url(#waveGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          <motion.path
            d="M0,40 Q300,10 600,30 T1200,40 L1200,80 L0,80 Z"
            fill="#FFFBEB"
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          />
        </motion.svg>
      </div>
    </section>
  );
}