// pages/api/getBlogs.js (or app/api/getBlogs/route.js for app router)
import { getBlogs } from "@/lib/shopify";

export default async function handler(req, res) {
  try {
    const blogs = await getBlogs();
    res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
}
