export default function PromoSection() {
  return (
    <section className="w-full bg-amber-100 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE – IMAGE */}
        <div className="flex">
          <img
            src="/14.webp"
            alt="Promo"
            className="w-full object-contain"
          />
        </div>

        {/* RIGHT SIDE – TEXT */}
        <div className="flex flex-col max-w-md mx-auto justify-center text-center md:text-left space-y-4 p-3">
          <h2 className="text-4xl font-bold text-[#7d4b0e] mb-3">
            Shop Now
          </h2>
          <p className="text-lg text-gray-700">
            Fill Your Cart with Devotion – Get Free Shipping on Orders Above ₹999!
          </p>
          <button className="px-10 py-3 bg-[#7d4b0e] text-white rounded-full font-semibold w-fit mx-auto md:mx-0 hover:bg-[#6b400c] transition">
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  );
}
