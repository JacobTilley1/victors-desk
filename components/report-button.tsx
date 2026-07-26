'use client';

import { useState, useTransition } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { reportContent } from '@/app/actions/comments';
import { REPORT_REASONS } from '@/lib/constants';

export default function ReportButton({
  targetType,
  targetId,
  compact = true,
}: {
  targetType: 'comment' | 'thread' | 'reply';
  targetId: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const res = await reportContent({
        targetType,
        targetId,
        reason: detail.trim() ? `${reason} — ${detail.trim()}` : reason,
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { setOpen(false); setDone(false); setDetail(''); }, 1400);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-slate-400 transition hover:text-red-600 ${
          compact ? 'text-[11.5px] font-medium' : 'text-sm font-semibold'
        }`}
        title="Report to moderators"
      >
        <Flag size={12} /> Report
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/55 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="animate-fade-up relative w-full max-w-sm rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-navy"
            >
              <X size={18} />
            </button>

            {done ? (
              <div className="py-6 text-center">
                <p className="font-display text-lg font-bold text-navy">Report sent</p>
                <p className="mt-1.5 text-sm text-slate-500">A moderator will review it.</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold text-navy">Report this content</h3>
                <p className="mt-1 text-[13.5px] text-slate-500">
                  Moderators see every report. Abuse of reporting is also moderated.
                </p>

                <label className="label mt-5">Reason</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
                  {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>

                <label className="label mt-4">Details (optional)</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  className="input resize-none text-sm"
                  placeholder="Anything a moderator should know."
                />

                <div className="mt-5 flex gap-2">
                  <button onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
                  <button onClick={submit} disabled={pending} className="btn-navy flex-1">
                    {pending && <Loader2 size={14} className="animate-spin" />} Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
