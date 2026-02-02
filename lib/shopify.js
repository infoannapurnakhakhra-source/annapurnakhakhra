// lib/shopify.js → FINAL WORKING VERSION (December 2025)

const SHOPIFY_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim().replace(
    /^https?:\/\//,
    "",
  );
const STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
const ADMIN_TOKEN = (
  process.env.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN
)?.trim();

const API_VERSION = "2024-10"; // Using stable 2024-10
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

// Clean up the base URL to avoid double slashes
const baseAdminUrl = process.env.SHOPIFY_ADMIN_API_BASE_URL?.trim().replace(
  /\/$/,
  "",
);
const ADMIN_ENDPOINT = `${baseAdminUrl}/${API_VERSION}/graphql.json`;

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
  if (json.errors)
    throw new Error(json.errors[0]?.message || "Storefront error");
  return json.data;
}

// Admin request — already fixed & perfect
async function adminRequest(query, variables = {}) {
  console.log("🔌 Admin API Request to:", ADMIN_ENDPOINT);
  console.log("   Query/Mutation:", query.substring(0, 100) + "...");
  console.log("   Variables:", JSON.stringify(variables, null, 2));

  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  console.log("🔌 Admin API Response:", JSON.stringify(json, null, 2));

  if (json.errors) {
    console.error("❌ Shopify Admin GraphQL errors:", json.errors);
    throw new Error(json.errors[0].message || "Admin API error");
  }

  // Check for user errors in various mutation responses
  const data = json.data;
  const userErrors = [
    ...(data?.customerCreate?.userErrors || []),
    ...(data?.metafieldsSet?.userErrors || []),
    ...(data?.customerUpdate?.userErrors || []),
    ...(data?.customerCreate?.customerUserErrors || []), // Added for Storefront mutations if called via here
  ];

  if (userErrors.length > 0) {
    console.error("❌ Shopify userErrors:", userErrors);
    throw new Error(userErrors[0].message);
  }

  return data;
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
      acceptsMarketing: false,
    },
  };

  const data = await request(mutation, variables);

  if (data.customerCreate.customerUserErrors?.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }

  return data.customerCreate.customer;
}

// ===========================
// CREATE CUSTOMER (without password) — for guest orders
// ===========================
export async function createCustomerFromOrder({
  firstName,
  lastName,
  email,
  phoneNumber,
}) {
  const mutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Format phone to strict E.164 (e.g. +919876543210)
  let formattedPhone = "";
  if (phoneNumber) {
    const clean = phoneNumber.toString().replace(/[^0-9]/g, "");
    if (clean.length === 10) {
      formattedPhone = `+91${clean}`;
    } else if (clean.length > 10) {
      formattedPhone = `+${clean}`;
    }
  }

  const variables = {
    input: {
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      ...(email?.trim() ? { email: email.toLowerCase().trim() } : {}),
      ...(formattedPhone ? { phone: formattedPhone } : {}),
    },
  };

  try {
    console.log(
      "📧 Creating customer with mutation:",
      JSON.stringify(variables, null, 2),
    );
    const data = await adminRequest(mutation, variables);
    console.log(
      "📧 Customer creation response:",
      JSON.stringify(data, null, 2),
    );

    if (data.customerCreate?.userErrors?.length > 0) {
      const errorMsg = data.customerCreate.userErrors[0].message;
      console.error("❌ Customer creation error:", errorMsg);
      throw new Error(errorMsg);
    }

    const customer = data.customerCreate?.customer;
    if (customer?.id) {
      console.log("✅ Customer created successfully:", customer.id);
      return customer;
    } else {
      console.error("❌ No customer returned from mutation");
      return null;
    }
  } catch (error) {
    // Handle cases where customer already exists with email or phone
    const errorMsg = error.message.toLowerCase();
    if (
      errorMsg.includes("already exists") ||
      errorMsg.includes("already been taken") ||
      errorMsg.includes("phone number already exists") ||
      errorMsg.includes("email already exists")
    ) {
      console.log("⚠️  Customer already exists:", error.message);
      // Attempt to find and return the existing customer
      if (email) {
        const existingByEmail = await getCustomerByEmail(email);
        if (existingByEmail) return existingByEmail;
      }
      if (phoneNumber) {
        const existingByPhone = await getCustomerByPhone(phoneNumber);
        if (existingByPhone) return existingByPhone;
      }
      return null;
    }
    console.error("❌ Error during customer creation:", error.message);
    throw error;
  }
}

// ===========================
// GET CUSTOMER BY EMAIL — helper to find existing customer
// ===========================
export async function getCustomerByEmail(email) {
  if (!email) return null;
  const query = `
    query customerSearch($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            firstName
            lastName
            phone
          }
        }
      }
    }
  `;

  const variables = {
    query: `email:"${email.trim()}"`,
  };

  try {
    console.log("🔍 Searching for customer with email:", email);
    const data = await adminRequest(query, variables);
    const customer = data.customers?.edges?.[0]?.node;
    if (customer) {
      console.log("✅ Found customer by email:", customer.id);
    } else {
      console.log("❌ No customer found with email:", email);
    }
    return customer || null;
  } catch (error) {
    console.error("❌ Error fetching customer by email:", error.message);
    return null;
  }
}

// ===========================
// GET CUSTOMER BY PHONE — helper to find existing customer
// ===========================
export async function getCustomerByPhone(phone) {
  if (!phone) return null;

  const clean = phone.toString().replace(/[^0-9]/g, "");
  if (!clean) return null;

  // Try multiple formats to be safe
  const searchQueries = [];
  if (clean.length === 10) {
    searchQueries.push(`phone:"+91${clean}"`);
    searchQueries.push(`phone:"91${clean}"`);
    searchQueries.push(`phone:"${clean}"`);
  } else {
    searchQueries.push(`phone:"+${clean}"`);
    searchQueries.push(`phone:"${clean}"`);
  }

  for (const q of searchQueries) {
    const query = `
      query customerSearch($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
              firstName
              lastName
              phone
            }
          }
        }
      }
    `;

    try {
      console.log(`🔍 Searching for customer with query: ${q}`);
      const data = await adminRequest(query, { query: q });
      const customer = data.customers?.edges?.[0]?.node;
      if (customer) {
        console.log("✅ Found customer by phone:", customer.id);
        return customer;
      }
    } catch (error) {
      console.warn(`⚠️ Search query failed (${q}):`, error.message);
    }
  }

  console.log("❌ No customer found with phone variations for:", phone);
  return null;
}

// ===========================
// PRODUCTS — unchanged & working
// ===========================

// export async function getAllProducts(first = 50) {
//   const query = `
//     query getProducts($first: Int!) {
//       products(first: $first) {
//         edges {
//           node {
//             id
//             title
//             handle
//             vendor
//             description
//             featuredImage { url altText }
//             variants(first: 1) {
//               edges {
//                 node {
//                   id
//                   title
//                   price { amount currencyCode }
//                   compareAtPrice: compareAtPriceV2 { amount currencyCode }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query, { first });

//   return data.products.edges.map(edge => ({
//     ...edge.node,
//     variantId: edge.node.variants.edges[0]?.node.id || null,
//     price: edge.node.variants.edges[0]?.node.price || null,
//     compareAtPrice: edge.node.variants.edges[0]?.node.compareAtPrice || null,
//   }));
// }

// export async function getAllProducts(first = 50) {
//   const query = `
//     query getProducts($first: Int!) {
//       products(first: $first) {
//         edges {
//           node {
//             id
//             title
//             handle
//             vendor
//             description
//             featuredImage {
//               url
//               altText
//             }
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   title
//                   availableForSale
//                   price {
//                     amount
//                     currencyCode
//                   }
//                   compareAtPrice: compareAtPriceV2 {
//                     amount
//                     currencyCode
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query, { first });

//   return data.products.edges.map(({ node }) => {
//     const variants = node.variants.edges.map(e => e.node);
//     const defaultVariant = variants[0] || null;

//     return {
//       id: node.id,
//       title: node.title,
//       handle: node.handle,
//       vendor: node.vendor,
//       description: node.description,
//       featuredImage: node.featuredImage,

//       // ✅ DEFAULT VARIANT
//       defaultVariant,

//       // 🔑 Convenience fields (for cards, sliders, add-to-cart)
//       variantId: defaultVariant?.id || null,
//       price: defaultVariant?.price || null,
//       compareAtPrice: defaultVariant?.compareAtPrice || null,
//       availableForSale: defaultVariant?.availableForSale || false,

//       // Optional: expose all variants if needed later
//       variants,
//     };
//   });
// }

// ✅ COMPLETE SHOPIFY QUERY WITH ALL FILTER FIELDS

export async function getAllProducts(first = 250) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            vendor
            productType
            tags
            description
            featuredImage {
              url
              altText
            }
            made_with: metafield(namespace: "custom", key: "made_with") {
              value
            }
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 150) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice: compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query, { first });

  return data.products.edges.map(({ node }) => {
    const variants = node.variants.edges.map((e) => e.node);
    const defaultVariant = variants[0] || null;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      vendor: node.vendor,
      productType: node.productType, // ✅ ADDED FOR FILTER
      tags: node.tags, // ✅ ADDED FOR FILTER
      description: node.description,
      featuredImage: node.featuredImage,
      madeWith: node.made_with?.value || null, // ✅ ADDED FOR FILTER

      // ✅ COLLECTIONS FOR FILTER
      collections: node.collections,

      // ✅ PRICE RANGE FOR FILTER
      priceRange: node.priceRange,

      // ✅ DEFAULT VARIANT
      defaultVariant,

      // 🔑 Convenience fields (for cards, sliders, add-to-cart)
      variantId: defaultVariant?.id || null,
      price: defaultVariant?.price || null,
      compareAtPrice: defaultVariant?.compareAtPrice || null,
      availableForSale: defaultVariant?.availableForSale || false,

      // ✅ ALL VARIANTS WITH SELECTED OPTIONS FOR FILTER
      variants: node.variants,
    };
  });
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
        tags
        featuredImage {
          url
          altText
        }
        images(first: 250) {
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
              availableForSale
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
    const variants =
      data.product.variants?.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        availableForSale: node.availableForSale,
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
      tags: data.product.tags, // ✅ ADDED: Tags from query
      featuredImage: data.product.featuredImage,
      images: data.product.images?.edges.map((e) => e.node) || [],
      variants, // ✅ Array of variants with full price structure
      metafields: [
        {
          namespace: "custom",
          key: "Ingredients",
          value: data.product.ingredients?.value || "",
        },
        {
          namespace: "custom",
          key: "Self Life",
          value: data.product.self_life?.value || "",
        },
        {
          namespace: "custom",
          key: "Allergy Advice",
          value: data.product.allergy_advice?.value || "",
        },
      ],
    };

    return product;
  } catch (error) {
    console.error(`Failed to load product: ${handle}`, error.message);
    return null;
  }
}

let guestCartId =
  typeof window !== "undefined" ? localStorage.getItem("guestCartId") : null;

export async function getCartById(cartId) {
  try {
    const data = await request(
      `
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
      }`,
      { id: cartId },
    );
    return data.cart;
  } catch (err) {
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
  const customerId = isBrowser
    ? localStorage.getItem("customerShopifyId")
    : null;

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
      const guestCartId = isBrowser
        ? localStorage.getItem("guestCartId")
        : null;
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
      },
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
      { lines: [{ merchandiseId, quantity }] },
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
  const data = await adminRequest(
    `
    query ($id: ID!) {
      customer(id: $id) {
        metafield(namespace: "anapurna", key: "cart_id") { value }
      }
    }`,
    { id: `gid://shopify/Customer/${shopifyCustomerId}` },
  );
  return data.customer?.metafield?.value || null;
}

export async function saveCustomerCartId(shopifyCustomerId, cartId) {
  await adminRequest(
    `
    mutation ($input: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $input) {
        metafield { value }
        userErrors { message }
      }
    }`,
    {
      input: [
        {
          ownerId: `gid://shopify/Customer/${shopifyCustomerId}`,
          namespace: "anapurna",
          key: "cart_id",
          type: "single_line_text_field",
          value: cartId,
        },
      ],
    },
  );
}

export async function getCart() {
  const isBrowser = typeof window !== "undefined";
  const customerId = isBrowser
    ? localStorage.getItem("customerShopifyId")
    : null;

  if (customerId) {
    let cartId = await getCustomerCartId(customerId);

    if (!cartId && isBrowser) {
      const savedGuestCartId = localStorage.getItem("guestCartId");
      if (savedGuestCartId) {
        const guestCart = await getCartById(savedGuestCartId);
        if (guestCart?.lines?.edges?.length > 0) {
          await saveCustomerCartId(customerId, guestCart.id);
          cartId = guestCart.id;
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
    { cartId, lines: [{ id: lineId, quantity }] },
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
    { cartId, lineIds: [lineId] },
  );

  const errors = data.cartLinesRemove.userErrors;
  if (errors?.length) throw new Error(errors[0].message);
  return data.cartLinesRemove.cart;
}
export async function getAllProductSlugs(first = 250) {
  const query = `
    query getProductHandles($first: Int!) {
      products(first: $first) {
        edges {
          node {
            handle
          }
        }
      }
    }
  `;

  const data = await request(query, { first });

  return data.products.edges.map((edge) => edge.node.handle);
}

// ===========================
// BLOGS — NEW FUNCTION
// ===========================
// lib/shopify.js
// lib/shopify.js
export async function getBlogs() {
  const query = `
    query getBlogs {
      blogs(first: 50) {
        edges {
          node {
            id
            handle
            title
            articles(first: 250) {
              edges {
                node {
                  id
                  title
                  handle
                  excerptHtml
                  contentHtml
                  publishedAt
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query);

  return data.blogs.edges.map((edge) => ({
    id: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    articles: edge.node.articles.edges.map((a) => ({
      id: a.node.id,
      title: a.node.title,
      handle: a.node.handle,
      excerpt: a.node.excerptHtml,
      contentHtml: a.node.contentHtml,
      publishedAt: a.node.publishedAt,
      image: a.node.image,
    })),
  }));
}

export async function getBlogByHandle(blogHandle, articlesFirst = 250) {
  const query = `
    query getBlogByHandle($handle: String!, $articlesFirst: Int!) {
      blog(handle: $handle) {
        id
        handle
        title
        articles(first: $articlesFirst) {
          edges {
            node {
              id
              title
              handle
              excerptHtml
              contentHtml
              publishedAt
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query, {
    handle: blogHandle,
    articlesFirst,
  });

  if (!data?.blog) return null;

  return {
    ...data.blog,
    articles: data.blog.articles.edges.map((edge) => ({
      ...edge.node,
      excerpt: edge.node.excerptHtml, // normalize
    })),
  };
}

export async function getAllCollections() {
  const query = `
    {
      collections(first: 50) {
        edges {
          node {
            id
            title
            description
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  const data = await request(query);
  return data.collections.edges.map((e) => e.node);
}

export async function getProductsByCollectionHandle(handle) {
  if (!handle || typeof handle !== "string") return null;

  const query = `
    query getCollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        title
        handle
        description

        products(first: 100) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              tags

              made_with: metafield(namespace: "custom", key: "made_with") {
                value
              }

              collections(first: 5) {
                edges {
                  node {
                    handle
                    title
                  }
                }
              }

              featuredImage {
                url
                altText
              }

              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query, { handle });

  if (!data?.collection) return null;

  return {
    id: data.collection.id,
    title: data.collection.title,
    handle: data.collection.handle,
    description: data.collection.description,
    products: data.collection.products.edges.map(({ node }) => {
      // Map variants
      const variants = node.variants.edges.map((e) => e.node);
      const defaultVariant = variants[0] || null;

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        vendor: node.vendor,
        productType: node.productType,
        tags: node.tags,
        description: node.description,
        featuredImage: node.featuredImage,
        collections: node.collections,
        madeWith: node.made_with?.value || null, // ✅ ADDED FOR FILTER

        // Default variant info for ProductCard
        defaultVariant,
        variantId: defaultVariant?.id || null,
        price: defaultVariant?.price || null,
        compareAtPrice: defaultVariant?.compareAtPrice || null,
        availableForSale: defaultVariant?.availableForSale ?? false,

        // Keep full variants structure for filters/details
        variants: node.variants,
      };
    }),
  };
}

// lib/shopifyAdmin.js

const ADMIN_ENDPOINT1 = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;

export async function completeDraftOrder(draftOrderId) {
  if (!draftOrderId) {
    throw new Error("DraftOrderId is required");
  }

  const res = await fetch(ADMIN_ENDPOINT1, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      query: `
        mutation CompleteDraftOrder($id: ID!) {
          draftOrderComplete(id: $id, paymentPending: true) {
            draftOrder {
              id
              order {
                id
                name
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        id: `gid://shopify/DraftOrder/${draftOrderId}`,
      },
    }),
  });

  const json = await res.json();

  console.log("🟢 Draft complete response:", JSON.stringify(json, null, 2));

  // 🔴 Shopify GraphQL errors
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  // 🔴 User errors
  const userErrors = json.data?.draftOrderComplete?.userErrors;
  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join(", "));
  }

  const order = json.data?.draftOrderComplete?.draftOrder?.order;

  if (!order?.id) {
    throw new Error("Order not created by Shopify");
  }

  return order;
}

export async function markShopifyOrderPaid(orderGid) {
  // orderGid should look like: "gid://shopify/Order/1234567890"
  // Make sure you're passing the actual Order GID, not a DraftOrder GID.

  const res = await fetch(process.env.ADMIN_ENDPOINT1 ?? ADMIN_ENDPOINT1, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      query: `
        mutation markPaid($input: OrderMarkAsPaidInput!) {
          orderMarkAsPaid(input: $input) {
            order {
              id
              displayFinancialStatus
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          id: orderGid,
        },
      },
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("ORDER MARK PAID ERROR: Failed to parse JSON", e);
    throw new Error(
      "Failed to mark Shopify order as paid (invalid JSON response)",
    );
  }

  // Handle network / HTTP errors
  if (!res.ok) {
    console.error("ORDER MARK PAID HTTP ERROR:", {
      status: res.status,
      statusText: res.statusText,
      body: data,
    });
    throw new Error(
      `Failed to mark Shopify order as paid (HTTP ${res.status} ${res.statusText})`,
    );
  }

  // Handle GraphQL-level errors or business logic userErrors
  const gqlErrors = data.errors;
  const mutationErrors = data.data?.orderMarkAsPaid?.userErrors || [];

  if (gqlErrors?.length || mutationErrors.length) {
    console.error("ORDER MARK PAID ERROR:", JSON.stringify(data, null, 2));

    const userErrorMessages = mutationErrors.map((e) => e.message).join(", ");
    const gqlErrorMessages = gqlErrors
      ? gqlErrors.map((e) => e.message).join(", ")
      : "";

    const combinedMessage =
      userErrorMessages || gqlErrorMessages || "Unknown error";

    throw new Error(`Failed to mark Shopify order as paid: ${combinedMessage}`);
  }

  // At this point, the mutation succeeded
  return data.data.orderMarkAsPaid.order;
}

// ===========================
// SEARCH PRODUCTS
// ===========================
// ===========================
// SEARCH (Products + Collections)
// ===========================
export async function searchProducts(query, first = 5) {
  const gql = `
    query searchGlobal($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      collections(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  try {
    const data = await request(gql, { query, first });

    const products = data.products.edges.map(({ node }) => ({
      type: 'product',
      id: node.id,
      title: node.title,
      handle: node.handle,
      image: node.featuredImage,
      price: node.priceRange.minVariantPrice,
      compareAtPrice: node.variants?.edges[0]?.node?.compareAtPrice,
    }));

    const collections = data.collections.edges.map(({ node }) => ({
      type: 'collection',
      id: node.id,
      title: node.title,
      handle: node.handle,
      image: node.image,
    }));

    return { products, collections };
  } catch (error) {
    console.error("Error searching products/collections:", error);
    return { products: [], collections: [] };
  }
}
