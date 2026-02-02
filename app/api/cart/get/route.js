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
import { createCart, getCartById, saveCustomerCartId } from "@/lib/shopify"; // Import createCart and saveCustomerCartId
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
      // 1. For logged-in: If a client provided a cartId (guest cart), prefer it and associate to customer
      let userCart = await UserCart.findOne({ customerId: customerShopifyId });

      if (providedCartId) {
        // Try to load the provided guest cart
        const providedCart = await getCartById(providedCartId).catch(() => null);
        if (providedCart && providedCart.totalQuantity > 0) {
          cart = providedCart;
          effectiveCartId = providedCartId;
          // Persist association in MongoDB and Shopify metafield
          await UserCart.updateOne(
            { customerId: customerShopifyId },
            { $set: { cartId: effectiveCartId } },
            { upsert: true }
          );
          try {
            await saveCustomerCartId(customerShopifyId, effectiveCartId);
          } catch (e) {
            console.warn("Failed to save customer cart id to Shopify metafield:", e.message || e);
          }
          message = "Associated provided guest cart to customer";
        } else {
          // Provided cart invalid/empty — fall back to DB or create new
          effectiveCartId = userCart?.cartId || null;
        }
      } else {
        effectiveCartId = userCart?.cartId || null;
      }

      if (effectiveCartId && !cart) {
        // Fetch real-time from Shopify
        cart = await getCartById(effectiveCartId).catch(() => null);
        // If expired/empty, clear from Mongo and mark (but do not auto-create another unless needed)
        if (!cart || cart.totalQuantity === 0 || (cart.items?.length === 0 && !cart.lines?.edges?.length)) {
          await UserCart.updateOne({ customerId: customerShopifyId }, { $unset: { cartId: "" } });
          userCart = null;
          effectiveCartId = null;
          isExpired = true;
          message = "Customer cart expired/cleared";
        }
      }

      // If still no valid cart, create & save one
      if (!effectiveCartId) {
        cart = await createCart({ buyerIdentity: { customer: { id: customerShopifyId } } }); // Associate with customer
        effectiveCartId = cart.id;
        // Upsert into MongoDB
        await UserCart.updateOne(
          { customerId: customerShopifyId },
          { $set: { cartId: effectiveCartId } },
          { upsert: true }
        );
        try {
          await saveCustomerCartId(customerShopifyId, effectiveCartId);
        } catch (e) {
          console.warn("Failed to save new customer cart id to Shopify metafield:", e.message || e);
        }
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

