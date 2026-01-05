// components/YouMayAlsoLikeServer.jsx
import { getAllProducts } from "@/lib/shopify";
import YouMayAlsoLikeSlider from "./YouMayAlsoLike";

export default async function YouMayAlsoLikeServer() {
  const products = await getAllProducts(8);

  if (!products?.length) return null;

  return <YouMayAlsoLikeSlider products={products} />;
}
