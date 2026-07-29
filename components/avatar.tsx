import Image from 'next/image';
import { initials } from '@/lib/utils';

export default function Avatar({
  name,
  url,
  size = 36,
  ring = false,
}: { name: string; url?: string | null; size?: number; ring?: boolean }) {
  const cls = ring ? 'ring-2 ring-maize ring-offset-2 ring-offset-white' : '';

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        // No `sizes` here on purpose: for a fixed-size image it makes Next.js
        // build a srcset from every device width and fall back to the 3840px
        // version — an absurd download for a 28px avatar. Omitting it produces
        // a simple 1x/2x srcset at the real size instead.
        className={`shrink-0 rounded-full object-cover ${cls}`}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-maize ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials(name) || 'M'}
    </div>
  );
}
