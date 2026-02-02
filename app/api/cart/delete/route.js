import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";

export async function POST(req) {
  try {
    await connectDB();
    const { customerShopifyId } = await req.json();

    if (!customerShopifyId) {
      return Response.json({ error: "customerShopifyId required" }, { status: 400 });
    }

    await UserCart.deleteOne({ customerId: customerShopifyId });

    return Response.json({ success: true, message: "Cart emptied successfully" });
  } catch (error) {
    console.log("DELETE CART ERROR:", error);
    return Response.json({ error: true, message: error.message }, { status: 500 });
  }
}
