'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ADSENSE_CLIENT, AD_SLOTS, adsAllowedOn, type AdSlotName } from '@/lib/ads';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot: AdSlotName;
  /**
   * Height held open before the ad arrives, in pixels. Reserving the space
   * is the whole reason this is a prop: without it the ad lands late, shoves
   * the article down, and the reader loses their place — which is both the
   * single most irritating thing an ad can do and a direct hit to Core Web
   * Vitals through cumulative layout shift.
   */
  minHeight?: number;
  /** "auto" fluid unit by default; "horizontal" for in-article banners */
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  /** the small grey word above the unit, which AdSense policy requires */
  label?: string;
};

export default function AdUnit({
  slot,
  minHeight = 280,
  format = 'auto',
  className = '',
  label = 'Advertisement',
}: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLModElement>(null);
  // React runs effects twice in development. Pushing the same <ins> twice
  // makes AdSense throw "All ins elements in the DOM with class=adsbygoogle
  // already have ads in them", so the push is latched.
  const pushed = useRef(false);

  const slotId = AD_SLOTS[slot];
  const allowed = adsAllowedOn(pathname);
  // The loader script deliberately does not run outside production, so a real
  // <ins> here would sit as an empty grey box forever and read as a bug. In
  // development the slot announces itself instead, which is the useful thing:
  // you can see where ads land while laying a page out.
  const isDev = process.env.NODE_ENV !== 'production';
  const show = allowed && !!slotId;

  useEffect(() => {
    if (!show || isDev || pushed.current) return;
    // The element has to be in the document and have a width before the push,
    // or AdSense reports availableWidth=0 and collapses the unit.
    if (!ref.current || ref.current.offsetWidth === 0) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* a blocked or failed ad is not a reason to break the page */
    }
  }, [show, isDev, pathname]);

  if (isDev) {
    if (!allowed) return null;
    return (
      <aside className={`my-8 ${className}`} aria-hidden="true">
        <div
          className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400"
          style={{ minHeight }}
        >
          Ad slot · {slot}
          {!slotId && ' · no slot id set'}
        </div>
      </aside>
    );
  }

  if (!show) return null;

  return (
    <aside
      className={`my-8 ${className}`}
      aria-label={label}
      // Not hidden from assistive tech, but kept out of the reading flow of
      // the article itself.
      role="complementary"
    >
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <div
        className="overflow-hidden rounded-xl border border-[var(--line)] bg-slate-50/60"
        style={{ minHeight }}
      >
        <ins
          ref={ref}
          className="adsbygoogle block"
          style={{ display: 'block', minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
          // Remounting on navigation gives each route its own fresh <ins>,
          // which is what AdSense expects from a client-routed site.
          key={`${pathname}-${slot}`}
        />
      </div>
    </aside>
  );
}
