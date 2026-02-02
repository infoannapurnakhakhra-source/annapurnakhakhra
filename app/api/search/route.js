import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/shopify";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const { products, collections } = await searchProducts(query);
        // Combine or categorize? Let's return the structured object so frontend can section it.
        return NextResponse.json({ results: { products, collections } });
    } catch (error) {
        return NextResponse.json({ error: "Failed to search" }, { status: 500 });
    }
}
