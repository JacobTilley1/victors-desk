import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({
  eyebrow,
  title,
  href,
  hrefLabel = 'View all',
}: { eyebrow?: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-maize-600">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[26px] font-bold leading-tight text-navy sm:text-[30px]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-500 transition hover:text-navy"
        >
          {hrefLabel}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
