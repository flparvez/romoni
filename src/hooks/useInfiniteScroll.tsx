// hooks/useInfiniteScroll.tsx
"use client";

import { useEffect } from "react";

export function useInfiniteScroll({
  sentinelRef,
  onIntersect,
  enabled = true,
}: {
  sentinelRef: React.RefObject<HTMLElement | null>;  // FIXED
  onIntersect: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onIntersect();
        });
      },
      { rootMargin: "200px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelRef, onIntersect, enabled]);
}
