"use client";

import React from "react";
import Link from "next/link";

// Sample blog data (replace with API/database in production)
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

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-amber-100 py-12 px-6 sm:px-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-10 text-center">Khakhra Parampara</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-60 object-cover hover:scale-105 transition-transform duration-500"
            />

            <div className="p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-2">{post.title}</h2>
              <p className="text-amber-700 mb-4">{post.excerpt}</p>

              {/* Link to Blog Details with ID */}
              <Link
                href={`/blog/${post.id}`}
                className="text-amber-900 font-medium hover:text-amber-600"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
