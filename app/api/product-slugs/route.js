export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllProductSlugs } from "@/lib/shopify";

export async function GET() {
  try {
    // ✅ Just call the function
    const slugs = await getAllProductSlugs(250);

    return NextResponse.json({
      success: true,
      count: slugs.length,
      slugs,
    });
  } catch (error) {
    console.error("Failed to fetch product slugs:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product slugs",
      },
      { status: 500 }
    );
  }
}
