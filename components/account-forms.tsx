'use client';

import { useState, useTransition } from 'react';
import { updateProfile, applyToWrite } from '@/app/actions/account';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/avatar';
import {
  CheckCircle2, AlertCircle, Loader2, Send, Upload, Trash2, RotateCcw,
} from 'lucide-react';
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

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pending, start] = useTransition();

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-picked later
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'err', text: 'Pick an image file.' });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setMsg({ type: 'err', text: 'That image is over 3 MB — try a smaller one.' });
      return;
    }

    setMsg(null);
    setUploading(true);

    const supabase = createClient();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    // Must live in a folder named after the user id — the storage policy requires it.
    const path = `${profile.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      // A year — the filename carries a timestamp, so each upload is a new URL.
      .upload(path, file, { cacheControl: '31536000', upsert: true });

    if (error) {
      setUploading(false);
      setMsg({ type: 'err', text: `Upload failed: ${error.message}` });
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    setMsg({ type: 'ok', text: 'Picture ready — hit Save changes to apply it.' });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateProfile({ displayName, bio, avatarUrl });
      setMsg({ type: res.ok ? 'ok' : 'err', text: res.message ?? (res.ok ? 'Saved.' : 'Failed.') });
    });
  }

  const usingGoogle =
    !!avatarUrl && !!profile.google_avatar_url && avatarUrl === profile.google_avatar_url;

  return (
    <div className="card p-6">
      <h2 className="font-display text-[18px] font-bold text-navy">Your profile</h2>
      <p className="mt-1 text-[13.5px] text-slate-500">
        This is what other members see on your comments, threads and bylines.
      </p>

      <label className="label mt-5">Profile picture</label>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative">
          <Avatar name={displayName || 'Member'} url={avatarUrl} size={84} ring />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/60">
              <Loader2 size={22} className="animate-spin text-maize" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="btn-ghost btn-sm cursor-pointer">
            <Upload size={14} /> {avatarUrl ? 'Change picture' : 'Upload picture'}
            <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} disabled={uploading} />
          </label>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => { setAvatarUrl(null); setMsg(null); }}
              className="btn-ghost btn-sm"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}

          {profile.google_avatar_url && !usingGoogle && (
            <button
              type="button"
              onClick={() => { setAvatarUrl(profile.google_avatar_url); setMsg(null); }}
              className="btn-ghost btn-sm"
            >
              <RotateCcw size={14} /> Use Google photo
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-slate-400">
        Square images look best. Up to 3 MB. With no picture you get your initials on navy.
      </p>

      <label className="label mt-5">Display name</label>
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" maxLength={60} />
      <p className="mt-1 text-[12px] text-slate-400">
        Yours to choose — it will not be reset by Google when you sign in again.
      </p>

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
