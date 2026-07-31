'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Send it somewhere we can actually read it.
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : null,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="container-page max-w-lg py-20">
      <div className="card p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-500" />
        <h1 className="font-display text-[22px] font-bold text-navy">Something broke</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          That page didn&rsquo;t load properly. It has been logged — try again, and if it keeps
          happening let us know.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11.5px] text-slate-400">ref: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="btn-primary btn-sm">
            <RotateCcw size={14} /> Try again
          </button>
          <Link href="/" className="btn-ghost btn-sm">Home</Link>
        </div>
      </div>
    </div>
  );
}
