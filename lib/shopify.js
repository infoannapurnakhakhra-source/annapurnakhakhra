// lib/shopify.js → FINAL WORKING VERSION (December 2025)

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/2025-10/graphql.json`;
const ADMIN_ENDPOINT = `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/2025-10/graphql.json`;

// Storefront request (public) — unchanged & perfect
async function request(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "Storefront error");
  return json.data;
}

// Admin request — already fixed & perfect
async function adminRequest(query, variables = {}) {
  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error("Shopify Admin GraphQL errors:", json.errors);
    throw new Error(json.errors[0].message || "Admin API error");
  }

  const userErrors =
    json.data?.customerCreate?.userErrors ||
    json.data?.metafieldsSet?.userErrors ||
    json.data?.customerUpdate?.userErrors ||
    [];

  if (userErrors.length > 0) {
    console.error("Shopify userErrors:", userErrors);
    throw new Error(userErrors[0].message);
  }

  return json.data;
}

// ===========================
// CUSTOMER REGISTRATION — unchanged & working
// ===========================
export async function register({ firstName, lastName, email, password }) {
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      acceptsMarketing: false
    },
  };

  const data = await request(mutation, variables);

  if (data.customerCreate.customerUserErrors?.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }

  return data.customerCreate.customer;
}

// ===========================
// PRODUCTS — unchanged & working
// ===========================


export async function getAllProducts(first = 50) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            vendor
            description
            featuredImage { url altText }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  compareAtPrice: compareAtPriceV2 { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query, { first });

  return data.products.edges.map(edge => ({
    ...edge.node,
    variantId: edge.node.variants.edges[0]?.node.id || null,
    price: edge.node.variants.edges[0]?.node.price || null,
    compareAtPrice: edge.node.variants.edges[0]?.node.compareAtPrice || null,
  }));
}

export async function getProductByHandle(handle) {
  const query = `
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        descriptionHtml
        productType
        featuredImage {
          url
          altText
        }
        images(first: 20) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              compareAtPrice: compareAtPriceV2 {
                amount
                currencyCode
              }
            }
          }
        }
        ingredients: metafield(namespace: "custom", key: "ingredients") {
          value
        }
        self_life: metafield(namespace: "custom", key: "self_life") {
          value
        }
        allergy_advice: metafield(namespace: "custom", key: "allergy_advice") {
          value
        }
      }
    }
  `;

  try {
    const data = await request(query, { handle });
    if (!data?.product) return null;

    // ✅ Normalize variants with proper structure
    const variants = data.product.variants?.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      price: {
        amount: node.price.amount,
        currencyCode: node.price.currencyCode,
      },
      compareAtPrice: node.compareAtPrice
        ? {
          amount: node.compareAtPrice.amount,
          currencyCode: node.compareAtPrice.currencyCode,
        }
        : null,
    })) || [];

    const product = {
      id: data.product.id,
      title: data.product.title,
      handle: data.product.handle,
      descriptionHtml: data.product.descriptionHtml,
      productType: data.product.productType,
      featuredImage: data.product.featuredImage,
      images: data.product.images?.edges.map(e => e.node) || [],
      variants, // ✅ Array of variants with full price structure
      metafields: [
        {
          namespace: "custom",
          key: "Ingredients",
          value: data.product.ingredients?.value || ""
        },
        {
          namespace: "custom",
          key: "Self Life",
          value: data.product.self_life?.value || ""
        },
        {
          namespace: "custom",
          key: "Allergy Advice",
          value: data.product.allergy_advice?.value || ""
        },
      ],
    };

    return product;
  } catch (error) {
    console.error(`Failed to load product: ${handle}`, error.message);
    return null;
  }
}

let guestCartId = typeof window !== "undefined" ? localStorage.getItem("guestCartId") : null;

export async function getCartById(cartId) {
  try {
    const data = await request(`
      query getCart($id: ID!) {
        cart(id: $id) {
          id
          checkoutUrl
          totalQuantity
          lines(first: 50) {
            edges {
              node {
              id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product { title featuredImage { url } }
                  }
                }
              }
            }
          }
        }
      }`, { id: cartId });
    return data.cart;
  } catch (err) {
    localStorage?.removeItem("guestCartId");
    guestCartId = null;
    return null;
  }
}

export async function createCart() {
  const data = await request(`mutation { cartCreate { cart { id } } }`);
  const cartId = data.cartCreate.cart.id;
  if (typeof window !== "undefined") {
    localStorage.setItem("guestCartId", cartId);
    guestCartId = cartId;
  }
  return data.cartCreate.cart;
}

export async function addToCartServer(variantId, quantity = 1, cartId = null) {
  const isBrowser = typeof window !== "undefined";
  const customerId = isBrowser ? localStorage.getItem("customerShopifyId") : null;

  let effectiveCartId = cartId;

  // Your existing logic to find/create cartId (keep it – it's good)
  if (!effectiveCartId) {
    if (customerId) {
      effectiveCartId = await getCustomerCartId(customerId);
      if (!effectiveCartId) {
        const newCart = await createCart();
        await saveCustomerCartId(customerId, newCart.id);
        effectiveCartId = newCart.id;
      }
    } else {
      // Guest
      const guestCartId = isBrowser ? localStorage.getItem("guestCartId") : null;
      if (guestCartId) {
        const guestCart = await getCartById(guestCartId);
        effectiveCartId = guestCart?.id || null;
      }
      if (!effectiveCartId) {
        const newCart = await createCart();
        effectiveCartId = newCart.id;
        if (isBrowser) {
          localStorage.setItem("guestCartId", effectiveCartId);
        }
      }
    }
  }

  // 🔥 CRITICAL FIX: Convert to full Global ID
  const merchandiseId =
    typeof variantId === "string" && variantId.startsWith("gid://")
      ? variantId
      : `gid://shopify/ProductVariant/${variantId}`;

  let fullCart;

  if (effectiveCartId) {
    // Existing cart → use cartLinesAdd
    const data = await request(
      `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      product { title featuredImage { url } }
                    }
                  }
                }
              }
            }
          }
          userErrors { field message }
        }
      }
      `,
      {
        cartId: effectiveCartId,
        lines: [{ merchandiseId, quantity }],
      }
    );

    if (data.cartLinesAdd?.userErrors?.length > 0) {
      throw new Error(data.cartLinesAdd.userErrors[0].message);
    }

    fullCart = data.cartLinesAdd.cart;
  } else {
    // No cart yet → create one with the first item (cartLinesAdd fails if cartId null)
    const data = await request(
      `
      mutation cartCreate($lines: [CartLineInput!]) {
        cartCreate(lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      product { title featuredImage { url } }
                    }
                  }
                }
              }
            }
          }
          userErrors { field message }
        }
      }
      `,
      { lines: [{ merchandiseId, quantity }] }
    );

    if (data.cartCreate?.userErrors?.length > 0) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    fullCart = data.cartCreate.cart;

    // Save the new cartId for guest
    if (!customerId && isBrowser) {
      localStorage.setItem("guestCartId", fullCart.id);
    }
  }

  return fullCart;
}

export async function getCustomerCartId(shopifyCustomerId) {
  const data = await adminRequest(`
    query ($id: ID!) {
      customer(id: $id) {
        metafield(namespace: "anapurna", key: "cart_id") { value }
      }
    }`, { id: `gid://shopify/Customer/${shopifyCustomerId}` });
  return data.customer?.metafield?.value || null;
}

export async function saveCustomerCartId(shopifyCustomerId, cartId) {
  await adminRequest(`
    mutation ($input: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $input) {
        metafield { value }
        userErrors { message }
      }
    }`, {
    input: [{
      ownerId: `gid://shopify/Customer/${shopifyCustomerId}`,
      namespace: "anapurna",
      key: "cart_id",
      type: "single_line_text_field",
      value: cartId
    }]
  });
}

export async function getCart() {
  const isBrowser = typeof window !== "undefined";
  const customerId = isBrowser ? localStorage.getItem("customerShopifyId") : null;

 
  if (customerId) {
    let cartId = await getCustomerCartId(customerId); 

    
    if (!cartId && isBrowser) {
      const savedGuestCartId = localStorage.getItem("guestCartId");
      if (savedGuestCartId) {
        const guestCart = await getCartById(savedGuestCartId);
        if (guestCart?.lines?.edges?.length > 0) {
          
          await saveCustomerCartId(customerId, guestCart.id);
          cartId = guestCart.id;
          localStorage.removeItem("guestCartId"); 
        }
      }
    }

  
    if (!cartId) {
      const newCart = await createCart();
      await saveCustomerCartId(customerId, newCart.id);
      cartId = newCart.id;
    }

    
    const cart = await getCartById(cartId);
    return { ...cart, source: "customer" };
  }

 
  if (isBrowser) {
    const savedGuestCartId = localStorage.getItem("guestCartId");
    if (savedGuestCartId) {
      const cart = await getCartById(savedGuestCartId);
      if (cart) return { ...cart, source: "guest" };
    }
  }

 
  const freshCart = await createCart();
  if (isBrowser) {
    localStorage.setItem("guestCartId", freshCart.id);
  }
  return { ...freshCart, source: "guest" };
}
export async function updateCartLine(cartId, lineId, quantity) {
  if (!cartId || !lineId) throw new Error("cartId & lineId are required");

  const data = await request(
    `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 50) {
            edges {
              node {
              id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product { title featuredImage { url } }
                  }
                }
              }
            }
          }
        }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] }
  );

  return data.cartLinesUpdate.cart;
}

// @/lib/shopify.js (or wherever you keep it)
// lib/shopify.js
export async function removeCartLine(cartId, lineId) {
  const data = await request(
    `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product { title featuredImage { url } }
                  }
                }
              }
            }
          }
          estimatedCost { totalAmount { amount currencyCode } }
        }
        userErrors { field message }
      }
    }`,
    { cartId, lineIds: [lineId] }
  );

  const errors = data.cartLinesRemove.userErrors;
  if (errors?.length) throw new Error(errors[0].message);
  return data.cartLinesRemove.cart;
}