'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  WOLVERINES, MAX_GUESSES, compare, shareGrid, puzzleNumber,
  type GuessResult, type Mark, type Wolverine,
} from '@/lib/games/wolverine';
import {
  Search, ArrowUp, ArrowDown, Check, X, Share2, CalendarDays, Trophy, Info,
} from 'lucide-react';

/**
 * Guess the Wolverine.
 *
 * State is kept per puzzle date in localStorage, so a finished puzzle stays
 * finished on reload and an archive puzzle you played last week still shows
 * your result. Nothing here needs an account — gating a daily game behind
 * sign-in is the fastest way to kill it — but a signed-in player gets their
 * streak tracked server-side by the parent page.
 */

const TONE: Record<Mark, string> = {
  hit: 'bg-maize text-navy-800 border-maize',
  near: 'bg-navy-500/15 text-navy-700 border-navy-200',
  miss: 'bg-slate-100 text-slate-500 border-slate-200',
};

interface Saved {
  guesses: string[];
  done: boolean;
  solved: boolean;
}

function storageKey(date: string) {
  return `vd:gtw:${date}`;
}

export default function GuessTheWolverine({
  answer,
  date,
  isToday,
}: { answer: Wolverine; date: string; isToday: boolean }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore any previous attempt at this specific date.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(date));
      if (raw) {
        const saved = JSON.parse(raw) as Saved;
        if (Array.isArray(saved.guesses)) setGuesses(saved.guesses);
      }
    } catch { /* storage blocked — play unsaved */ }
    setHydrated(true);
  }, [date]);

  const results: GuessResult[] = useMemo(
    () =>
      guesses
        .map((n) => WOLVERINES.find((w) => w.name === n))
        .filter((w): w is Wolverine => !!w)
        .map((w) => compare(w, answer)),
    [guesses, answer]
  );

  const solved = results.some((r) => r.correct);
  const done = solved || guesses.length >= MAX_GUESSES;

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Saved = { guesses, done, solved };
      window.localStorage.setItem(storageKey(date), JSON.stringify(payload));
    } catch { /* ignore */ }
  }, [guesses, done, solved, date, hydrated]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return WOLVERINES
      .filter((w) => !guesses.includes(w.name))
      .filter((w) => w.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, guesses]);

  function submit(name: string) {
    if (done || guesses.includes(name)) return;
    setGuesses((g) => [...g, name]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  async function share() {
    const text = shareGrid(results, date, solved);
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled */ }
  }

  const remaining = MAX_GUESSES - guesses.length;

  return (
    <div className="mx-auto max-w-2xl">
      {/* ---------- header ---------- */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-navy px-5 py-4 text-white">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-maize">
              Puzzle #{puzzleNumber(date)}
            </p>
            <h2 className="font-display text-[19px] font-bold leading-tight">
              Guess the Wolverine
            </h2>
          </div>
          <span className="ml-auto text-[12px] font-semibold text-slate-300">
            {new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>

        <div className="p-5">
          {!done && (
            <>
              <p className="mb-3 text-[13.5px] text-slate-500">
                Guess any Michigan player. Each guess tells you how close you are.{' '}
                <span className="font-semibold text-navy">
                  {remaining} {remaining === 1 ? 'guess' : 'guesses'} left.
                </span>
              </p>

              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && suggestions[0]) submit(suggestions[0].name);
                    if (e.key === 'Escape') setOpen(false);
                  }}
                  placeholder="Start typing a name…"
                  className="input pl-10"
                  autoComplete="off"
                />

                {open && suggestions.length > 0 && (
                  <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-lg">
                    {suggestions.map((w) => (
                      <li key={w.name}>
                        <button
                          type="button"
                          onClick={() => submit(w.name)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-maize-50"
                        >
                          <span className="font-semibold text-navy">{w.name}</span>
                          <span className="ml-auto text-[12px] text-slate-400">
                            {w.position}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* ---------- results grid ---------- */}
          {results.length > 0 && (
            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-5 gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {results[0].fields.map((f) => (
                  <span key={f.label} className="text-center">{f.label}</span>
                ))}
              </div>

              {results.map((r, i) => (
                <div key={`${r.name}-${i}`}>
                  <p className="mb-1 flex items-center gap-1.5 px-1 text-[13px] font-bold text-navy">
                    {r.correct
                      ? <Check size={13} className="text-emerald-600" />
                      : <X size={13} className="text-slate-300" />}
                    {r.name}
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {r.fields.map((f) => (
                      <div
                        key={f.label}
                        className={`flex min-h-[46px] flex-col items-center justify-center rounded-lg border px-1 text-center ${TONE[f.mark]}`}
                      >
                        <span className="text-[12px] font-bold leading-tight">{f.value}</span>
                        {f.direction && (
                          f.direction === 'up'
                            ? <ArrowUp size={11} className="mt-0.5" />
                            : <ArrowDown size={11} className="mt-0.5" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- endgame ---------- */}
          {done && (
            <div className={`mt-5 rounded-xl border p-5 ${
              solved ? 'border-maize bg-maize-50' : 'border-[var(--line)] bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                {solved
                  ? <Trophy size={17} className="text-maize-700" />
                  : <Info size={17} className="text-slate-400" />}
                <p className="font-display text-[17px] font-bold text-navy">
                  {solved
                    ? `Got it in ${guesses.length}.`
                    : `It was ${answer.name}.`}
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-white/70 p-4">
                <p className="font-display text-[18px] font-bold text-navy">{answer.name}</p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {answer.position} · #{answer.number} · {answer.from}–{answer.to} · {answer.state}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-700">{answer.note}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={share} className="btn-primary btn-sm">
                  <Share2 size={14} /> {copied ? 'Copied' : 'Share result'}
                </button>
                <Link href="/games/guess-the-wolverine/archive" className="btn-ghost btn-sm">
                  <CalendarDays size={14} /> Play past puzzles
                </Link>
              </div>

              {isToday && (
                <p className="mt-3 text-[12.5px] text-slate-500">
                  A new Wolverine unlocks at 5:00 a.m. Eastern.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- legend ---------- */}
      <div className="card mt-4 p-5">
        <h3 className="font-display text-[14px] font-bold text-navy">How to read a guess</h3>
        <ul className="mt-2.5 space-y-1.5 text-[13px] text-slate-600">
          <li><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-maize align-middle" /> Exact match.</li>
          <li><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-navy-500/25 align-middle" /> Close — same side of the ball, within eight years, or within ten jersey numbers.</li>
          <li><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-slate-200 align-middle" /> No match.</li>
          <li className="flex items-center gap-1.5 pt-1">
            <ArrowUp size={12} /> <ArrowDown size={12} />
            <span>Arrows point toward the answer — later era, or a higher number.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
