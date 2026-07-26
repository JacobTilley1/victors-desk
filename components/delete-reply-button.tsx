'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteReply } from '@/app/actions/forum';
import { Loader2, Trash2 } from 'lucide-react';

export default function DeleteReplyButton({ id, threadId }: { id: string; threadId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          if (!confirm('Delete this reply?')) return;
          await deleteReply(id, threadId);
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-400 transition hover:text-red-600"
    >
      {pending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
    </button>
  );
}
