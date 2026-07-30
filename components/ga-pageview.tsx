'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function Tracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const qs = searchParams.toString();
    window.gtag('config', gaId, {
      page_path: qs ? `${pathname}?${qs}` : pathname,
    });
  }, [gaId, pathname, searchParams]);

  return null;
}

/**
 * Next.js moves between pages without a full reload, so gtag's automatic
 * page_view fires only on first load. This re-sends it on every route change.
 */
export default function GaPageView({ gaId }: { gaId: string }) {
  return (
    <Suspense fallback={null}>
      <Tracker gaId={gaId} />
    </Suspense>
  );
}
