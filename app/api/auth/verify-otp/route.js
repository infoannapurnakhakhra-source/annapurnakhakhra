import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { phone, storeName, enteredOtp, guestCartId } = body; // guestCartId optional; used to merge carts on login

  // Clean phone number
  let cleanPhone = phone.trim().replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) cleanPhone = cleanPhone.slice(-10);
  const fullPhone = `+91${cleanPhone}`;

  let existingCustomerId = null;

  // Step 1: Pehle Shopify mein check karo – is phone se customer hai kya?
  try {
    const searchRes = await fetch(
      `https://${storeName}/admin/api/2024-10/customers/search.json?query=${encodeURIComponent(`phone:"${fullPhone}"`)}`,
      {
        headers: {
          "X-Shopify-Access-Token":
            process.env.SHOPIFY_ADMIN_TOKEN ||
            process.env.SHOPIFY_ADMIN_API_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );

    if (searchRes.ok) {
      const result = await searchRes.json();
      if (result.customers && result.customers.length > 0) {
        existingCustomerId = result.customers[0].id.toString();
        console.log("Existing customer found:", existingCustomerId);
      }
    }
  } catch (err) {
    console.log("Shopify search failed, continuing...");
  }

  // Step 2: Ab megascale ki original API ko call karo
  const https = require("https");
  const agent = new https.Agent({ rejectUnauthorized: false });

  const megascaleRes = await fetch(
    `${process.env.NEXT_PUBLIC_OTP_API_BASE_URL}/annapurnakhakhra/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone,
        storeName: "hit-megascale.myshopify.com",
        enteredOtp: enteredOtp.trim(),
      }),
      agent,
    },
  );

  const megascaleData = await megascaleRes.json();

  // Step 3: Agar OTP sahi hai → hum apna smart response banayenge
  if (megascaleData.success) {
    const finalCustomerId =
      existingCustomerId || megascaleData.user?.storeEntry?.shopifyCustomerId;

    // Attempt to merge guest cart into customer's cart when guestCartId provided
    let mergeResult = { merged: false, mergedCartId: null };
    if (guestCartId && finalCustomerId) {
      try {
        const {
          getCustomerCartId,
          getCartById,
          saveCustomerCartId,
          addToCartServer,
        } = require("@/lib/shopify");
        const { syncCartToMongo } = require("@/lib/cartSync");
        const connectDB = require("@/lib/mongodb").default;
        const UserCart = require("@/lib/models/UserCart").default;

        await connectDB();

        try {
          const guestCart = await getCartById(guestCartId);
          if (
            guestCart &&
            guestCart.lines &&
            guestCart.lines.edges.length > 0
          ) {
            let customerCartId = await getCustomerCartId(finalCustomerId);

            if (!customerCartId) {
              // No existing customer cart — associate guest cart to customer
              await saveCustomerCartId(finalCustomerId, guestCart.id);
              customerCartId = guestCart.id;

              // Save to Mongo and mark merged
              await UserCart.findOneAndUpdate(
                { customerId: finalCustomerId },
                {
                  customerId: finalCustomerId,
                  cartId: guestCart.id,
                  checkoutUrl: guestCart.checkoutUrl,
                  totalQuantity: guestCart.totalQuantity,
                  items: guestCart.lines.edges.map(({ node }) => ({
                    variantId: node.merchandise.id,
                    quantity: node.quantity,
                    title: node.merchandise.title,
                    price: Number(node.merchandise.price.amount),
                    productTitle: node.merchandise.product.title,
                    image: node.merchandise.product.featuredImage?.url || null,
                  })),
                  updatedAt: new Date(),
                },
                { upsert: true, new: true },
              );

              try {
                await syncCartToMongo(finalCustomerId, guestCart);
              } catch (e) {
                console.warn(
                  "Failed to sync guest cart to Mongo after assignment:",
                  e.message || e,
                );
              }

              mergeResult = { merged: true, mergedCartId: customerCartId };
            } else if (customerCartId !== guestCart.id) {
              // Customer has a separate cart — move items from guest to customer
              for (const { node } of guestCart.lines.edges) {
                const variantId = node.merchandise.id;
                const qty = node.quantity;
                try {
                  await addToCartServer(variantId, qty, customerCartId);
                } catch (err) {
                  console.error(
                    "Failed to add guest item to customer cart:",
                    err.message || err,
                  );
                }
              }

              // Fetch updated customer cart and save to Mongo
              const updatedCart = await getCartById(customerCartId);
              if (updatedCart) {
                await UserCart.findOneAndUpdate(
                  { customerId: finalCustomerId },
                  {
                    customerId: finalCustomerId,
                    cartId: updatedCart.id,
                    checkoutUrl: updatedCart.checkoutUrl,
                    totalQuantity: updatedCart.totalQuantity,
                    items: updatedCart.lines.edges.map(({ node }) => ({
                      variantId: node.merchandise.id,
                      quantity: node.quantity,
                      title: node.merchandise.title,
                      price: Number(node.merchandise.price.amount),
                      productTitle: node.merchandise.product.title,
                      image:
                        node.merchandise.product.featuredImage?.url || null,
                    })),
                    updatedAt: new Date(),
                  },
                  { upsert: true, new: true },
                );

                try {
                  await saveCustomerCartId(finalCustomerId, updatedCart.id);
                } catch (e) {
                  console.warn(
                    "Failed to save updated cart id to customer metafield",
                    e.message || e,
                  );
                }

                try {
                  await syncCartToMongo(finalCustomerId, updatedCart);
                } catch (e) {
                  console.warn("Failed to sync cart to Mongo", e.message || e);
                }

                mergeResult = { merged: true, mergedCartId: updatedCart.id };
              }
            }
          }
        } catch (err) {
          console.error("Cart merge on login failed:", err);
        }
      } catch (err) {
        console.error("Cart merge setup failed:", err);
      }
    }

    // Determine final cart id for response (if any)
    let returnedCartId = null;
    try {
      const { getCustomerCartId } = require("@/lib/shopify");
      returnedCartId = await getCustomerCartId(finalCustomerId);
    } catch (e) {
      // ignore
    }

    // If frontend sent a guestCartId, fetch its contents so UI can show current cart
    let guestCart = null;
    if (guestCartId) {
      try {
        const { getCartById } = require("@/lib/shopify");
        guestCart = await getCartById(guestCartId);
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        phone: fullPhone,
        storeEntry: {
          shopifyCustomerId: finalCustomerId,
        },
        cartId: returnedCartId,
        guestCart,
        merge: mergeResult,
      },
      message: existingCustomerId ? "Welcome back!" : "New account created",
    });
  }

  return NextResponse.json(megascaleData);
}
