'use client';

import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

function XMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function RedditMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.605a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-6.993 4.87-3.86 0-6.99-2.176-6.99-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
    </svg>
  );
}

/**
 * Real share targets rather than a copy-link button.
 *
 * X and Reddit are where this site's traffic actually comes from, so they get
 * dedicated buttons. The native share sheet stays available on mobile, where
 * people expect it.
 */
export default function ShareButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const href = () => url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const open = (target: string) =>
    window.open(target, '_blank', 'noopener,noreferrer,width=600,height=520');

  async function copy() {
    await navigator.clipboard.writeText(href());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: href() });
        return;
      } catch { /* cancelled */ }
    }
    await copy();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={() =>
          open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(href())}`)
        }
        className="btn btn-sm border border-[var(--line)] bg-white text-navy-700 transition hover:border-navy hover:bg-navy hover:text-white"
        title="Share on X"
      >
        <XMark /> Post
      </button>

      <button
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href())}`)}
        className="btn btn-sm border border-[var(--line)] bg-white text-navy-700 transition hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
        title="Share on Facebook"
      >
        <FacebookMark /> Share
      </button>

      <button
        onClick={() =>
          open(`https://www.reddit.com/submit?url=${encodeURIComponent(href())}&title=${encodeURIComponent(title)}`)
        }
        className="btn btn-sm border border-[var(--line)] bg-white text-navy-700 transition hover:border-[#FF4500] hover:bg-[#FF4500] hover:text-white"
        title="Share on Reddit"
      >
        <RedditMark /> Post
      </button>

      <button onClick={copy} className="btn-ghost btn-sm" title="Copy link">
        {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} />}
        {copied ? 'Copied' : 'Link'}
      </button>

      <button onClick={nativeShare} className="btn-ghost btn-sm sm:hidden" aria-label="More sharing options">
        <Share2 size={14} />
      </button>
    </div>
  );
}
