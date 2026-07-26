export default function Logo({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
        <rect width="100" height="100" rx="22" fill="#00274D" />
        <path
          d="M20 74V26h13.5l16.5 26 16.5-26H80v48H66.5V49.5L50 74 33.5 49.5V74H20Z"
          fill="#FFCB05"
        />
      </svg>
      <span className="leading-none">
        <span
          className={`block font-display text-[17px] font-bold tracking-tight ${
            light ? 'text-white' : 'text-navy'
          }`}
        >
          The Victors&rsquo; Desk
        </span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-maize-600">
          Michigan Sports
        </span>
      </span>
    </span>
  );
}
