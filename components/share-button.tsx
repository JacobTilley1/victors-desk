'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button onClick={share} className="btn-ghost btn-sm">
      {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}
