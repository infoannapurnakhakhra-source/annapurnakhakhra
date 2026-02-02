import { notFound } from "next/navigation";
import { getProductsByCollectionHandle } from "@/lib/shopify";
import ProductsViewClient from "@/components/ProductsViewClient";

export async function generateMetadata({ params }) {
  const { handle } = await params; 

  return {
    title: handle ? handle.replace(/-/g, " ") : "Collection",
  };
}

export default async function Page({ params, searchParams }) {
  const { handle } = await params; 
  const sp = await searchParams;   

  if (!handle) notFound();

  const data = await getProductsByCollectionHandle(handle);

  if (!data) notFound();

  return (
    <ProductsViewClient
      products={data.products}
      collectionTitle={data.title}
      initialSearchQuery={sp?.search || ""}
    />
  );
}
