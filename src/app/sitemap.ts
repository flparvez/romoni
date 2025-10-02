// app/sitemap.ts
import { MetadataRoute } from "next";

const baseUrl = "https://a1romoni.vercel.app/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ✅ Fetch categories
  const categoryRes = await fetch(`${baseUrl}/api/categories`, {
    next: { revalidate: 60 * 60 * 24 }, // cache 1 day
  }).then((res) => res.json());

  // ✅ Fetch products
  const productRes = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate: 60  }, // cache 6 hours
  }).then((res) => res.json());

  
  const categories = Array.isArray(categoryRes.categories) ? categoryRes.categories : [];
  const products = Array.isArray(productRes.products) ? productRes.products : [];

  return [
    // ✅ Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },

    // ✅ Static Pages
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },


    // ✅ Categories
    ...categories.map((cat: any) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      priority: 0.8,
    })),

    // ✅ Products
    ...products?.map((prod: any) => ({
      url: `${baseUrl}/product/${prod.slug}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
