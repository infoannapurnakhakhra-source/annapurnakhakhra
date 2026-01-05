import fs from "fs";
import path from "path";
import axios from "axios";

const BASE_URL = "https://annapurnakhakhra.megascale.co.in";
const PUBLIC_DIR = path.join(process.cwd(), "public");

const today = new Date().toISOString();

/* 🧱 STATIC PAGES */
const pages = [
  "/",
  "/about",
  "/collection",
  "/faq",
  "/contact",
  "/blog",
  "/privacy-policy",
  "/shipping-policy",
  "/return-policy",
  "/terms-and-condition"
];

/* 🛍 PRODUCTS */
async function getProducts() {
  const { data } = await axios.get(
    "https://annapurnakhakhra.megascale.co.in/api/product-slugs"
  );
  console.log("Fetched product slugs:", data);
  return data.slugs;
}

/* 📝 BLOGS */
function getBlogs() {
  return ["blog/1", "blog/2"];
}

/* 🧠 URLSET */
function createUrlset(urls, priority = "0.80") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`
  )
  .join("")}
</urlset>`;
}

/* 🧠 SITEMAP INDEX */
function createSitemapIndex() {
  const sitemaps = [
    "/sitemap_pages.xml",
    "/sitemap_products.xml",
    "/sitemap_blogs.xml"
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    sm => `
  <sitemap>
    <loc>${BASE_URL}${sm}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  )
  .join("")}
</sitemapindex>`;
}

async function generate() {
  // PAGES
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap_pages.xml"),
    createUrlset(pages.map(p => BASE_URL + p), "0.80")
  );

  // PRODUCTS
  const products = await getProducts();
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap_products.xml"),
    createUrlset(products.map(p => `${BASE_URL}/product/${p}`), "0.80")
  );

  // BLOGS
  const blogs = getBlogs();
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap_blogs.xml"),
    createUrlset(blogs.map(b => `${BASE_URL}/${b}`), "0.64")
  );

  // 🔥 PARENT SITEMAP
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap.xml"),
    createSitemapIndex()
  );

  console.log("✅ Shopify-style sitemap generated successfully");
}

generate();
