'use client';

import { useState, useTransition } from 'react';
import { updateProfile, applyToWrite } from '@/app/actions/account';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import type { Profile } from '@/lib/database.types';

function Note({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium ${
        msg.type === 'ok'
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {msg.type === 'ok' ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
      {msg.text}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateProfile({ displayName, bio });
      setMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? (res.ok ? 'Saved.' : 'Failed.') });
    });
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-[18px] font-bold text-navy">Your profile</h2>
      <p className="mt-1 text-[13.5px] text-slate-500">
        This is what other members see on your comments, threads and bylines.
      </p>

      <label className="label mt-5">Display name</label>
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" maxLength={60} />

      <label className="label mt-4">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        maxLength={280}
        placeholder="Season ticket holder since 2009. I mostly watch the offensive line."
        className="input resize-none"
      />
      <p className="mt-1 text-right text-[11.5px] text-slate-400">{bio.length}/280</p>

      <Note msg={msg} />

      <button onClick={save} disabled={pending} className="btn-primary mt-4">
        {pending && <Loader2 size={14} className="animate-spin" />} Save changes
      </button>
    </div>
  );
}

export function AuthorApplication({ profile }: { profile: Profile }) {
  const [pitch, setPitch] = useState(profile.author_pitch ?? '');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  const status = profile.author_status;

  if (status === 'approved') {
    return (
      <div className="card border-emerald-200 bg-emerald-50/70 p-6">
        <h2 className="font-display text-[18px] font-bold text-emerald-900">You are an approved writer</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-emerald-800">
          Head to the editor and publish. Submissions still pass through an editor before going live
          unless you are an admin.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[18px] font-bold text-navy">Write for the Desk</h2>
        {status === 'pending' && (
          <span className="chip bg-amber-100 text-amber-800">In review</span>
        )}
        {status === 'rejected' && (
          <span className="chip bg-red-100 text-red-700">Not approved</span>
        )}
      </div>

      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
        Tell us what you would cover and why you are worth reading. Links to previous
        writing help a lot.
      </p>

      <textarea
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        rows={6}
        disabled={status === 'pending'}
        placeholder="I want to write weekly offensive line film breakdowns. I have been charting Michigan's run game since 2021 and post threads at…"
        className="input mt-4 resize-y disabled:bg-slate-50 disabled:text-slate-500"
      />

      <Note msg={msg} />

      {status !== 'pending' && (
        <button
          onClick={() => {
            setMsg(null);
            start(async () => {
              const res = await applyToWrite(pitch);
              setMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? 'Failed.' });
            });
          }}
          disabled={pending}
          className="btn-navy mt-4"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {status === 'rejected' ? 'Apply again' : 'Submit application'}
        </button>
      )}
    </div>
  );
}
