import Link from "next/link";
import { getAllCollections } from "@/lib/shopify";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function CollectionIndexPage() {
  const collections = await getAllCollections();

  return (
    <>
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="relative pt-4 overflow-hidden">

        <h1 className="text-3xl md:text-5xl font-bold text-[#7d4b0e] text-center mb-10">
          Our Collections
        </h1>
      </div>

      {/* Collections Grid */}
      <div className="bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {collections.map((col, index) => (
              <Link
                key={col.id}
                href={`/shopbycollection/${col.handle}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  {col.image ? (
                    <img
                      src={col.image.url}
                      alt={col.image.altText || col.title}
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                      <svg className="w-6 h-6 text-[#7d4b0e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-[#7d4b0e] mb-2 group-hover:text-amber-600 transition-colors duration-300">
                    {col.title}
                  </h3>

                  {col.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                      {col.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[#7d4b0e] font-medium text-sm">
                    <span>View Collection</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7d4b0e] via-[#7d4b0e] to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Premium Quality",
                description: "Hand-selected ingredients for the finest taste"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Traditional Methods",
                description: "Crafted using time-honored techniques"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Made with Love",
                description: "Every product tells a story of passion"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4 text-[#7d4b0e]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#7d4b0e] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in { 
          animation: fade-in 0.6s ease-out both; 
        }
      `}</style>
    </>
  );
}
