"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function RelatedArticlesSlider({ articles, blogHandle }) {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-3">
          You May So Like
        </h2>
        {/* <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"></div> */}
      </div>

      <div className="relative px-12">
        {/* LEFT BUTTON */}
        <button 
          className="related-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed border border-amber-100 cursor-pointer"
          aria-label="Previous slide"
        >
          <svg 
            className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* RIGHT BUTTON */}
        <button 
          className="cursor-pointer related-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed border border-amber-100"
          aria-label="Next slide"
        >
          <svg 
            className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: ".related-prev",
            nextEl: ".related-next",
          }}
          loop={articles.length > 3}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {articles.map((item) => (
            <SwiperSlide key={item.id}>
              <a
                href={`/blog/${blogHandle}/${item.handle}`}
                className="group block h-full"
              >
                <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-2 h-full flex flex-col border border-gray-100">
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-[16/10]">
                    {item.image?.url ? (
                      <>
                        <img
                          src={item.image.url}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                        <svg 
                          className="w-16 h-16 text-amber-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Date Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <svg 
                        className="w-4 h-4 text-amber-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time className="text-sm font-medium text-amber-700">
                        {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors duration-300 line-clamp-2 mb-3 flex-1">
                      {item.title}
                    </h3>

                    {/* Read More Link */}
                    <div className="flex items-center text-amber-600 font-semibold text-sm group-hover:text-amber-700 transition-colors">
                      <span>Read More</span>
                      <svg 
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
