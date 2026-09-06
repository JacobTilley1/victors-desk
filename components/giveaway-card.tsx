'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { subscribe } from '@/app/actions/subscribe';
import { GIVEAWAY, countdownLabel, isRunning } from '@/lib/giveaway';
import { CheckCircle2, Loader2, Ticket } from 'lucide-react';

/**
 * Giveaway card, for inside an article.
 *
 * The bar catches people who scroll. This catches people who stop reading
 * halfway, which is most of them. Same offer, same source tracking, different
 * moment — and it stays on the page for anyone who dismissed the bar.
 *
 * Hides itself once the drawing has passed, so an old article doesn't sit
 * there advertising a closed giveaway.
 */
export default function GiveawayCard({ source = 'article' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!isRunning(GIVEAWAY)) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await subscribe({ email, source: `giveaway:${source}`, website });
      if (res.ok) setDone(true);
      else setErr(res.message ?? 'Something went wrong.');
    });
  }

  return (
    <aside className="not-prose my-10 overflow-hidden rounded-2xl border border-maize/50 bg-navy text-white shadow-card">
      <div className="field-grain relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_-30%,rgba(255,203,5,0.22),transparent_60%)]" />

        <div className="relative p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-maize px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-800">
              <Ticket size={12} /> Giveaway
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-maize">
              {countdownLabel()}
            </span>
          </div>

          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight sm:text-[28px]">
            {GIVEAWAY.prize}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-300">
            {GIVEAWAY.description} No purchase necessary. Drawing{' '}
            {new Date(`${GIVEAWAY.drawDate}T12:00:00`).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
            .
          </p>

          {done ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-maize/40 bg-white/10 px-4 py-3.5">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-maize" />
              <div>
                <p className="font-display text-[15px] font-bold">You&rsquo;re on the list.</p>
                <p className="mt-0.5 text-[13px] text-slate-300">
                  One more step —{' '}
                  <Link href="/login" className="font-semibold text-maize hover:underline">
                    create your free account
                  </Link>{' '}
                  to finish entering.
                </p>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <label className="sr-only" htmlFor={`giveaway-${source}`}>Email address</label>
                <input
                  id={`giveaway-${source}`}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input flex-1 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
                />
                <button type="submit" disabled={pending} className="btn-primary shrink-0">
                  {pending && <Loader2 size={15} className="animate-spin" />}
                  Enter free
                </button>
              </form>

              <p className="mt-3 text-[12px] text-slate-400">
                Takes about ninety seconds.{' '}
                <Link href={GIVEAWAY.href} className="underline hover:text-maize">
                  Full rules and eligibility
                </Link>
                .
              </p>
            </>
          )}

          {err && <p className="mt-2 text-[13px] font-medium text-red-300">{err}</p>}
        </div>
      </div>
    </aside>
  );
}
