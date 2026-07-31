'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X, ImageOff } from 'lucide-react';

export interface PickedPhoto {
  full: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
}

interface Photo extends PickedPhoto {
  id: number;
  thumb: string;
}

/**
 * Search free-to-use photography without leaving the editor.
 *
 * Every result carries its photographer so a credit line can be inserted with
 * the image — the safe habit, given how easily a wire-service photo pulled from
 * an image search turns into an invoice.
 */
export default function ImagePicker({
  open,
  onClose,
  onPick,
  initialQuery = '',
}: {
  open: boolean;
  onClose: () => void;
  onPick: (photo: PickedPhoto) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.error === 'not-configured') {
        setMessage('Photo search is not set up yet — add PEXELS_API_KEY in Vercel.');
        setPhotos([]);
      } else if (json.error) {
        setMessage('Search failed. Try again in a moment.');
        setPhotos([]);
      } else {
        setPhotos(json.photos ?? []);
      }
    } catch {
      setMessage('Search failed. Try again in a moment.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-fade-up relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <form onSubmit={search} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search free photos — stadium, football, crowd…"
                className="input pl-10"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-navy shrink-0">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
            </button>
          </form>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-navy">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto p-5">
          {message && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {message}
            </p>
          )}

          {!message && !searched && (
            <div className="py-16 text-center text-slate-400">
              <Search size={26} className="mx-auto mb-3" />
              <p className="text-sm">Search for a photo to get started.</p>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed">
                These are free to use commercially. You won&rsquo;t find game action here —
                stock libraries can&rsquo;t licence college football — but stadiums, crowds
                and atmosphere shots work well for opinion pieces.
              </p>
            </div>
          )}

          {!message && searched && photos.length === 0 && !loading && (
            <div className="py-16 text-center text-slate-400">
              <ImageOff size={26} className="mx-auto mb-3" />
              <p className="text-sm">Nothing found for &ldquo;{query}&rdquo;. Try a broader word.</p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onPick(p); onClose(); }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--line)] transition hover:border-maize hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt={p.alt} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2.5 pb-1.5 pt-6 text-left text-[10.5px] font-medium text-white">
                    {p.photographer}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--line)] bg-slate-50 px-5 py-3">
          <p className="text-[11.5px] text-slate-500">
            Photos from Pexels, free for commercial use. A credit line is added under each
            image automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
