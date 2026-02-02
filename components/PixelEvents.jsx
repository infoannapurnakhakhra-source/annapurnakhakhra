"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PixelEvents() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [lastPath, setLastPath] = useState("");

    useEffect(() => {
        // Construct full URL for tracking
        const url = window.location.href;

        // De-duplicate if the path hasn't actually changed (optional, but good)
        if (url === lastPath) return;
        setLastPath(url);

        // 1. Meta Pixel PageView
        if (typeof window.fbq !== "undefined") {
            window.fbq("track", "PageView");
        }

        // 2. Google Analytics Page_View
        if (typeof window.gtag !== "undefined") {
            window.gtag("event", "page_view", {
                page_location: url,
                page_path: pathname,
            });
        }
    }, [pathname, searchParams]);

    return null;
}
