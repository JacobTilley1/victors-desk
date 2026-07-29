'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  reviewPost, reviewAuthor, resolveReport, moderateContent,
  setUserBanned, unpublishPost, setWriterRole,
} from '@/app/actions/admin';
import { Check, X, Loader2, EyeOff, Trash2, Ban, Undo2, ShieldCheck, PenLine } from 'lucide-react';

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    start(async () => { await fn(); router.refresh(); });
  return { pending, run };
}

export function PostReviewControls({ id }: { id: string }) {
  const { pending, run } = useAction();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  if (rejecting) {
    return (
      <div className="w-full rounded-xl border border-[var(--line)] bg-slate-50 p-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="What does the writer need to fix?"
          className="input text-[13.5px]"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button onClick={() => setRejecting(false)} className="btn-ghost btn-sm">Cancel</button>
          <button
            onClick={() => run(() => reviewPost({ id, decision: 'reject', note }))}
            disabled={pending}
            className="btn btn-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          >
            {pending && <Loader2 size={13} className="animate-spin" />} Send back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={() => run(() => reviewPost({ id, decision: 'approve' }))}
        disabled={pending}
        className="btn-primary btn-sm"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Publish
      </button>
      <button onClick={() => setRejecting(true)} className="btn-ghost btn-sm">
        <X size={14} /> Send back
      </button>
    </div>
  );
}

export function UnpublishButton({ id }: { id: string }) {
  const { pending, run } = useAction();
  return (
    <button
      onClick={() => run(() => unpublishPost(id))}
      disabled={pending}
      className="btn-ghost btn-sm"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Undo2 size={13} />} Unpublish
    </button>
  );
}

export function AuthorReviewControls({ userId }: { userId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={() => run(() => reviewAuthor({ userId, decision: 'approve' }))}
        disabled={pending}
        className="btn-primary btn-sm"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />} Approve
      </button>
      <button
        onClick={() => run(() => reviewAuthor({ userId, decision: 'reject' }))}
        disabled={pending}
        className="btn-ghost btn-sm"
      >
        <X size={14} /> Decline
      </button>
    </div>
  );
}

export function ReportControls({
  reportId, targetType, targetId,
}: { reportId: string; targetType: 'comment' | 'thread' | 'reply'; targetId: string }) {
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => run(async () => {
          await moderateContent({ targetType, targetId, action: 'hide' });
          await resolveReport({ id: reportId, status: 'resolved' });
        })}
        disabled={pending}
        className="btn-ghost btn-sm"
      >
        <EyeOff size={13} /> Hide content
      </button>
      <button
        onClick={() => run(async () => {
          if (!confirm('Delete this content permanently?')) return;
          await moderateContent({ targetType, targetId, action: 'delete' });
          await resolveReport({ id: reportId, status: 'resolved' });
        })}
        disabled={pending}
        className="btn btn-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      >
        <Trash2 size={13} /> Delete
      </button>
      <button
        onClick={() => run(() => resolveReport({ id: reportId, status: 'dismissed' }))}
        disabled={pending}
        className="btn-ghost btn-sm"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Dismiss
      </button>
    </div>
  );
}

export function WriterToggle({
  userId, isWriter,
}: { userId: string; isWriter: boolean }) {
  const { pending, run } = useAction();
  return (
    <button
      onClick={() => run(() => setWriterRole({ userId, isWriter: !isWriter }))}
      disabled={pending}
      className={`btn btn-sm ${
        isWriter
          ? 'border border-[var(--line)] bg-white text-slate-500 hover:border-navy/30 hover:text-navy'
          : 'border border-maize bg-maize-50 text-navy-700 hover:bg-maize-100'
      }`}
      title={isWriter ? 'Remove publishing access' : 'Grant publishing access'}
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <PenLine size={13} />}
      {isWriter ? 'Remove writer' : 'Make writer'}
    </button>
  );
}

export function BanToggle({ userId, banned }: { userId: string; banned: boolean }) {
  const { pending, run } = useAction();
  return (
    <button
      onClick={() => run(() => setUserBanned({ userId, banned: !banned }))}
      disabled={pending}
      className={`btn btn-sm ${
        banned
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border border-[var(--line)] bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
      }`}
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
      {banned ? 'Unsuspend' : 'Suspend'}
    </button>
  );
}
