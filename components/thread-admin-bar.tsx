'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setThreadFlags, moderateContent } from '@/app/actions/admin';
import { Lock, LockOpen, Pin, PinOff, EyeOff, Trash2, Loader2, Shield } from 'lucide-react';

export default function ThreadAdminBar({
  threadId,
  pinned,
  locked,
  hidden,
}: { threadId: string; pinned: boolean; locked: boolean; hidden: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/15 bg-navy/[0.04] px-4 py-3">
      <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy">
        <Shield size={13} /> Moderator
      </span>

      <button
        onClick={() => run(() => setThreadFlags({ threadId, pinned: !pinned }))}
        className="btn-ghost btn-sm"
      >
        {pinned ? <PinOff size={13} /> : <Pin size={13} />} {pinned ? 'Unpin' : 'Pin'}
      </button>

      <button
        onClick={() => run(() => setThreadFlags({ threadId, locked: !locked }))}
        className="btn-ghost btn-sm"
      >
        {locked ? <LockOpen size={13} /> : <Lock size={13} />} {locked ? 'Unlock' : 'Lock'}
      </button>

      <button
        onClick={() => run(() => moderateContent({ targetType: 'thread', targetId: threadId, action: hidden ? 'unhide' : 'hide' }))}
        className="btn-ghost btn-sm"
      >
        <EyeOff size={13} /> {hidden ? 'Unhide' : 'Hide'}
      </button>

      <button
        onClick={() => {
          if (!confirm('Delete this thread and all replies?')) return;
          start(async () => {
            await moderateContent({ targetType: 'thread', targetId: threadId, action: 'delete' });
            router.push('/forum');
          });
        }}
        className="btn btn-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      >
        <Trash2 size={13} /> Delete
      </button>

      {pending && <Loader2 size={14} className="animate-spin text-navy" />}
    </div>
  );
}
