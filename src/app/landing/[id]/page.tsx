import { SITE_URL } from "@/hooks/serverApi";
import { IdParams } from "@/types";
import { ILandingPageContent } from "@/models/Landing";
import CombinedLandingPage from "@/components/landing/CombinedLandingPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: IdParams) {
  const { id } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/landing/${id}`, {
      cache: "force-cache", // always fresh SEO metadata
    });

    if (!res.ok) {
      console.warn(`❌ Landing page not found for metadata (status ${res.status})`);
      return {};
    }

    const data = await res.json();
    const landing:ILandingPageContent = data?.landing;

    if (!landing) {
      console.warn("⚠️ Landing content missing in response");
      return {};
    }

    const seoTitle =
      landing?.seo?.title ||
      landing?.heroTitle ||
      landing?.heroSubtitle ||
      "Landing Page";

    const seoDescription =
      landing?.seo?.description ||
      landing?.heroSubtitle ||
      "Discover our latest offers and deals.";

    // Safely extract the first product image (if available)
    const firstProductImage =
      landing?.products?.[0]?.images?.[0]?.url || null;

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        images: firstProductImage
          ? [
              {
                url: firstProductImage,
                width: 1200,
                height: 630,
                alt: landing?.products?.[0]?.name || "Landing Image",
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: firstProductImage ? [firstProductImage] : [],
      },
    };
  } catch (error) {
    console.error("⚠️ Error fetching landing page metadata:", error);
    return {};
  }
}

export default async function LandingPage({ params }: IdParams) {
  const { id } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/landing/${id}`, {
      cache: "force-cache", // always fresh content
      next: { revalidate: 60 }, // revalidate every 60 seconds
    });

    if (!res.ok) {
      console.warn(`❌ Landing page not found (status ${res.status})`);
      return notFound();
    }

    const landing = await res.json();

    if (!landing?.landing) {
      console.warn("⚠️ Invalid landing page content structure");
      return notFound();
    }

    return (
      <CombinedLandingPage
        pageContent={landing.landing}
      />
    );
  } catch (error) {
    console.error("⚠️ Error fetching landing page:", error);
    return notFound();
  }
}
