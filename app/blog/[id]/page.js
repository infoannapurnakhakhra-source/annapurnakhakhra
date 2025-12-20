"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiCalendar, FiArrowLeft, FiUser } from "react-icons/fi";

// Same blog array (or fetch from DB/API in real app)
const blogPosts = [
  {
    id: "1",
    title: "The Secret Spices Behind Our Methi Khakhra",
    excerpt: "Discover the ancient Gujarati herbs that make our methi khakhra irresistibly flavorful.",
    date: "November 15, 2025",
    category: "Recipes",
    image: "/7.webp",
    readTime: "5 min read",
    author: "Priya Patel",
    content: `
      <p>Khakhra, the beloved Gujarati snack, owes its magic to a symphony of spices...</p>
    `,
  },
  {
    id: "2",
    title: "Why Khakhra is the Ultimate Snack for Busy Bees",
    excerpt: "In a fast-paced world, khakhra offers crunch without the crash.",
    date: "October 28, 2025",
    category: "Health",
    image: "/k9.webp",
    readTime: "4 min read",
    author: "Dr. Amit Shah",
    content: `<p>In today's hustle, finding a snack that's satisfying yet guilt-free...</p>`,
  },
];

export default function BlogDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blog = blogPosts.find((b) => b.id === id);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-700 mb-4 text-lg">Blog not found.</p>
        <button
          onClick={() => router.push("/blog")}
          className="px-8 py-2 bg-[#0A1721] text-white rounded-lg hover:bg-[#132838] transition-all duration-300"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-12 py-12">
      <article className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-amber-600 mb-6 font-semibold hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Blogs
        </button>

        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-md">
          <motion.img
            src={blog.image}
            alt={blog.title}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mt-8 mb-4">{blog.title}</h1>
        <div className="flex gap-4 text-amber-700 text-sm mb-8">
          <span className="flex items-center gap-1"><FiCalendar /> {blog.date}</span>
          <span className="flex items-center gap-1"><FiUser /> {blog.author}</span>
        </div>

        <div
          className="prose prose-lg prose-amber max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}
