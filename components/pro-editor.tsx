'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/editor';
import { saveProPlayer, deleteProPlayer, updateProSettings } from '@/app/actions/pro';
import { LEAGUES, leagueLabel } from '@/lib/pro';
import {
  Loader2, Plus, Save, Trash2, X, Star, CheckCircle2, AlertCircle, PenLine,
} from 'lucide-react';
import type { League, ProPlayer, ProSettings, ProStatus } from '@/lib/database.types';

type Msg = { type: 'ok' | 'err'; text: string } | null;

const BLANK = {
  id: undefined as string | undefined,
  name: '',
  league: 'nfl' as League,
  position: '',
  proTeam: '',
  jerseyNumber: '',
  status: 'active' as ProStatus,
  michiganYears: '',
  michiganNote: '',
  draftYear: '',
  draftRound: '',
  draftPick: '',
  draftedBy: '',
  accolades: '',
  headshotUrl: '',
  bioHtml: '',
  isHighlight: false,
};

export default function ProEditor({
  players,
  settings,
}: { players: ProPlayer[]; settings: ProSettings | null }) {
  const router = useRouter();

  // ---- headline figures ----
  const [nflActive, setNflActive] = useState(settings?.nfl_active?.toString() ?? '');
  const [nbaActive, setNbaActive] = useState(settings?.nba_active?.toString() ?? '');
  const [figuresNote, setFiguresNote] = useState(settings?.figures_note ?? '');
  const [figMsg, setFigMsg] = useState<Msg>(null);
  const [savingFigs, startFigs] = useTransition();

  function saveFigures() {
    setFigMsg(null);
    startFigs(async () => {
      const res = await updateProSettings({ nflActive, nbaActive, figuresNote });
      setFigMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? '' });
      if (res.ok) router.refresh();
    });
  }

  const [form, setForm] = useState({ ...BLANK });
  const [msg, setMsg] = useState<Msg>(null);
  const [saving, start] = useTransition();
  const [open, setOpen] = useState(false);
  // Remounts the rich editor when a different player is loaded, so the bio
  // field actually swaps instead of keeping the previous player's text.
  const [editorKey, setEditorKey] = useState(0);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function edit(p: ProPlayer) {
    setForm({
      id: p.id,
      name: p.name,
      league: p.league,
      position: p.position ?? '',
      proTeam: p.pro_team ?? '',
      jerseyNumber: p.jersey_number ?? '',
      status: p.status,
      michiganYears: p.michigan_years ?? '',
      michiganNote: p.michigan_note ?? '',
      draftYear: p.draft_year?.toString() ?? '',
      draftRound: p.draft_round?.toString() ?? '',
      draftPick: p.draft_pick?.toString() ?? '',
      draftedBy: p.drafted_by ?? '',
      accolades: p.accolades ?? '',
      headshotUrl: p.headshot_url ?? '',
      bioHtml: p.bio_html,
      isHighlight: p.is_highlight,
    });
    setEditorKey((k) => k + 1);
    setOpen(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveProPlayer(form);
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
    if (!confirm('Remove this player?')) return;
    start(async () => {
      await deleteProPlayer(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* ---------------- headline figures ---------------- */}
      <section className="card p-6">
        <h2 className="font-display text-[19px] font-bold text-navy">Headline figures</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
          The real number of Wolverines on NFL and NBA rosters, entered by hand — not a
          count of the profiles on this site. Leave blank to hide them.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Wolverines in the NFL</label>
            <input
              value={nflActive}
              onChange={(e) => setNflActive(e.target.value)}
              className="input"
              placeholder="24"
            />
          </div>
          <div>
            <label className="label">Wolverines in the NBA</label>
            <input
              value={nbaActive}
              onChange={(e) => setNbaActive(e.target.value)}
              className="input"
              placeholder="6"
            />
          </div>
        </div>

        <label className="label mt-3">Caption</label>
        <input
          value={figuresNote}
          onChange={(e) => setFiguresNote(e.target.value)}
          className="input"
          placeholder="Active rosters as of the 2026 season"
        />

        {figMsg && (
          <div className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${
            figMsg.type === 'ok'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}>
            {figMsg.type === 'ok'
              ? <CheckCircle2 size={15} className="mt-0.5" />
              : <AlertCircle size={15} className="mt-0.5" />}
            {figMsg.text}
          </div>
        )}

        <button onClick={saveFigures} disabled={savingFigs} className="btn-primary mt-4">
          {savingFigs ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save figures
        </button>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[19px] font-bold text-navy">
            {form.id ? `Editing ${form.name || 'player'}` : 'Add a player'}
          </h2>
          {!open && (
            <button onClick={() => setOpen(true)} className="btn-primary btn-sm ml-auto">
              <Plus size={14} /> New player
            </button>
          )}
          {open && (
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
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="JJ McCarthy" />
              </div>
              <div>
                <label className="label">League</label>
                <select value={form.league} onChange={(e) => set('league', e.target.value as League)} className="input">
                  {LEAGUES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <label className="label">Position</label>
                <input value={form.position} onChange={(e) => set('position', e.target.value)} className="input" placeholder="QB" />
              </div>
              <div>
                <label className="label">Pro team</label>
                <input value={form.proTeam} onChange={(e) => set('proTeam', e.target.value)} className="input" placeholder="Minnesota Vikings" />
              </div>
              <div>
                <label className="label">Number</label>
                <input value={form.jerseyNumber} onChange={(e) => set('jerseyNumber', e.target.value)} className="input" placeholder="9" />
              </div>
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value as ProStatus)} className="input">
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--line)] bg-slate-50/70 p-4">
              <h3 className="font-display text-[15px] font-bold text-navy">Draft</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="label">Year</label>
                  <input value={form.draftYear} onChange={(e) => set('draftYear', e.target.value)} className="input" placeholder="2024" />
                </div>
                <div>
                  <label className="label">Round</label>
                  <input value={form.draftRound} onChange={(e) => set('draftRound', e.target.value)} className="input" placeholder="1" />
                </div>
                <div>
                  <label className="label">Pick</label>
                  <input value={form.draftPick} onChange={(e) => set('draftPick', e.target.value)} className="input" placeholder="10" />
                </div>
                <div>
                  <label className="label">By</label>
                  <input value={form.draftedBy} onChange={(e) => set('draftedBy', e.target.value)} className="input" placeholder="Minnesota Vikings" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Years at Michigan</label>
                <input value={form.michiganYears} onChange={(e) => set('michiganYears', e.target.value)} className="input" placeholder="2021–2023" />
              </div>
              <div>
                <label className="label">Honours</label>
                <input value={form.accolades} onChange={(e) => set('accolades', e.target.value)} className="input" placeholder="2023 National Champion · Pro Bowl" />
              </div>
            </div>

            <label className="label mt-4">What they did in Ann Arbor</label>
            <input
              value={form.michiganNote}
              onChange={(e) => set('michiganNote', e.target.value)}
              className="input"
              placeholder="One line — this sits in a highlighted band near the top of the page."
            />

            <label className="label mt-4">Headshot URL</label>
            <input value={form.headshotUrl} onChange={(e) => set('headshotUrl', e.target.value)} className="input text-[13px]" placeholder="https://…" />

            <label className="label mt-5">Write-up</label>
            <p className="mb-2 text-[12.5px] text-slate-400">
              The part that makes this page worth existing — their Michigan career, how the
              pro career has gone, what they meant here. Stats alone won&rsquo;t rank.
            </p>
            <RichEditor
              key={editorKey}
              initialHtml={form.bioHtml}
              onChange={(v) => set('bioHtml', v.html)}
            />

            <label className="mt-4 flex items-center gap-2 text-[13.5px] font-semibold text-navy-700">
              <input
                type="checkbox"
                checked={form.isHighlight}
                onChange={(e) => set('isHighlight', e.target.checked)}
                className="h-4 w-4 accent-[#FFCB05]"
              />
              <Star size={14} /> Feature this player
            </label>

            {msg && (
              <div className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${
                msg.type === 'ok'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-red-200 bg-red-50 text-red-700'
              }`}>
                {msg.type === 'ok' ? <CheckCircle2 size={15} className="mt-0.5" /> : <AlertCircle size={15} className="mt-0.5" />}
                {msg.text}
              </div>
            )}

            <button onClick={save} disabled={saving} className="btn-primary mt-5">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {form.id ? 'Save changes' : 'Add player'}
            </button>
          </>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-[19px] font-bold text-navy">
          On the site ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No players yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="chip bg-navy text-maize">{leagueLabel(p.league)}</span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold text-navy">{p.name}</p>
                  <p className="text-[12px] text-slate-400">
                    {[p.position, p.pro_team].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => edit(p)} className="btn-ghost btn-sm" title="Edit">
                    <PenLine size={14} />
                  </button>
                  <button onClick={() => remove(p.id)} className="btn-ghost btn-sm text-red-600" title="Remove">
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
