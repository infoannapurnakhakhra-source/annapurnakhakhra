// app/api/cart/add/route.js
import { addToCartServer } from "@/lib/shopify";  
import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const {
      variantId,
      quantity = 1,
      customerId,
      cartId: providedCartId, 
    } = await request.json();
    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 }
      );
    }
    let existingCart = null;
    let effectiveCartId = providedCartId;
    if (customerId) {
      existingCart = await UserCart.findOne({ customerId });
      effectiveCartId = existingCart?.cartId || null;
    } else if (!effectiveCartId) {
      effectiveCartId = null;
    }
    const shopifyCart = await addToCartServer(
      variantId,
      quantity,
      effectiveCartId
    );
    if (!shopifyCart?.id) {
      throw new Error("Shopify cart creation failed");
    }
    const items = (shopifyCart.lines?.edges || []).map(({ node }) => ({
      variantId: node.merchandise.id,
      title: node.merchandise.title,
      productTitle: node.merchandise.product.title,
      quantity: node.quantity,
      price: parseFloat(node.merchandise.price.amount),
      image:
        node.merchandise.product.featuredImage?.url || "",
    }));
    if (customerId) {
      await UserCart.findOneAndUpdate(
        { customerId },
        {
          customerId,
          cartId: shopifyCart.id,
          checkoutUrl: shopifyCart.checkoutUrl,
          totalQuantity: shopifyCart.totalQuantity,
          items, 
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    return NextResponse.json({
      success: true,
      cart: shopifyCart,
      message: "Added to cart successfully",
    });
  } catch (error) {
    console.error("❌ Cart Add Error:", error);
    return NextResponse.json(
      { error: error.message || "Add to cart failed" },
      { status: 500 }
    );
  }
}