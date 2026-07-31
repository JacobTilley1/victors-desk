'use client';

import { useEffect } from 'react';

/**
 * Last line of defence — catches failures in the root layout itself, where the
 * normal error boundary can't run. Must render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : null,
        fatal: true,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#00274D', color: '#fff', margin: 0 }}>
        <div style={{ maxWidth: 460, margin: '18vh auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#FFCB05' }}>M</div>
          <h1 style={{ fontSize: 22, marginTop: 12 }}>The Victors&rsquo; Desk is having a moment</h1>
          <p style={{ opacity: 0.75, lineHeight: 1.6, marginTop: 8 }}>
            Something went badly wrong loading the site. It has been logged.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20, padding: '10px 18px', borderRadius: 10, border: 0,
              background: '#FFCB05', color: '#00274D', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
