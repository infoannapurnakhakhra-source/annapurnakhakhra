// app/api/cart/update/route.js
import { updateCartLine, getCartById } from "@/lib/shopify";

export async function POST(req) {
  try {
    const { cartId, lineId, quantity } = await req.json();
    if (!cartId || !lineId || quantity == null) {
      return new Response(JSON.stringify({ success: false, error: "cartId, lineId & quantity required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const cart = await getCartById(cartId);
    if (!cart) {
      return new Response(JSON.stringify({ success: false, error: "Cart not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const updatedCart = await updateCartLine(cartId, lineId, quantity);
    return new Response(JSON.stringify({ success: true, cart: updatedCart }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}