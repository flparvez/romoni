import { ICategory, IProduct } from "@/types";
import { MetadataRoute } from "next";

const baseUrl = "https://a1romoni.xyz";

// ✅ Helper function: safely fetch data
async function fetchData(url: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 60  }, // Revalidate daily
    });
    if (!res.ok) {
      console.error(`Sitemap fetch error: Failed to fetch ${url} (${res.status})`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Sitemap fetch error: Error fetching ${url}`, error);
    return null;
  }
}

// ✅ Helper: XML Escape
function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ✅ Helper: Safe URL constructor
function constructUrl(path: string): string {
  const safePath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment)) // encode each segment
    .join("/");

  return xmlEscape(new URL(safePath, baseUrl).toString());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch data in parallel
  const [productData, categoryData] = await Promise.all([
    fetchData(`${baseUrl}/api/products`),
    fetchData(`${baseUrl}/api/categories`),
  ]);

  const products = productData?.products ?? [];
  const categories = categoryData?.categories ?? [];

  // Products URLs
  const productUrls = products.map((product: IProduct) => ({
    url: constructUrl(`/product/${product.slug}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category URLs
  const categoryUrls = categories.map((category: ICategory) => ({
    url: constructUrl(`/category/${category.slug}`),
    lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Static Pages
  const staticPages = [
    {
      url: constructUrl(`/products`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: constructUrl(`/about-us`),
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: constructUrl(`/contact`),
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ];

  // Combine all URLs
  return [
    {
      url: xmlEscape(baseUrl),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...staticPages,
    ...categoryUrls,
    ...productUrls,
  ];
}
