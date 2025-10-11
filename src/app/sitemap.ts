import { MetadataRoute } from "next";

const baseUrl = "https://a1romoni.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ✅ Fetch categories safely
  const categoryRes = await fetch(`${baseUrl}/api/categories`, {
    next: { revalidate: 60 * 60 * 24 }, // cache 1 day
  }).then((res) => res.json()).catch(() => ({ categories: [] }));

  // ✅ Fetch products safely
  const productRes = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate: 60 * 60 * 6 }, // cache 6 hours
  }).then((res) => res.json()).catch(() => ({ products: [] }));

  const categories = Array.isArray(categoryRes.categories) ? categoryRes.categories : [];
  const products = Array.isArray(productRes.products) ? productRes.products : [];

  // ✅ Helper to ensure clean URLs
  const cleanUrl = (path: string) =>
    `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`.replace(/([^:]\/)\/+/g, "$1");

  return [
    // ✅ Homepage
    {
      url: cleanUrl("/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },

    // ✅ Products page
    {
      url: cleanUrl("/products"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },

    // ✅ Categories
    ...categories.map((cat: any) => ({
      url: cleanUrl(`/category/${encodeURIComponent(cat.slug)}`),
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),

    // ✅ Products
    ...products.map((prod: any) => ({
      url: cleanUrl(`/product/${encodeURIComponent(prod.slug)}`),
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
