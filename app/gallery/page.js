"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function KhakhraGallery() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  const products = [
    { id: "Bajri-khakhra-made-with-pure-ghee", src: "/Bajri Khakhra 3.webp", alt: "Masala Khakhra", title: "Bajri Khakhra", description: "Crispy, spicy, and perfectly roasted khakhra for everyday cravings." },
    { id: "Jeera-khakhra-made-with-pure-ghee", src: "/Chana Khakhra 3 - Copy.png", alt: "Jeera Khakhra", title: "Jeera Khakhra", description: "Light, flavorful khakhra infused with premium roasted cumin." },
    { id: "Methi-khakhra-made-with-pure-ghee", src: "/Chat Khakhra 3.webp", alt: "Methi Khakhra", title: "Methi Khakhra", description: "Traditional Gujarati methi khakhra made with authentic spices." },
    { id: "Bajri-khakhra-made-with-pure-ghee", src: "/Makar Sankranti Elderly Couple Eating Khakhra - Copy.png", alt: "Mag khakhra", title: "Mag khakhra", description: "Healthy Mag khakhra packed with nutrition and taste." },
    { id: "211", src: "/Navratri Friends Group Enjoying Khakhra.webp", alt: "Panipuri Khakhra", title: "Panipuri Khakhra", description: "Tangy panipuri-flavored crispy khakhra snack." },
    { id: "208", src: "/Diwali Family Eating Khakhra.webp", alt: "Manchurian Khakhra", title: "Manchurian Khakhra", description: "Mumbai-style Manchurian taste packed in thin khakhra." },
  ];

  return (
    <div className="bg-[#f2f3f5]">
      <div className="max-w-7xl mx-auto p-6 md:pt-16 font-sans">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold font-heading text-amber-800 mb-3 tracking-tight">
            Khakhra Product Gallery
          </h1>
          <p className="text-amber-700 font-body text-lg max-w-2xl mx-auto">
            Fresh, crispy & authentically handcrafted Khakhra — Delivered from our kitchen to your home.
          </p>
        </motion.header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.04 }}
              className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg bg-white"
              onClick={() => setSelectedImage(item)}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={800}
                height={600}
                className="w-full h-56 object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col md:flex-row gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 text-3xl text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>

                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  width={800}
                  height={600}
                  className="w-full md:w-1/2 h-auto rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-amber-800 mb-3">
                    {selectedImage.title}
                  </h2>
                  <p className="text-gray-700 mb-6">{selectedImage.description}</p>

                  <button
                    onClick={() => window.location.href = `/product/${selectedImage.id}`}
                    className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-all"
                  >
                    Order Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
