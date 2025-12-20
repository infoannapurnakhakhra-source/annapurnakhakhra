// app/api/address/create/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  const { customerId, address } = await request.json();

  // Basic validation
  if (!customerId || !address) {
    return NextResponse.json(
      { success: false, message: "Missing customerId or address" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/2025-04/customers/${customerId}/addresses.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            ...address,
            default: address.default || false, // set as default if checked
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || "Failed to create address");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create address error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}