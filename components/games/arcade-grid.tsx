'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Play } from 'lucide-react';
import { KIND_LABEL, thumbFor, type Game } from '@/lib/games/catalog';
import type { Best } from '@/lib/games/bests';

type Chip = { id: string; label: string; count: number };

export default function ArcadeGrid({
  games,
  chips,
  bests,
}: {
  games: Game[];
  chips: Chip[];
  bests: Record<string, Best>;
}) {
  const [active, setActive] = useState('all');

  const shown = useMemo(() => {
    if (active === 'all') return games;
    if (active === '2p') return games.filter((g) => g.twoPlayer);
    return games.filter((g) => g.kind === active);
  }, [active, games]);

  return (
    <>
      {/* ---- the row of filter chips ---- */}
      <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter games">
        {chips.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              aria-pressed={on}
              className={[
                'font-pixel text-[9px] uppercase transition-all duration-200',
                'rounded-md border px-3.5 py-2.5 leading-none',
                on
                  ? 'border-maize bg-maize text-navy shadow-[0_0_18px_-4px_rgba(255,203,5,0.8)]'
                  : 'border-white/15 bg-white/[0.04] text-slate-400 hover:border-maize/50 hover:text-maize',
              ].join(' ')}
            >
              {c.label}
              <span className={on ? 'ml-2 text-navy/55' : 'ml-2 text-slate-600'}>{c.count}</span>
            </button>
          );
        })}
      </div>

      {/* ---- the cabinets ---- */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((g) => (
          <Cabinet key={g.slug} game={g} best={bests[g.slug]} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="font-pixel py-16 text-center text-[10px] text-slate-500">No cabinets here yet.</p>
      )}
    </>
  );
}

function Cabinet({ game: g, best }: { game: Game; best?: Best }) {
  return (
    <Link
      href={`/games/${g.slug}`}
      className="cabinet group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070d19]
                 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.95)]
                 hover:border-maize/55 hover:shadow-[0_32px_70px_-28px_rgba(255,203,5,0.28)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maize"
    >
      {/* the marquee above the screen */}
      <div className="relative border-b border-black/60 bg-gradient-to-b from-[#16233c] to-[#0c1526] px-4 py-3">
        <div className="absolute inset-x-0 bottom-0 h-px bg-maize/30" />
        <h3 className="font-pixel text-[11px] leading-snug text-maize marquee-glow">{g.name}</h3>
        <p className="mt-1.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {g.tagline}
        </p>
      </div>

      {/* the screen. Fixed at 16:9 whatever shape the art is, so the cabinets
          line up and nothing has to be cropped to fit. */}
      <div className="relative bg-black p-2.5">
        <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
          <Image
            src={thumbFor(g.slug)}
            alt={`${g.name} artwork`}
            fill
            className={`${g.smoothArt ? '' : 'pixelated '}object-contain`}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="crt-lines pointer-events-none absolute inset-0 mix-blend-multiply opacity-60" />
          <div className="crt-glass pointer-events-none absolute inset-0" />
          {/* a cold screen that warms up on hover */}
          <div className="screen-wash pointer-events-none absolute inset-0 bg-[#060b16]/45" />
        </div>
      </div>

      {/* the control panel */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-maize/35 bg-maize/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-maize">
            {KIND_LABEL[g.kind]}
          </span>
          {g.labels.map((l) => (
            <span
              key={l}
              className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
            >
              {l}
            </span>
          ))}
          {g.twoPlayer && (
            <span className="inline-flex items-center gap-1 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              <Users size={10} /> 2P
            </span>
          )}
        </div>

        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-400">{g.blurb}</p>

        {/* the high-score strip along the bottom, like a real cabinet */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          {best ? (
            <span className="min-w-0 truncate font-pixel text-[9px] uppercase text-maize/80">
              {best.label} <span className="text-slate-300">{best.value}</span>
            </span>
          ) : (
            <span className="font-pixel text-[9px] uppercase text-slate-600 coin-blink">Insert coin</span>
          )}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-maize px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy transition group-hover:bg-white">
            <Play size={11} className="fill-current" /> Play
          </span>
        </div>
      </div>
    </Link>
  );
}
