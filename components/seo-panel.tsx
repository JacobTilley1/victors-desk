'use client';

import { useMemo, useState } from 'react';
import { analyze, type Verdict } from '@/lib/seo';
import {
  CheckCircle2, AlertTriangle, XCircle, Gauge, ChevronDown, Search,
} from 'lucide-react';

/**
 * Pre-publish SEO panel.
 *
 * Advisory only — it never blocks saving or submitting. A checklist that stops
 * you publishing turns into something you learn to click past, and breaking
 * news shouldn't wait on a keyphrase field.
 */

const ICON: Record<Verdict, typeof CheckCircle2> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  bad: XCircle,
};

const TONE: Record<Verdict, string> = {
  good: 'text-emerald-600',
  warn: 'text-amber-500',
  bad: 'text-red-500',
};

export default function SeoPanel({
  title, excerpt, html, cover, keyphrase, onKeyphrase,
}: {
  title: string;
  excerpt: string;
  html: string;
  cover: string;
  keyphrase: string;
  onKeyphrase: (v: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const report = useMemo(
    () => analyze({ title, excerpt, html, cover, keyphrase }),
    [title, excerpt, html, cover, keyphrase]
  );

  const problems = report.checks.filter((c) => c.verdict !== 'good');
  const shown = showAll ? report.checks : problems;

  const ring =
    report.score >= 80 ? 'text-emerald-500'
    : report.score >= 55 ? 'text-amber-500'
    : 'text-red-500';

  return (
    <div className="card p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2"
      >
        <Gauge size={15} className="text-navy" />
        <h3 className="font-display text-[15px] font-bold text-navy">Search readiness</h3>
        <span className={`ml-auto font-display text-[19px] font-bold ${ring}`}>
          {report.score}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <label className="label mt-4 flex items-center gap-1.5">
            <Search size={12} /> Focus keyphrase
          </label>
          <input
            value={keyphrase}
            onChange={(e) => onKeyphrase(e.target.value)}
            placeholder="e.g. savion hiter michigan"
            className="input text-[13.5px]"
          />
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
            What would someone type into Google to find this article?
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/80 p-3 text-center">
            <Stat value={report.stats.words} label="Words" />
            <Stat value={report.stats.internalLinks} label="Internal" />
            <Stat value={report.stats.headings} label="Headings" />
          </div>

          <ul className="mt-4 space-y-2.5">
            {shown.map((c) => {
              const Icon = ICON[c.verdict];
              return (
                <li key={c.id} className="flex items-start gap-2">
                  <Icon size={14} className={`mt-0.5 shrink-0 ${TONE[c.verdict]}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-navy-700">{c.label}</p>
                    <p className="text-[12px] leading-relaxed text-slate-500">{c.detail}</p>
                  </div>
                </li>
              );
            })}
            {!problems.length && !showAll && (
              <li className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
                <CheckCircle2 size={14} /> Everything checks out.
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 text-[12px] font-semibold text-navy-500 hover:underline"
          >
            {showAll ? 'Only show what needs work' : `Show all ${report.checks.length} checks`}
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-[17px] font-bold leading-none text-navy">{value}</p>
      <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
