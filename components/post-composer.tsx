'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/editor';
import TeamBadge from '@/components/team-badge';
import { savePost } from '@/app/actions/posts';
import { createClient } from '@/lib/supabase/client';
import { TEAMS } from '@/lib/constants';
import { excerptFrom, readingMinutes } from '@/lib/utils';
import type { Post, Team } from '@/lib/database.types';
import {
  Save, Send, Eye, EyeOff, ImageIcon, Loader2, CheckCircle2, AlertCircle, Upload, CalendarClock,
} from 'lucide-react';

export default function PostComposer({
  post,
  isAdmin,
}: { post?: Post | null; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? '');
  const [team, setTeam] = useState<Team>(post?.team ?? 'football');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [cover, setCover] = useState(post?.cover_image_url ?? '');
  const [html, setHtml] = useState(post?.content_html ?? '');
  const [json, setJson] = useState<unknown>(post?.content_json ?? null);
  const [preview, setPreview] = useState(false);
  // datetime-local wants "YYYY-MM-DDTHH:mm" in the browser's own timezone.
  const [publishAt, setPublishAt] = useState(() => {
    const at = post?.published_at ? new Date(post.published_at) : null;
    if (!at || Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) return '';
    const local = new Date(at.getTime() - at.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Autosave state. postId is tracked locally so the first autosave inserts and
  // every one after that updates the same row.
  const [postId, setPostId] = useState<string | undefined>(post?.id);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [autosaving, setAutosaving] = useState(false);
  const dirty = useRef(false);
  const inFlight = useRef(false);

  async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('post-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      setMsg({ type: 'err', text: `Upload failed: ${error.message}` });
      return null;
    }
    const { data } = supabase.storage.from('post-images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function onCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);
    if (url) setCover(url);
  }

  function submit(intent: 'draft' | 'submit') {
    setMsg(null);
    startTransition(async () => {
      const res = await savePost({
        id: postId,
        title,
        team,
        excerpt,
        coverImageUrl: cover,
        contentHtml: html,
        // Sent as a string on purpose. Rich-text JSON can contain objects with
        // no prototype, which Server Actions refuse to serialize.
        contentJson: json ? JSON.stringify(json) : null,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        intent,
      });

      if (!res.ok) {
        setMsg({ type: 'err', text: res.message ?? 'Something went wrong.' });
        return;
      }
      setMsg({ type: 'ok', text: res.message ?? 'Saved.' });
      dirty.current = false;
      setSavedAt(new Date());
      if (!postId && res.id) setPostId(res.id);
      if (intent === 'submit' && isAdmin && res.slug) {
        router.push(`/blog/${res.slug}`);
      } else {
        router.refresh();
        if (!postId && res.id) router.replace(`/write?id=${res.id}`);
      }
    });
  }

  /*
   * Autosave, deliberately limited to drafts.
   *
   * Saving with intent 'draft' sets status = 'draft', so running this against a
   * published or in-review post would silently unpublish it. Anything already
   * submitted is left alone and saved only when the writer clicks.
   */
  const autosaveAllowed = !post || post.status === 'draft';

  useEffect(() => {
    dirty.current = true;
  }, [title, team, excerpt, cover, html, publishAt]);

  const autosave = useCallback(async () => {
    if (!autosaveAllowed || inFlight.current || !dirty.current) return;
    if (title.trim().length < 4) return;
    if (html.replace(/<[^>]*>/g, '').trim().length < 40) return;

    inFlight.current = true;
    setAutosaving(true);
    try {
      const res = await savePost({
        id: postId,
        title,
        team,
        excerpt,
        coverImageUrl: cover,
        contentHtml: html,
        contentJson: json ? JSON.stringify(json) : null,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        intent: 'draft',
      });
      if (res.ok) {
        dirty.current = false;
        setSavedAt(new Date());
        if (!postId && res.id) setPostId(res.id);
      }
    } finally {
      inFlight.current = false;
      setAutosaving(false);
    }
  }, [autosaveAllowed, postId, title, team, excerpt, cover, html, json, publishAt]);

  useEffect(() => {
    if (!autosaveAllowed) return;
    const timer = setInterval(autosave, 20000);
    return () => clearInterval(timer);
  }, [autosave, autosaveAllowed]);

  // Best-effort save when the tab is hidden or closed.
  useEffect(() => {
    if (!autosaveAllowed) return;
    const onHide = () => { if (document.visibilityState === 'hidden') autosave(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [autosave, autosaveAllowed]);

  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* ---- main column ---- */}
      <div className="min-w-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline: what is the story?"
          className="w-full resize-none border-0 bg-transparent font-display text-[34px] font-bold leading-tight tracking-tight text-navy outline-none placeholder:text-slate-300 sm:text-[42px]"
        />

        <div className="mb-6 mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
          <TeamBadge team={team} />
          <span>·</span>
          <span>{words} words</span>
          <span>·</span>
          <span>{readingMinutes(html)} min read</span>
          {autosaveAllowed && (savedAt || autosaving) && (
            <>
              <span>·</span>
              <span className={autosaving ? 'text-slate-400' : 'text-emerald-600'}>
                {autosaving
                  ? 'Saving…'
                  : `Saved ${savedAt!.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
              </span>
            </>
          )}
          <button
            onClick={() => setPreview((v) => !v)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-navy-500 transition hover:bg-slate-100"
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Back to editing' : 'Preview'}
          </button>
        </div>

        {preview && (
          <article className="card px-6 py-8 sm:px-10">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="mb-7 w-full rounded-xl object-cover" />
            )}
            <h1 className="font-display text-[32px] font-bold leading-tight text-navy">
              {title || 'Untitled post'}
            </h1>
            <div
              className="prose-mich mt-6"
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400">Nothing written yet.</p>' }}
            />
          </article>
        )}

        {/*
          The editor stays mounted while previewing and is only hidden. Swapping
          it out destroys the Tiptap instance, and remounting it restored the
          last *saved* content — so everything written since the last save was
          lost on the way back from preview. Hiding it also preserves undo
          history and the cursor position.
        */}
        <div className={preview ? 'hidden' : ''}>
          <RichEditor
            initialHtml={post?.content_html ?? ''}
            onChange={(v) => { setHtml(v.html); setJson(v.json); }}
            onUploadImage={uploadImage}
          />
        </div>
      </div>

      {/* ---- sidebar ---- */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {msg && (
          <div
            className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
              msg.type === 'ok'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {msg.type === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="card p-5">
          <h3 className="mb-4 font-display text-[15px] font-bold text-navy">Post settings</h3>

          <label className="label">Sport / section</label>
          <select value={team} onChange={(e) => setTeam(e.target.value as Team)} className="input">
            {TEAMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className="label mt-4">Cover image</label>
          {cover ? (
            <div className="relative overflow-hidden rounded-xl border border-[var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
              <button
                onClick={() => setCover('')}
                className="absolute right-2 top-2 rounded-lg bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-black/85"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] bg-slate-50/60 px-4 py-7 text-center transition hover:border-maize hover:bg-maize-50/40">
              {uploading ? <Loader2 size={20} className="animate-spin text-navy" /> : <Upload size={20} className="text-slate-400" />}
              <span className="text-[13px] font-semibold text-navy-700">
                {uploading ? 'Uploading…' : 'Upload an image'}
              </span>
              <span className="text-[11.5px] text-slate-400">JPG, PNG or WebP</span>
              <input type="file" accept="image/*" className="hidden" onChange={onCoverPick} />
            </label>
          )}
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="…or paste an image URL"
            className="input mt-2 text-[13px]"
          />

          <label className="label mt-4">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="A one-sentence tease for the card and preview."
            className="input resize-none text-[14px]"
          />
          <button
            type="button"
            onClick={() => setExcerpt(excerptFrom(html))}
            className="mt-1.5 text-[12px] font-semibold text-navy-500 hover:underline"
          >
            Generate from post
          </button>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-1.5 font-display text-[15px] font-bold text-navy">
            <CalendarClock size={15} /> Publish time
          </h3>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="input text-[14px]"
          />
          {publishAt ? (
            <div className="mt-2 flex items-start justify-between gap-2">
              <p className="text-[12px] leading-relaxed text-navy-700">
                {isAdmin
                  ? 'Goes live at this time instead of immediately.'
                  : 'Requested time. It goes live then, once an editor approves it.'}
              </p>
              <button
                onClick={() => setPublishAt('')}
                className="shrink-0 text-[12px] font-semibold text-slate-400 hover:text-navy"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-slate-400">
              Leave empty to publish as soon as it&rsquo;s approved.
            </p>
          )}
        </div>

        <div className="card space-y-2.5 p-5">
          <button onClick={() => submit('submit')} disabled={pending} className="btn-primary w-full py-3">
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {publishAt ? (isAdmin ? 'Schedule' : 'Submit & schedule') : isAdmin ? 'Publish now' : 'Submit for review'}
          </button>
          <button onClick={() => submit('draft')} disabled={pending} className="btn-ghost w-full">
            <Save size={15} /> Save draft
          </button>
          <p className="pt-1 text-center text-[12px] leading-relaxed text-slate-400">
            {isAdmin
              ? 'You are an editor — posts go live immediately.'
              : 'An editor reviews submissions before they go live.'}
          </p>
        </div>

        <div className="card bg-maize-50/60 p-5">
          <h4 className="flex items-center gap-1.5 font-display text-[14px] font-bold text-navy">
            <ImageIcon size={14} /> Style notes
          </h4>
          <ul className="mt-2.5 space-y-1.5 text-[12.5px] leading-relaxed text-navy-700">
            <li>• Lead with the takeaway, not the recap.</li>
            <li>• Break sections with H2s so it scans on mobile.</li>
            <li>• Pull quotes work better than long block quotes.</li>
            <li>• Name your sources when you can.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
