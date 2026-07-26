export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

export function uniqueSlug(title: string) {
  const base = slugify(title) || 'post';
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function excerptFrom(html: string, len = 180) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > len ? `${text.slice(0, len).trimEnd()}…` : text;
}

export function timeAgo(iso: string | null) {
  if (!iso) return '';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const units: [number, string][] = [
    [60, 'minute'], [3600, 'hour'], [86400, 'day'],
    [604800, 'week'], [2592000, 'month'], [31536000, 'year'],
  ];
  let last = 1;
  for (const [size, name] of units) {
    if (secs < size) {
      const v = Math.floor(secs / last);
      return `${v} ${name === 'minute' && last === 1 ? 'second' : ''}`.trim();
    }
    last = size;
  }
  const y = Math.floor(secs / 31536000);
  return `${y} year${y > 1 ? 's' : ''} ago`;
}

export function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function relative(iso: string | null) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(iso);
}

export function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}
