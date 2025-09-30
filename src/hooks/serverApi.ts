// lib/serverApi.ts

import { SITE_URL } from "@/types/product";

export async function serverApi<T = any>(
  endpoint: string,
  options?: RequestInit & {
    revalidate?: number; // ISR interval in seconds
    noCache?: boolean;   // Force fresh fetch
  }
): Promise<T> {
  const { revalidate, noCache, ...rest } = options || {};




  const res = await fetch(`${SITE_URL}${endpoint}`, {
    ...rest,
    cache: noCache ? "no-store" : "force-cache",
    next: revalidate ? { revalidate } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
