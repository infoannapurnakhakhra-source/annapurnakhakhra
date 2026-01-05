const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // for customer metafields
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/2025-10/graphql.json`;
const ADMIN_ENDPOINT = `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/2025-10/graphql.json`;

// Generic Shopify Storefront API request
async function shopifyRequest(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// Generic Shopify Admin API request (for customer metafields)
async function shopifyAdminRequest(query, variables = {}) {
  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

/** --------------------------
 * GUEST CART (localStorage)
 * -------------------------- */

// Create new guest cart
export async function createGuestCart() {
  const mutation = `
    mutation {
      cartCreate {
        cart {
          id
          checkoutUrl
          totalQuantity
        }
      }
    }
  `;
  const data = await shopifyRequest(mutation);
  const cart = data.cartCreate.cart;
  if (typeof window !== "undefined") localStorage.setItem("cartId", cart.id);
  return cart;
}

// Get guest cart
export async function getGuestCart(cartId) {
  const query = `
    query ($cartId: ID!) {
      cart(id: $cartId) {
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
                  price { amount }
                  product {
                    id
                    title
                    featuredImage { url }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyRequest(query, { cartId });
  return data.cart;
}

// Add item to guest cart
export async function addToGuestCart(cartId, variantId, quantity = 1) {
  const mutation = `
    mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl totalQuantity lines(first:50){edges{node{id quantity merchandise{... on ProductVariant{id title price{amount} product{id title featuredImage{url}}}}}}} }
      }
    }
  `;
  const variables = { cartId, lines: [{ quantity, merchandiseId: variantId }] };
  const data = await shopifyRequest(mutation, variables);
  return data.cartLinesAdd.cart;
}

// Fetch customer cart metafield
export async function getCustomerCart(customerId) {
  const query = `
    query GetCustomerCart($customerId: ID!) {
      customer(id: $customerId) {
        metafield(namespace: "cart", key: "cart_items") {
          id
          value
        }
      }
    }
  `;
  const data = await shopifyAdminRequest(query, { customerId: `gid://shopify/Customer/${customerId}` });
  const metafield = data.customer.metafield;
  if (!metafield || !metafield.value) return [];
  return JSON.parse(metafield.value);
}

// Update customer cart metafield
export async function updateCustomerCart(customerId, cartItems) {
  const mutation = `
    mutation UpdateCustomerCart($customerId: ID!, $cartValue: String!) {
      metafieldsSet(
        metafields:[
          { ownerId:$customerId namespace:"cart" key:"cart_items" type:"json_string" value:$cartValue }
        ]
      ) {
        metafields { id value }
        userErrors { field message }
      }
    }
  `;
  const variables = { customerId: `gid://shopify/Customer/${customerId}`, cartValue: JSON.stringify(cartItems) };
  const data = await shopifyAdminRequest(mutation, variables);
  if (data.metafieldsSet.userErrors.length > 0) {
    throw new Error(data.metafieldsSet.userErrors.map(e => e.message).join(", "));
  }
  return data.metafieldsSet.metafields[0];
}

// Add item to customer cart
export async function addToCustomerCart(customerId, item) {
  const cartItems = await getCustomerCart(customerId);
  cartItems.push(item);
  return await updateCustomerCart(customerId, cartItems);
}
