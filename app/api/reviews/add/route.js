import { NextResponse } from "next/server";

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ;

export async function POST(req) {
  try {
    const body = await req.json();

    // Ensure productId is sent in body
    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "productId is required in request body" },
        { status: 400 }
      );
    }

    // Call backend to add review
    const response = await fetch(`${ADMIN_API_BASE_URL.replace(/\/$/, "")}/api/reviews/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
