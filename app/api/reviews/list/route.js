import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Get productId from query params
    const productId = req.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/api/reviews/list?productId=${encodeURIComponent(
      productId
    )}`;

    const backend = await fetch(url, { method: "GET" });
    const raw = await backend.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Backend did not return valid JSON",
          backendReturned: raw,
          url,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: backend.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
