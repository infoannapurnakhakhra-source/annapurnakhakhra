// import connectDB from "@/lib/mongodb";
// import UserCart from "@/lib/models/UserCart";
// import { getCartById } from "@/lib/shopify";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const { customerShopifyId } = await req.json();

//     if (!customerShopifyId) {
//       return NextResponse.json(
//         { error: "customerShopifyId required" },
//         { status: 400 }
//       );
//     }

//     // 1. Find saved cart in MongoDB
//     const userCart = await UserCart.findOne({ customerId: customerShopifyId });

//     if (!userCart?.cartId) {
//       return NextResponse.json({ cart: null, message: "No cart found for user" });
//     }

//     const cartId = userCart.cartId;

//     // 2. Fetch real-time cart from Shopify
//     const cart = await getCartById(cartId);

//     // 3. if Shopify cart expired / deleted
//     if (!cart) {
//       return NextResponse.json({
//         cart: null,
//         expired: true,
//         message: "Cart expired or deleted on Shopify",
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       cart,
//       checkoutUrl: cart.checkoutUrl,
//       totalQuantity: cart.totalQuantity,
//     });

//   } catch (error) {
//     console.error("GET CART ERROR:", error);

//     return NextResponse.json(
//       { error: true, message: error.message },
//       { status: 500 }
//     );
//   }
// }





import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { createCart, getCartById } from "@/lib/shopify"; // Import createCart
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { customerShopifyId, cartId: providedCartId } = await req.json();
    
    let cart = null;
    let effectiveCartId = providedCartId;
    let isExpired = false;
    let message = "";

    if (customerShopifyId) {
      // 1. For logged-in: Try to find saved cartId in MongoDB
      let userCart = await UserCart.findOne({ customerId: customerShopifyId });
      effectiveCartId = userCart?.cartId || providedCartId;
      
      if (effectiveCartId) {
        // 2. Fetch real-time from Shopify
        cart = await getCartById(effectiveCartId);
        // 3. If expired/empty, clear from Mongo and mark
        if (!cart || cart.totalQuantity === 0 || (cart.items?.length === 0 && !cart.lines?.edges?.length)) {
          await UserCart.updateOne({ customerId: customerShopifyId }, { $unset: { cartId: "" } });
          userCart = null;
          effectiveCartId = null;
          isExpired = true;
          message = "Customer cart expired/cleared";
        }
      }
      
      // 4. If still no valid cart, create & save one
      if (!effectiveCartId) {
        cart = await createCart({ buyerIdentity: { customer: { id: customerShopifyId } } }); // Associate with customer
        effectiveCartId = cart.id;
        // Upsert into MongoDB
        await UserCart.updateOne(
          { customerId: customerShopifyId },
          { $set: { cartId: effectiveCartId } },
          { upsert: true }
        );
        message = "New cart created for customer";
      }
    } else if (providedCartId) {
      // Guest: Fetch by provided cartId
      cart = await getCartById(providedCartId);
      if (!cart || cart.totalQuantity === 0 || (cart.items?.length === 0 && !cart.lines?.edges?.length)) {
        isExpired = true;
        cart = null; // Return empty
        message = "Guest cart expired/empty";
      } else {
        message = "Guest cart loaded";
      }
      effectiveCartId = cart?.id || null;
    } else {
      // No IDs: Create empty cart for new guest/session
      cart = await createCart();
      effectiveCartId = cart.id;
      message = "New empty cart created";
    }

    // 5. Final response
    return NextResponse.json({
      success: true,
      cart,
      checkoutUrl: cart?.checkoutUrl || null,
      totalQuantity: cart?.totalQuantity || 0,
      expired: isExpired, // Client can clear localStorage if true and guest
      message,
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return NextResponse.json(
      { error: true, message: error.message || "Failed to load cart" },
      { status: 500 }
    );
  }
}

