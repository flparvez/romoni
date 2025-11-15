
import LandingPagesClient from "@/components/landing/LandingPagesClient";
import ProductListSkeleton from "@/components/Skelton";
import { SITE_URL } from "@/hooks/serverApi";
import { Suspense } from "react";


export default async function LandingPages() {
  const res = await fetch(`${SITE_URL}/api/landing`, { cache: "no-store" });
  const data = await res.json();

  return <Suspense fallback={<ProductListSkeleton />}>
    <LandingPagesClient pages={data.pages || []} />
  </Suspense>;
}
