import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, ArrowRight, Users } from 'lucide-react';
import { GAMES, KIND_LABEL, thumbFor } from '@/lib/games/catalog';
import { pixel } from '@/lib/fonts';

/**
 * The arcade, trailed on the home page.
 *
 * Deliberately the one dark band on an otherwise white page — the games are a
 * different thing from the writing and should look like it. Four cabinets,
 * newest first, and a way through to the rest.
 */
export default function ArcadeStrip() {
  const shown = GAMES.slice(0, 4);

  return (
    <section className={`${pixel.variable} arcade-hall relative overflow-hidden border-y border-black/40`}>
      <div className="arcade-carpet pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(255,203,5,0.16),transparent_70%)]" />

      <div className="container-page relative py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-pixel text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <Gamepad2 size={12} className="mr-2 inline" />
              Free to play
            </p>
            <h2 className="font-pixel marquee-glow mt-4 text-[20px] leading-[1.45] text-maize sm:text-[26px]">
              ARCADE
            </h2>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-slate-400">
              {GAMES.length} games built here from nothing — pixel-art sports, two coaching
              careers and a daily puzzle. No download.
            </p>
          </div>

          <Link
            href="/games"
            className="group inline-flex items-center gap-2 rounded-lg border border-maize/40 bg-maize/10 px-4 py-3
                       font-pixel text-[10px] uppercase text-maize transition hover:bg-maize hover:text-navy"
          >
            All {GAMES.length} games
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="cabinet group relative flex flex-col overflow-hidden rounded-xl border border-white/10
                         bg-[#070d19] shadow-[0_22px_50px_-32px_rgba(0,0,0,0.95)]
                         hover:border-maize/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maize"
            >
              <div className="relative bg-black p-2">
                <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
                  <Image
                    src={thumbFor(g.slug)}
                    alt={`${g.name} artwork`}
                    fill
                    className={`${g.smoothArt ? '' : 'pixelated '}object-contain`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="crt-lines pointer-events-none absolute inset-0 opacity-55 mix-blend-multiply" />
                  <div className="crt-glass pointer-events-none absolute inset-0" />
                  <div className="screen-wash pointer-events-none absolute inset-0 bg-[#060b16]/45" />
                </div>
              </div>

              <div className="flex flex-1 flex-col px-3.5 pb-4 pt-2">
                <h3 className="font-pixel text-[10px] leading-snug text-maize">{g.name}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">{g.tagline}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="rounded border border-maize/30 bg-maize/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-maize">
                    {KIND_LABEL[g.kind]}
                  </span>
                  {g.twoPlayer && (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                      <Users size={9} /> 2P
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
