// app/api/test-db/route.js   ← CREATE THIS FILE
import connectDB from "@/lib/mongodb";
import CustomCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // 1. Test connection
    const testDoc = await CustomCart.create({
      shopifyCustomerId: "TEST_CONNECTION_123",
      shopifyCartId: "test-cart-123",
      items: [{ title: "TEST ITEM", quantity: 1, price: 999 }],
      totalQuantity: 1,
    });

    // 2. Clean up
    await CustomCart.deleteOne({ shopifyCustomerId: "TEST_CONNECTION_123" });

    return NextResponse.json({
      success: true,
      message: "MongoDB is CONNECTED and WORKING perfectly!",
      testDocId: testDoc._id,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "MongoDB NOT connected or model issue",
    }, { status: 500 });
  }
}
