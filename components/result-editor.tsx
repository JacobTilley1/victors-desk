'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/editor';
import { saveGame, deleteGame } from '@/app/actions/results';
import { scoreLine, matchupLine, opponentSlug } from '@/lib/results';
import {
  Loader2, Plus, Save, Trash2, X, Star, CheckCircle2, AlertCircle, PenLine,
} from 'lucide-react';
import type { GameSite, HistoryGame } from '@/lib/database.types';

type Msg = { type: 'ok' | 'err'; text: string } | null;

const BLANK = {
  id: undefined as string | undefined,
  season: new Date().getFullYear().toString(),
  gameNo: '',
  gameDate: '',
  opponent: '',
  opponentRank: '',
  michiganRank: '',
  site: 'home' as GameSite,
  venue: 'Michigan Stadium',
  attendance: '',
  result: '' as 'W' | 'L' | 'T' | '',
  pointsFor: '',
  pointsAgainst: '',
  coach: '',
  postseason: '',
  headline: '',
  summaryHtml: '',
  isHighlight: false,
};

export default function ResultEditor({ games }: { games: HistoryGame[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...BLANK });
  const [msg, setMsg] = useState<Msg>(null);
  const [saving, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function edit(g: HistoryGame) {
    setForm({
      id: g.id,
      season: g.season.toString(),
      gameNo: g.game_no?.toString() ?? '',
      gameDate: g.game_date ?? '',
      opponent: g.opponent,
      opponentRank: g.opponent_rank?.toString() ?? '',
      michiganRank: g.michigan_rank?.toString() ?? '',
      site: g.site,
      venue: g.venue ?? '',
      attendance: g.attendance?.toString() ?? '',
      result: g.result ?? '',
      pointsFor: g.points_for?.toString() ?? '',
      pointsAgainst: g.points_against?.toString() ?? '',
      coach: g.coach ?? '',
      postseason: g.postseason ?? '',
      headline: g.headline ?? '',
      summaryHtml: g.summary_html,
      isHighlight: g.is_highlight,
    });
    setEditorKey((k) => k + 1);
    setOpen(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveGame(form);
      setMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? '' });
      if (res.ok) {
        /*
         * Keep the season and advance the game number. Logging a season is a
         * dozen entries in a row, and re-typing the year every time is the
         * kind of friction that makes an archive stop getting filled in.
         */
        const nextNo = form.gameNo ? String(Number(form.gameNo) + 1) : '';
        setForm({ ...BLANK, season: form.season, gameNo: nextNo, coach: form.coach });
        setEditorKey((k) => k + 1);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!confirm('Remove this game?')) return;
    start(async () => {
      await deleteGame(id);
      router.refresh();
    });
  }

  const previewSlug = form.opponent
    ? `${form.season}-${opponentSlug(form.opponent)}`
    : null;

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[19px] font-bold text-navy">
            {form.id ? 'Editing game' : 'Log a game'}
          </h2>
          {!open ? (
            <button onClick={() => setOpen(true)} className="btn-primary btn-sm ml-auto">
              <Plus size={14} /> New game
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
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div>
                <label className="label">Season</label>
                <input value={form.season} onChange={(e) => set('season', e.target.value)} className="input" placeholder="2026" />
              </div>
              <div>
                <label className="label">Game #</label>
                <input value={form.gameNo} onChange={(e) => set('gameNo', e.target.value)} className="input" placeholder="1" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Date</label>
                <input type="date" value={form.gameDate} onChange={(e) => set('gameDate', e.target.value)} className="input" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="label">Opponent</label>
                <input value={form.opponent} onChange={(e) => set('opponent', e.target.value)} className="input" placeholder="Western Michigan" />
              </div>
              <div>
                <label className="label">Their rank</label>
                <input value={form.opponentRank} onChange={(e) => set('opponentRank', e.target.value)} className="input" placeholder="9" />
              </div>
              <div>
                <label className="label">Our rank</label>
                <input value={form.michiganRank} onChange={(e) => set('michiganRank', e.target.value)} className="input" placeholder="16" />
              </div>
            </div>

            {previewSlug && (
              <p className="mt-2 text-[12px] text-slate-400">
                URL: <span className="font-mono text-navy-500">/history/results/{previewSlug}</span>
                {' · '}series page: <span className="font-mono text-navy-500">/vs/{opponentSlug(form.opponent)}</span>
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Site</label>
                <select value={form.site} onChange={(e) => set('site', e.target.value as GameSite)} className="input">
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label className="label">Venue</label>
                <input value={form.venue} onChange={(e) => set('venue', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Attendance</label>
                <input value={form.attendance} onChange={(e) => set('attendance', e.target.value)} className="input" placeholder="107601" />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--line)] bg-slate-50/70 p-4">
              <h3 className="font-display text-[15px] font-bold text-navy">Result</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">W / L / T</label>
                  <select
                    value={form.result}
                    onChange={(e) => set('result', e.target.value as 'W' | 'L' | 'T' | '')}
                    className="input"
                  >
                    <option value="">Not played yet</option>
                    <option value="W">Win</option>
                    <option value="L">Loss</option>
                    <option value="T">Tie</option>
                  </select>
                </div>
                <div>
                  <label className="label">Michigan</label>
                  <input value={form.pointsFor} onChange={(e) => set('pointsFor', e.target.value)} className="input" placeholder="38" />
                </div>
                <div>
                  <label className="label">Opponent</label>
                  <input value={form.pointsAgainst} onChange={(e) => set('pointsAgainst', e.target.value)} className="input" placeholder="10" />
                </div>
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                Leave the result blank to log a scheduled game before it&rsquo;s played.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Coach</label>
                <input value={form.coach} onChange={(e) => set('coach', e.target.value)} className="input" placeholder="Kyle Whittingham" />
              </div>
              <div>
                <label className="label">Postseason</label>
                <input value={form.postseason} onChange={(e) => set('postseason', e.target.value)} className="input" placeholder="Rose Bowl" />
              </div>
            </div>

            <label className="label mt-4">Headline</label>
            <input
              value={form.headline}
              onChange={(e) => set('headline', e.target.value)}
              className="input"
              placeholder="The Snow Bowl"
            />

            <label className="label mt-5">What happened</label>
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
              <Star size={14} /> Notable game
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
              {form.id ? 'Save changes' : 'Log game'}
            </button>
          </>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-[19px] font-bold text-navy">
          Logged ({games.length})
        </h2>
        {games.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No games yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {games.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-3">
                <span className="w-12 shrink-0 font-display text-[15px] font-bold text-navy">
                  {g.season}
                </span>
                <span className="chip bg-navy font-mono text-maize">
                  {scoreLine(g) ?? 'TBD'}
                </span>
                <span className="min-w-0 truncate text-[14px] text-navy-700">
                  {matchupLine(g)}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => edit(g)} className="btn-ghost btn-sm" title="Edit">
                    <PenLine size={14} />
                  </button>
                  <button onClick={() => remove(g.id)} className="btn-ghost btn-sm text-red-600" title="Remove">
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
