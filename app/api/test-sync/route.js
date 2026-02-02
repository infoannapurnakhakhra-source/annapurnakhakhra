// app/api/force-cart/route.js   ← CREATE THIS FILE NOW
import connectDB from "@/lib/mongodb";
import CustomCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const result = await CustomCart.create({
    shopifyCustomerId: "1111111111111",
    shopifyCartId: "gid://shopify/Cart/FORCE123",
    items: [{ title: "ANAPURNA KHAKHRA - FORCE TEST", quantity: 10, price: 999 }],
    totalQuantity: 10,
  });

  return NextResponse.json({
    success: true,
    message: "FORCE DATA INSERTED!",
    insertedId: result._id,
  });
}