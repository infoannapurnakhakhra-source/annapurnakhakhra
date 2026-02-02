// app/blog/page.js
import Link from "next/link";
import { getBlogs } from "@/lib/shopify";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Khakhra Parampara | Annapurna Khakhra",
  description: "Stories, recipes & health insights from Annapurna Khakhra.",
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  // Flatten all articles from all blogs
  const articles = blogs.flatMap(blog =>
    blog.articles.map(article => ({
      ...article,
      blogHandle: blog.handle,
    }))
  );

  if (!articles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">No blogs found.</h1>
      </div>
    );
  }

  return (<>
  <Breadcrumbs />
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50 to-amber-100 py-12 px-6 sm:px-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-10 text-center">
        Khakhra Parampara
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Article Image */}
            <img
              src={post.image?.url || "/blog-placeholder.webp"}
              alt={post.title}
              className="w-full h-75 object-cover hover:scale-105 transition-transform duration-500"
            />

            <div className="p-6">

              {/* Date */}
              {post.publishedAt && (
                <p className="text-sm text-amber-600 mb-3">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <h2 className="text-xl font-bold text-amber-900 mb-3">{post.title}</h2>
              {post.excerpt && (
                <p
                  className="text-amber-700 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              )}

              <Link
                href={`/blog/${post.blogHandle}/${post.handle}`}
                className="text-amber-900 font-medium hover:text-amber-600"
              >
                Read More →
              </Link>
            </div>
          </article>

        ))}
      </div>
    </main></>
  );
}
