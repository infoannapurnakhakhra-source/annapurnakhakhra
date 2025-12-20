import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { getCartById } from "@/lib/shopify";
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

    // 1. Find saved cart in MongoDB
    const userCart = await UserCart.findOne({ customerId: customerShopifyId });

    if (!userCart?.cartId) {
      return NextResponse.json({ cart: null, message: "No cart found for user" });
    }

    const cartId = userCart.cartId;

    // 2. Fetch real-time cart from Shopify
    const cart = await getCartById(cartId);

    // 3. if Shopify cart expired / deleted
    if (!cart) {
      return NextResponse.json({
        cart: null,
        expired: true,
        message: "Cart expired or deleted on Shopify",
      });
    }

    return NextResponse.json({
      success: true,
      cart,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });

  } catch (error) {
    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      { error: true, message: error.message },
      { status: 500 }
    );
  }
}
