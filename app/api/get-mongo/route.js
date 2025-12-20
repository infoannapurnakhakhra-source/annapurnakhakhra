import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { customerShopifyId } = await req.json();

    if (!customerShopifyId) {
      return NextResponse.json({ success: false, cart: null });
    }

    const cart = await UserCart.findOne({ customerId: customerShopifyId });

    if (!cart) {
      return NextResponse.json({ success: true, cart: null });
    }

    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items,
        totalQuantity: cart.totalQuantity,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
