'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/editor';
import { saveCoach, deleteCoach } from '@/app/actions/coaches';
import { tenureLabel, recordLabel } from '@/lib/coaches';
import {
  Loader2, Plus, Save, Trash2, X, Star, CheckCircle2, AlertCircle, PenLine,
} from 'lucide-react';
import type { HistoryCoach } from '@/lib/database.types';

type Msg = { type: 'ok' | 'err'; text: string } | null;

const BLANK = {
  id: undefined as string | undefined,
  name: '',
  nickname: '',
  eraTitle: '',
  tenureFrom: '',
  tenureTo: '',
  isCurrent: false,
  wins: '',
  losses: '',
  ties: '',
  nationalTitles: '',
  bigTenTitles: '',
  bowlRecord: '',
  accolades: '',
  portraitUrl: '',
  summaryHtml: '',
  isHighlight: false,
};

export default function CoachEditor({ coaches }: { coaches: HistoryCoach[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...BLANK });
  const [msg, setMsg] = useState<Msg>(null);
  const [saving, start] = useTransition();
  const [open, setOpen] = useState(false);
  // Forces the rich editor to remount when a different coach is loaded, so the
  // write-up field swaps instead of keeping the previous coach's text.
  const [editorKey, setEditorKey] = useState(0);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function edit(c: HistoryCoach) {
    setForm({
      id: c.id,
      name: c.name,
      nickname: c.nickname ?? '',
      eraTitle: c.era_title ?? '',
      tenureFrom: c.tenure_from.toString(),
      tenureTo: c.tenure_to?.toString() ?? '',
      isCurrent: c.is_current,
      wins: c.wins?.toString() ?? '',
      losses: c.losses?.toString() ?? '',
      ties: c.ties?.toString() ?? '',
      nationalTitles: c.national_titles.toString(),
      bigTenTitles: c.big_ten_titles.toString(),
      bowlRecord: c.bowl_record ?? '',
      accolades: c.accolades ?? '',
      portraitUrl: c.portrait_url ?? '',
      summaryHtml: c.summary_html,
      isHighlight: c.is_highlight,
    });
    setEditorKey((k) => k + 1);
    setOpen(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveCoach(form);
      setMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? '' });
      if (res.ok) {
        setForm({ ...BLANK });
        setEditorKey((k) => k + 1);
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!confirm('Remove this coach?')) return;
    start(async () => {
      await deleteCoach(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[19px] font-bold text-navy">
            {form.id ? `Editing ${form.name || 'coach'}` : 'Add a coach'}
          </h2>
          {!open ? (
            <button onClick={() => setOpen(true)} className="btn-primary btn-sm ml-auto">
              <Plus size={14} /> New coach
            </button>
          ) : (
            <button
              onClick={() => { setForm({ ...BLANK }); setEditorKey((k) => k + 1); setOpen(false); }}
              className="ml-auto text-[13px] font-semibold text-slate-500 hover:underline"
            >
              <X size={14} className="inline" /> Cancel
            </button>
          )}
        </div>

        {open && (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="Bo Schembechler" />
              </div>
              <div>
                <label className="label">Nickname</label>
                <input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} className="input" placeholder="Bo" />
              </div>
            </div>

            <label className="label mt-4">Era headline</label>
            <input
              value={form.eraTitle}
              onChange={(e) => set('eraTitle', e.target.value)}
              className="input"
              placeholder="Twenty-one years, thirteen Big Ten titles, and a program rebuilt."
            />

            <div className="mt-6 rounded-xl border border-[var(--line)] bg-slate-50/70 p-4">
              <h3 className="font-display text-[15px] font-bold text-navy">Tenure</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">First season</label>
                  <input value={form.tenureFrom} onChange={(e) => set('tenureFrom', e.target.value)} className="input" placeholder="1969" />
                </div>
                <div>
                  <label className="label">Last season</label>
                  <input
                    value={form.tenureTo}
                    onChange={(e) => set('tenureTo', e.target.value)}
                    disabled={form.isCurrent}
                    className="input disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="1989"
                  />
                </div>
                <label className="flex items-end gap-2 pb-2 text-[13.5px] font-semibold text-navy-700">
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) => set('isCurrent', e.target.checked)}
                    className="h-4 w-4 accent-[#FFCB05]"
                  />
                  Still the coach
                </label>
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                First season sets the order on the index page, so it&rsquo;s required.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--line)] bg-slate-50/70 p-4">
              <h3 className="font-display text-[15px] font-bold text-navy">Record at Michigan</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Wins</label>
                  <input value={form.wins} onChange={(e) => set('wins', e.target.value)} className="input" placeholder="194" />
                </div>
                <div>
                  <label className="label">Losses</label>
                  <input value={form.losses} onChange={(e) => set('losses', e.target.value)} className="input" placeholder="48" />
                </div>
                <div>
                  <label className="label">Ties</label>
                  <input value={form.ties} onChange={(e) => set('ties', e.target.value)} className="input" placeholder="5" />
                </div>
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                Winning percentage is calculated from these, with ties counted as half a win —
                the same convention as the all-time figures on the seasons page.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">National titles</label>
                <input value={form.nationalTitles} onChange={(e) => set('nationalTitles', e.target.value)} className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">Big Ten titles</label>
                <input value={form.bigTenTitles} onChange={(e) => set('bigTenTitles', e.target.value)} className="input" placeholder="13" />
              </div>
              <div>
                <label className="label">Bowl record</label>
                <input value={form.bowlRecord} onChange={(e) => set('bowlRecord', e.target.value)} className="input" placeholder="5-12" />
              </div>
            </div>

            <label className="label mt-4">Honours</label>
            <input
              value={form.accolades}
              onChange={(e) => set('accolades', e.target.value)}
              className="input"
              placeholder="College Football Hall of Fame · 2× National Coach of the Year"
            />

            <label className="label mt-4">Portrait URL</label>
            <input value={form.portraitUrl} onChange={(e) => set('portraitUrl', e.target.value)} className="input text-[13px]" placeholder="https://…" />

            <label className="label mt-5">The write-up</label>
            <p className="mb-2 text-[12.5px] text-slate-400">
              What the tenure actually was — how he got the job, what changed, how it ended,
              and how it&rsquo;s remembered. This is the part that makes the page worth reading.
            </p>
            <RichEditor
              key={editorKey}
              initialHtml={form.summaryHtml}
              onChange={(v) => set('summaryHtml', v.html)}
            />

            <label className="mt-4 flex items-center gap-2 text-[13.5px] font-semibold text-navy-700">
              <input
                type="checkbox"
                checked={form.isHighlight}
                onChange={(e) => set('isHighlight', e.target.checked)}
                className="h-4 w-4 accent-[#FFCB05]"
              />
              <Star size={14} /> Mark as notable
            </label>

            {msg && (
              <div className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${
                msg.type === 'ok'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-red-200 bg-red-50 text-red-700'
              }`}>
                {msg.type === 'ok'
                  ? <CheckCircle2 size={15} className="mt-0.5" />
                  : <AlertCircle size={15} className="mt-0.5" />}
                {msg.text}
              </div>
            )}

            <button onClick={save} disabled={saving} className="btn-primary mt-5">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {form.id ? 'Save changes' : 'Add coach'}
            </button>
          </>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-[19px] font-bold text-navy">
          On the site ({coaches.length})
        </h2>
        {coaches.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No coaches yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {coaches.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <span className="chip bg-navy font-mono text-maize">{tenureLabel(c)}</span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold text-navy">{c.name}</p>
                  <p className="text-[12px] text-slate-400">
                    {recordLabel(c) ?? 'No record entered'}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => edit(c)} className="btn-ghost btn-sm" title="Edit">
                    <PenLine size={14} />
                  </button>
                  <button onClick={() => remove(c.id)} className="btn-ghost btn-sm text-red-600" title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
