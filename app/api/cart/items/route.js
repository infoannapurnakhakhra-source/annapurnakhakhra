// app/api/cart/items/route.js
import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { customerShopifyId } = await req.json();

    if (!customerShopifyId) {
      return NextResponse.json(
        { error: "customerShopifyId required" },
        { status: 400 }
      );
    }

    // 🔥 Find cart by customerShopifyId
    const userCart = await UserCart.findOne(
      { customerId: customerShopifyId },
      { items: 1, totalQuantity: 1, checkoutUrl: 1 }
    );

    if (!userCart) {
      return NextResponse.json({
        items: [],
        totalQuantity: 0,
        message: "Cart empty",
      });
    }

    return NextResponse.json({
      success: true,
      items: userCart.items,       
      totalQuantity: userCart.totalQuantity,
      checkoutUrl: userCart.checkoutUrl,
    });

  } catch (error) {
    console.error("GET CART ITEMS ERROR:", error);
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
