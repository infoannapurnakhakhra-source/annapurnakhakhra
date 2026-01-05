

// app/collection/page.jsx
import ProductsViewClient from "./products-view-client";
import { getAllProducts } from "@/lib/shopify";

export default async function CollectionsPage({ searchParams }) {
  const searchQuery = searchParams.search || "";
  const products = await getAllProducts();

  return (
    <ProductsViewClient 
      products={products} 
      initialSearchQuery={searchQuery} 
    />
  );
}


