"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, ShoppingCart } from "lucide-react";

// convert ANY productId into a stable number
function hashToNumber(value) {
    if (!value) return 1;
    const str = value.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export default function LiveStats({ productId }) {
    const seed = useMemo(() => hashToNumber(productId), [productId]);

    const [bought, setBought] = useState(480 + (seed % 60));
    const [viewing, setViewing] = useState(280 + (seed % 40));
    const [active, setActive] = useState(0);

    // Rotate lines every 1.5s
    useEffect(() => {
        const rotate = setInterval(() => {
            setActive((prev) => (prev + 1) % 2);
        }, 1500);
        return () => clearInterval(rotate);
    }, []);

    // Update numbers slowly
    useEffect(() => {
        const update = setInterval(() => {
            setBought((p) => p + Math.floor(Math.random() * 2));
            setViewing((p) =>
                Math.max(1, p + (Math.random() > 0.5 ? 1 : -1))
            );
        }, 4000);
        return () => clearInterval(update);
    }, []);

    return (
        <div className="relative md:mt-4 mt-2 mb-3 md:mb-4 overflow-hidden rounded-xl border border-orange-200 bg-amber-50 px-4 py-3 shadow-sm">
            <div
                key={active}
                className="flex items-center gap-2 text-sm animate-fade-slide"
            >
                {active === 0 ? (
                    <>
                        <ShoppingCart className="h-4 w-4 text-[#7d4b0e]" />
                        <span className="font-bold text-[#7d4b0e] text-base">
                            {bought}
                        </span>
                        <span className="text-gray-800 text-xs md:text-sm">
                            Bought this in last 24 hours
                        </span>
                    </>
                ) : (
                    <>
                        <Eye className="h-4 w-4 text-[#7d4b0e]" />
                        <span className="font-bold text-[#7d4b0e] text-base">
                            {viewing}
                        </span>
                        <span className="text-gray-800 text-xs md:text-sm">
                            People viewing this right now
                        </span>
                    </>
                )}
            </div>

            <style>{`
        @keyframes fade-slide {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-slide {
          animation: fade-slide 0.35s ease-out;
        }
      `}</style>
        </div>
    );
}
