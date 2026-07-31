'use client';

import { useState, useTransition } from 'react';
import { subscribe } from '@/app/actions/subscribe';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export default function SubscribeForm({
  source,
  variant = 'light',
  heading = 'Your Dose of the Desk',
  blurb = 'One email a week: everything we published, plus what actually mattered in Ann Arbor. No spam, unsubscribe any time.',
}: {
  source?: string;
  variant?: 'light' | 'dark';
  heading?: string;
  blurb?: string;
}) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const dark = variant === 'dark';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const res = await subscribe({ email, source, website });
      if (res.ok) setDone(true);
      else setErr(res.message ?? 'Something went wrong.');
    });
  }

  if (done) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
          dark ? 'bg-white/10 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}
      >
        <CheckCircle2 size={20} className={dark ? 'text-maize' : 'text-emerald-600'} />
        <div>
          <p className="text-[15px] font-bold">You&rsquo;re on the list.</p>
          <p className={`text-[13px] ${dark ? 'text-slate-300' : 'text-emerald-800'}`}>
            Look out for the next one. Go Blue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        dark
          ? 'rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur'
          : 'card relative overflow-hidden p-6'
      }
    >
      {!dark && <div className="absolute inset-x-0 top-0 h-1 bg-maize" />}

      <h3
        className={`flex items-center gap-2 font-display text-[18px] font-bold ${
          dark ? 'text-white' : 'text-navy'
        }`}
      >
        <Mail size={17} className={dark ? 'text-maize' : 'text-maize-600'} />
        {heading}
      </h3>
      <p className={`mt-1.5 text-[14px] leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
        {blurb}
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        {/* Hidden from people, irresistible to bots. */}
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

        <label className="sr-only" htmlFor={`sub-${source ?? 'x'}`}>Email address</label>
        <input
          id={`sub-${source ?? 'x'}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`input flex-1 ${
            dark ? 'border-white/15 bg-white/10 text-white placeholder:text-slate-400' : ''
          }`}
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending && <Loader2 size={15} className="animate-spin" />}
          Subscribe
        </button>
      </form>

      {err && <p className="mt-2 text-[13px] font-medium text-red-500">{err}</p>}
    </div>
  );
}
