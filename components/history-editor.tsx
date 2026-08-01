'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/editor';
import {
  updateHistoryPage, saveHistoryEntry, deleteHistoryEntry,
} from '@/app/actions/history';
import {
  Loader2, Plus, Save, Trash2, X, Star, CheckCircle2, AlertCircle, PenLine,
} from 'lucide-react';
import type { HistoryEntry, HistoryPage } from '@/lib/database.types';

type Msg = { type: 'ok' | 'err'; text: string } | null;

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${
        msg.type === 'ok'
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {msg.type === 'ok'
        ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
        : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
      {msg.text}
    </div>
  );
}

const BLANK = {
  id: undefined as string | undefined,
  year: new Date().getFullYear(),
  title: '',
  record: '',
  result: '' as 'W' | 'L' | 'T' | '',
  pointsFor: '',
  pointsAgainst: '',
  opponent: '',
  venue: '',
  coach: '',
  postseason: '',
  summaryHtml: '',
  isHighlight: false,
};

export default function HistoryEditor({
  page,
  entries,
}: { page: HistoryPage; entries: HistoryEntry[] }) {
  const router = useRouter();

  // A season and a single game need different fields. The page decides which.
  const isRivalry = page.kind === 'rivalry';

  // ---- page details ----
  const [title, setTitle] = useState(page.title);
  const [subtitle, setSubtitle] = useState(page.subtitle ?? '');
  const [kicker, setKicker] = useState(page.kicker ?? '');
  const [introHtml, setIntroHtml] = useState(page.intro_html);
  const [pageMsg, setPageMsg] = useState<Msg>(null);
  const [savingPage, startPage] = useTransition();

  // ---- entry form ----
  const [form, setForm] = useState({ ...BLANK });
  const [entryMsg, setEntryMsg] = useState<Msg>(null);
  const [savingEntry, startEntry] = useTransition();
  const [formOpen, setFormOpen] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function editEntry(e: HistoryEntry) {
    setForm({
      id: e.id,
      year: e.year,
      title: e.title ?? '',
      record: e.record ?? '',
      result: e.result ?? '',
      pointsFor: e.points_for?.toString() ?? '',
      pointsAgainst: e.points_against?.toString() ?? '',
      opponent: e.opponent ?? '',
      venue: e.venue ?? '',
      coach: e.coach ?? '',
      postseason: e.postseason ?? '',
      summaryHtml: e.summary_html,
      isHighlight: e.is_highlight,
    });
    setFormOpen(true);
    setEntryMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function savePage() {
    setPageMsg(null);
    startPage(async () => {
      const res = await updateHistoryPage({
        id: page.id, slug: page.slug, title, subtitle, kicker, introHtml,
      });
      setPageMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? '' });
      if (res.ok) router.refresh();
    });
  }

  function saveEntry() {
    setEntryMsg(null);
    startEntry(async () => {
      const res = await saveHistoryEntry({ ...form, pageId: page.id, slug: page.slug });
      setEntryMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? '' });
      if (res.ok) {
        setForm({ ...BLANK, year: form.year });
        setFormOpen(false);
        router.refresh();
      }
    });
  }

  function removeEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    startEntry(async () => {
      await deleteHistoryEntry(id, page.slug);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* ---------------- page details ---------------- */}
      <section className="card p-6">
        <h2 className="font-display text-[19px] font-bold text-navy">Page details</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Kicker (small label above the title)</label>
            <input value={kicker} onChange={(e) => setKicker(e.target.value)} className="input" />
          </div>
        </div>

        <label className="label mt-4">Subtitle</label>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input" />

        <label className="label mt-5">Introduction</label>
        <p className="mb-2 text-[12.5px] text-slate-400">
          Sits above the entries. Good place for context, sources, and how the page is maintained.
        </p>
        <RichEditor initialHtml={page.intro_html} onChange={(v) => setIntroHtml(v.html)} />

        <Note msg={pageMsg} />
        <button onClick={savePage} disabled={savingPage} className="btn-primary mt-4">
          {savingPage ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save page
        </button>
      </section>

      {/* ---------------- entry form ---------------- */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[19px] font-bold text-navy">
            {form.id ? 'Edit entry' : 'Add an entry'}
          </h2>
          {formOpen ? (
            <button
              onClick={() => { setForm({ ...BLANK }); setFormOpen(false); }}
              className="btn-ghost btn-sm"
            >
              <X size={14} /> Cancel
            </button>
          ) : (
            <button onClick={() => setFormOpen(true)} className="btn-primary btn-sm">
              <Plus size={14} /> New entry
            </button>
          )}
        </div>

        {formOpen && (
          <div className="mt-5">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="label">Year</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => set('year', Number(e.target.value))}
                  className="input"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="label">Headline (optional)</label>
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="The Snow Bowl · Bo's first year · 10-2, Rose Bowl"
                  className="input"
                />
              </div>
            </div>

            {isRivalry ? (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label">Result</label>
                    <select
                      value={form.result}
                      onChange={(e) => set('result', e.target.value as 'W' | 'L' | 'T' | '')}
                      className="input"
                    >
                      <option value="">—</option>
                      <option value="W">Michigan won</option>
                      <option value="L">Michigan lost</option>
                      <option value="T">Tied</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Michigan points</label>
                    <input
                      value={form.pointsFor}
                      onChange={(e) => set('pointsFor', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Opponent points</label>
                    <input
                      value={form.pointsAgainst}
                      onChange={(e) => set('pointsAgainst', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Venue</label>
                    <input
                      value={form.venue}
                      onChange={(e) => set('venue', e.target.value)}
                      placeholder="Michigan Stadium"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Michigan head coach</label>
                    <input value={form.coach} onChange={(e) => set('coach', e.target.value)} className="input" />
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Season record</label>
                  <input
                    value={form.record}
                    onChange={(e) => set('record', e.target.value)}
                    placeholder="10-2"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Head coach</label>
                  <input value={form.coach} onChange={(e) => set('coach', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">Postseason</label>
                  <input
                    value={form.postseason}
                    onChange={(e) => set('postseason', e.target.value)}
                    placeholder="Rose Bowl, W 21-16"
                    className="input"
                  />
                </div>
              </div>
            )}

            <label className="label mt-5">Write-up</label>
            <RichEditor
              key={form.id ?? 'new-entry'}
              initialHtml={form.summaryHtml}
              onChange={(v) => set('summaryHtml', v.html)}
            />

            <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[14px] font-semibold text-navy">
              <input
                type="checkbox"
                checked={form.isHighlight}
                onChange={(e) => set('isHighlight', e.target.checked)}
                className="h-4 w-4 accent-[#FFCB05]"
              />
              <Star size={14} className="text-maize-600" />
              Mark as notable
            </label>

            <Note msg={entryMsg} />
            <button onClick={saveEntry} disabled={savingEntry} className="btn-primary mt-4">
              {savingEntry ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {form.id ? 'Update entry' : 'Add entry'}
            </button>
          </div>
        )}
      </section>

      {/* ---------------- existing entries ---------------- */}
      <section>
        <h2 className="mb-4 font-display text-[19px] font-bold text-navy">
          Entries <span className="text-[15px] font-semibold text-slate-400">({entries.length})</span>
        </h2>

        {entries.length === 0 ? (
          <p className="card p-8 text-center text-sm text-slate-500">
            Nothing yet. Add the first entry above.
          </p>
        ) : (
          <div className="card divide-y divide-[var(--line)] overflow-hidden">
            {entries.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-4 p-4">
                <span className="w-16 shrink-0 font-display text-[20px] font-bold text-navy">
                  {e.year}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-semibold text-navy">
                    {e.is_highlight && <Star size={13} className="text-maize-600" />}
                    {e.title || <span className="text-slate-400">Untitled</span>}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {(isRivalry
                      ? [e.result && `${e.result} ${e.points_for ?? ''}-${e.points_against ?? ''}`, e.venue, e.coach]
                      : [e.record, e.postseason, e.coach]
                    )
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editEntry(e)} className="btn-ghost btn-sm">
                    <PenLine size={13} /> Edit
                  </button>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="btn btn-sm border border-[var(--line)] bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
