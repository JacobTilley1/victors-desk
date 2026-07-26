'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePost } from '@/app/actions/posts';
import { Loader2, Trash2 } from 'lucide-react';

export default function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          if (!confirm('Delete this post permanently?')) return;
          await deletePost(id);
          router.refresh();
        })
      }
      className="btn btn-sm border border-[var(--line)] bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}
