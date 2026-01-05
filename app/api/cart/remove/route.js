// app/api/cart/remove/route.js
import { removeCartLine } from "@/lib/shopify";

export async function POST(req) {
  try {
    const { cartId, lineId } = await req.json();
    if (!cartId || !lineId) {
      return Response.json({ error: "cartId and lineId required" }, { status: 400 });
    }
    const updatedCart = await removeCartLine(cartId, lineId);
    return Response.json({ success: true, cart: updatedCart });
  } catch (err) {
    console.error("Cart remove API failed:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}