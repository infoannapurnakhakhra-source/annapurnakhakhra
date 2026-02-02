import UserCart from "./models/UserCart";

export async function syncCartToMongo(customerId, shopifyCart) {
  if (!customerId || !shopifyCart) return;

  await UserCart.findOneAndUpdate(
    { customerId },
    {
      cartId: shopifyCart.id,
      checkoutUrl: shopifyCart.checkoutUrl,
      totalQuantity: shopifyCart.totalQuantity,
      items: shopifyCart.lines.edges.map(edge => ({
        variantId: edge.node.merchandise.id,
        quantity: edge.node.quantity,
        title: edge.node.merchandise.title,
        price: Number(edge.node.merchandise.price.amount),
        productTitle: edge.node.merchandise.product.title,
        image: edge.node.merchandise.product.featuredImage?.url || null,
      })),
    },
    { upsert: true, new: true }
  );
}
