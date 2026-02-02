import { notFound } from "next/navigation";
import { getBlogByHandle } from "@/lib/shopify";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedArticlesSlider from "@/components/RelatedArticlesSlider";

/* ===============================
   SEO METADATA
================================ */
// export async function generateMetadata({ params }) {
//   const { blogHandle, handle } = await params;

//   if (!blogHandle || !handle) return {};

//   const blog = await getBlogByHandle(blogHandle);
//   if (!blog) return {};

//   const article = blog.articles.find(a => a.handle === handle);
//   if (!article) return {};

//   return {
//     title: `${article.title} | Annapurna Khakhra`,
//     description:
//       article.excerpt?.replace(/<[^>]*>/g, "") ||
//       "Read the latest updates from Annapurna Khakhra.",
//   };
// }

/* ===============================
   BLOG DETAIL PAGE
================================ */

export default async function BlogDetailPage({ params }) {
  const { blogHandle, handle } = await params;

  if (!blogHandle || !handle) return notFound();

  const blog = await getBlogByHandle(blogHandle);
  if (!blog) return notFound();

  const article = blog.articles.find(a => a.handle === handle);
  if (!article) return notFound();

  /* ===============================
     PREV / NEXT LOGIC
  ================================ */
  const articles = blog.articles;

  const currentIndex = articles.findIndex(
    a => a.handle === handle
  );

  const totalArticles = articles.length;

  const prevArticle =
    currentIndex > 0
      ? articles[currentIndex - 1]
      : articles[totalArticles - 1]; // last article

  const nextArticle =
    currentIndex < totalArticles - 1
      ? articles[currentIndex + 1]
      : articles[0]; // first article

  const relatedArticles = articles
    .filter(a => a.handle !== handle)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);



  return (
    <>
      <Breadcrumbs currentTitle={article.title} />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* ===============================
           HERO SECTION
        ================================ */}
        <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
          {article.image?.url && (
            <>
              <img
                src={article.image.url}
                alt={article.image.altText || article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          )}

          {/* Title Overlay */}
          <div className="absolute inset-0 flex items-center justify-center px-8 sm:px-12 text-center">
            <div className="max-w-4xl mx-auto md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl leading-tight md:text-left">
                {article.title}
              </h1>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-3 rounded-full border border-white/30 inline-flex">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white text-base sm:text-lg font-semibold drop-shadow-lg">
                  {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===============================
           CONTENT
        ================================ */}
        <article className="max-w-4xl mx-auto -mt-20 relative z-10 px-6 pb-20">
          <div className="bg-white px-8 py-14 shadow-xl rounded-lg">
            <div
              className="prose prose-lg prose-amber max-w-none"
              dangerouslySetInnerHTML={{
                __html: article.contentHtml,
              }}
            />
          </div>
        </article>

        {/* ===============================
           PREV / NEXT NAVIGATION
        ================================ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
  <div className="border-t border-gray-200 pt-12 grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* PREVIOUS */}
    <a
      href={`/blog/${blogHandle}/${prevArticle.handle}`}
      className="group relative flex items-center gap-4 p-1 rounded-xl bg-white border border-gray-100 hover:border-amber-200 transition-all duration-300 overflow-hidden"
    >
      {/* Arrow - Full Height */}
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-full rounded-l-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>

      {/* Image */}
      {prevArticle.image?.url && (
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden my-3">
          <img
            src={prevArticle.image.url}
            alt={prevArticle.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0 py-4 pr-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
          {prevArticle.title}
        </h3>
      </div>

      {/* Bottom line on hover - slides from RIGHT */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right"></div> */}
    </a>

    {/* NEXT */}
    <a
      href={`/blog/${blogHandle}/${nextArticle.handle}`}
      className="group relative flex items-center flex-row-reverse gap-4 p-1 rounded-xl bg-white border border-gray-100 hover:border-amber-200 transition-all duration-300 overflow-hidden"
    >
      {/* Arrow - Full Height */}
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-full rounded-r-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Image */}
      {nextArticle.image?.url && (
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden my-3">
          <img
            src={nextArticle.image.url}
            alt={nextArticle.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0 text-right py-4 pl-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
          {nextArticle.title}
        </h3>
      </div>

      {/* Bottom line on hover - slides from LEFT */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div> */}
    </a>

  </div>
</section>

        <RelatedArticlesSlider
          articles={relatedArticles}
          blogHandle={blogHandle}
        />


      </main>
    </>
  );
}
