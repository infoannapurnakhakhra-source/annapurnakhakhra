import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = Number(searchParams.get("limit")) || 20;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Shopify GraphQL Search Query
    const graphqlQuery = `
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              vendor
              productType
              tags
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      query,
      first: limit,
    };

    const shopifyResponse = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: graphqlQuery, variables }),
        cache: "no-store", // disable caching for search
      }
    );

    const json = await shopifyResponse.json();

    if (json.errors) {
      console.error("Shopify Errors:", json.errors);
      return NextResponse.json(
        { errors: json.errors },
        { status: 500 }
      );
    }

    const products =
      json.data?.products?.edges?.map(edge => edge.node) || [];

    return NextResponse.json(products);
  } catch (error) {
    console.error("SEARCH PRODUCTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
