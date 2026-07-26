import { initials } from '@/lib/utils';

export default function Avatar({
  name,
  url,
  size = 36,
  ring = false,
}: { name: string; url?: string | null; size?: number; ring?: boolean }) {
  const cls = ring ? 'ring-2 ring-maize ring-offset-2 ring-offset-white' : '';
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
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
    >
      {initials(name) || 'M'}
    </div>
  );
}
