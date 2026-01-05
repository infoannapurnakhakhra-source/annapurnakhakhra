// app/api/cart/route.js
import { getCart } from "@/lib/shopify";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}