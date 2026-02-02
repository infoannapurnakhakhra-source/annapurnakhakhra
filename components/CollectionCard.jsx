import Link from "next/link";

export default function CollectionCard({ collection }) {
  return (
    <Link href={`/collection/${collection.handle}`}>
      <div className="group cursor-pointer rounded-xl overflow-hidden shadow hover:shadow-lg transition">
        {collection.image && (
          <img
            src={collection.image.url}
            alt={collection.image.altText || collection.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition"
          />
        )}
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold text-[#7d4b0e]">
            {collection.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
