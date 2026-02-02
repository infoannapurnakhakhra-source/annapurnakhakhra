// // app/api/cart/add/route.js
// import { addToCartServer } from "@/lib/shopify";  
// import connectDB from "@/lib/mongodb";
// import UserCart from "@/lib/models/UserCart";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     await connectDB();
//     const {
//       variantId,
//       quantity = 1,
//       customerId,
//       cartId: providedCartId, 
//     } = await request.json();
//     if (!variantId) {
//       return NextResponse.json(
//         { error: "variantId is required" },
//         { status: 400 }
//       );
//     }
//     let existingCart = null;
//     let effectiveCartId = providedCartId;
//     if (customerId) {
//       existingCart = await UserCart.findOne({ customerId });
//       effectiveCartId = existingCart?.cartId || null;
//     } else if (!effectiveCartId) {
//       effectiveCartId = null;
//     }
//     const shopifyCart = await addToCartServer(
//       variantId,
//       quantity,
//       effectiveCartId
//     );
//     if (!shopifyCart?.id) {
//       throw new Error("Shopify cart creation failed");
//     }
//     const items = (shopifyCart.lines?.edges || []).map(({ node }) => ({
//       variantId: node.merchandise.id,
//       title: node.merchandise.title,
//       productTitle: node.merchandise.product.title,
//       quantity: node.quantity,
//       price: parseFloat(node.merchandise.price.amount),
//       image:
//         node.merchandise.product.featuredImage?.url || "",
//     }));
//     if (customerId) {
//       await UserCart.findOneAndUpdate(
//         { customerId },
//         {
//           customerId,
//           cartId: shopifyCart.id,
//           checkoutUrl: shopifyCart.checkoutUrl,
//           totalQuantity: shopifyCart.totalQuantity,
//           items, 
//           updatedAt: new Date(),
//         },
//         { upsert: true, new: true }
//       );
//     }
//     return NextResponse.json({
//       success: true,
//       cart: shopifyCart,
//       message: "Added to cart successfully",
//     });
//   } catch (error) {
//     console.error("❌ Cart Add Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Add to cart failed" },
//       { status: 500 }
//     );
//   }
// }





// /app/api/cart/add/route.js — Fixed: No Strict GID Validation
import { addToCartServer } from "@/lib/shopify";  
import connectDB from "@/lib/mongodb";
import UserCart from "@/lib/models/UserCart";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      variantId,
      quantity = 1,
      customerShopifyId: customerId,
      cartId: providedCartIdFromBody,
    } = body || {};

    // Prefer cartId from body, but fall back to X-Cart-Id header for compatibility with older clients
    let providedCartId = providedCartIdFromBody || request.headers.get("x-cart-id") || null;

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    // Log inputs (keep for debug)
    console.log("🛒 Add Inputs:", { 
      variantId: typeof variantId === 'string' ? variantId.substring(0, 30) + '...' : variantId, 
      quantity, 
      customerId: customerId ? customerId.substring(0, 30) + '...' : 'guest' 
    });

    // 🔥 REMOVED: Strict GID check — lib auto-converts numeric/partial IDs
    // if (!variantId.startsWith('gid://shopify/ProductVariant/')) {
    //   return NextResponse.json({ error: "Invalid variantId..." }, { status: 400 });
    // }

    let effectiveCartId = providedCartId;
    let existingCart = null;

    if (customerId) {
      existingCart = await UserCart.findOne({ customerId });
      effectiveCartId = existingCart?.cartId || null;
    }

    let shopifyCart;
    try {
      shopifyCart = await addToCartServer(
        variantId,  // Lib converts if needed: e.g., 123 → gid://shopify/ProductVariant/123
        quantity,
        effectiveCartId,
        customerId
      );
    } catch (addError) {
      console.error("🚨 Shopify Add Error:", addError.message);
      throw new Error(`Add failed: ${addError.message}`);
    }

    if (!shopifyCart?.id || shopifyCart.totalQuantity === 0) {
      console.error("🚨 Post-Add Cart Invalid:", shopifyCart);
      throw new Error("Cart updated but no items—variant may not exist or be published");
    }

    // Items Mapping (with fallback)
    let items = shopifyCart.items || [];
    if (!items.length && shopifyCart.lines?.edges) {
      items = shopifyCart.lines.edges.map(({ node }) => ({
        id: node.id,
        variantId: node.merchandise.id,
        title: node.merchandise.title,
        productTitle: node.merchandise.product.title,
        quantity: node.quantity,
        price: parseFloat(node.merchandise.price.amount),
        image: node.merchandise.product.featuredImage?.url || "",
      }));
    }

    console.log("✅ Added Successfully:", { 
      cartId: shopifyCart.id.substring(0, 30) + '...', 
      totalQuantity: shopifyCart.totalQuantity, 
      newItem: items[items.length - 1]?.productTitle || 'Unknown' 
    });

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
      cart: { ...shopifyCart, items },
      message: "Added to cart successfully",
    });

  } catch (error) {
    console.error("❌ Full Add Error:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Add to cart failed" },
      { status: 500 }
    );
  }
}