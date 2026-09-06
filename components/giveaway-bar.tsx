'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { subscribe } from '@/app/actions/subscribe';
import { GIVEAWAY, countdownLabel, isRunning } from '@/lib/giveaway';
import { CheckCircle2, Loader2, X } from 'lucide-react';

/**
 * Giveaway bar.
 *
 * Anchored to the bottom of the viewport, never covering the article. That's
 * deliberate: Google's intrusive-interstitial guidance is aimed at overlays
 * that block content on mobile, and a dismissible bottom bar sits well clear
 * of it. It also just behaves better — a modal that ambushes someone mid-
 * paragraph is the thing people mean when they say a site feels cheap.
 *
 * Rules it follows:
 *   - only after 55% scroll depth, so it appears to people actually reading
 *   - one dismissal is remembered for 30 days
 *   - never on the giveaway article itself, or on account/admin routes
 *   - disappears for good once someone subscribes from it
 *   - honours prefers-reduced-motion
 */

const KEY = 'vd:giveaway-bar';
const REMEMBER_DAYS = 30;
const TRIGGER = 0.55;

/** Routes where the bar would be redundant or intrusive. */
const HIDDEN_ON = [
  '/login', '/account', '/admin', '/write', '/dashboard', '/unsubscribe',
  '/history/results/manage', '/history/coaches/manage', '/pro/manage',
];

function isDismissed() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Number.isFinite(until) && Date.now() < until) return true;
    window.localStorage.removeItem(KEY);
    return false;
  } catch {
    return false;
  }
}

function remember() {
  try {
    window.localStorage.setItem(
      KEY,
      String(Date.now() + REMEMBER_DAYS * 86_400_000)
    );
  } catch { /* storage blocked — it'll just show again next visit */ }
}

export default function GiveawayBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);   // drives the slide-up
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');  // honeypot
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const suppressed =
    !isRunning(GIVEAWAY) ||
    HIDDEN_ON.some((p) => pathname?.startsWith(p)) ||
    pathname === new URL(GIVEAWAY.href).pathname;

  useEffect(() => {
    if (suppressed || isDismissed()) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= TRIGGER) {
        setVisible(true);
        // Next frame, so the transition has something to animate from.
        requestAnimationFrame(() => setShown(true));
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [suppressed, pathname]);

  function close() {
    setShown(false);
    remember();
    window.setTimeout(() => setVisible(false), 250);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await subscribe({ email, source: 'giveaway-bar', website });
      if (res.ok) {
        setDone(true);
        remember();
        window.setTimeout(close, 4000);
      } else {
        setErr(res.message ?? 'Something went wrong.');
      }
    });
  }

  if (suppressed || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Giveaway"
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 motion-reduce:transition-none ${
        shown ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="border-t-2 border-maize bg-navy/95 shadow-[0_-8px_30px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="container-page relative py-4">
          <button
            onClick={close}
            aria-label="Dismiss"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>

          {done ? (
            <div className="flex items-center gap-3 py-1 pr-8">
              <CheckCircle2 size={20} className="shrink-0 text-maize" />
              <div>
                <p className="font-display text-[15px] font-bold text-white">
                  You&rsquo;re entered.
                </p>
                <p className="text-[13px] text-slate-300">
                  Make an account to finish entering, or just enjoy the newsletter.{' '}
                  <Link href="/login" className="font-semibold text-maize hover:underline">
                    Sign in with Google
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pr-8 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-center gap-3">
                <span className="hidden shrink-0 items-center justify-center rounded-xl bg-maize px-3 py-2 font-display text-[19px] font-bold leading-none text-navy sm:flex">
                  {GIVEAWAY.winners}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-display text-[15.5px] font-bold leading-tight text-white">
                    {GIVEAWAY.prize}
                    <span className="chip bg-white/10 text-[10.5px] text-maize">
                      {countdownLabel()}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-slate-300">
                    Free to enter.{' '}
                    <Link href={GIVEAWAY.href} className="underline hover:text-maize">
                      Rules
                    </Link>
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="flex flex-1 gap-2 lg:max-w-md lg:ml-auto">
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
                <label className="sr-only" htmlFor="giveaway-bar-email">Email address</label>
                <input
                  id="giveaway-bar-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input flex-1 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
                />
                <button type="submit" disabled={pending} className="btn-primary shrink-0">
                  {pending && <Loader2 size={15} className="animate-spin" />}
                  Enter
                </button>
              </form>
            </div>
          )}

          {err && <p className="mt-2 text-[13px] font-medium text-red-300">{err}</p>}
        </div>
      </div>
    </div>
  );
}
