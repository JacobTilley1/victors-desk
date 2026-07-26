'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createThread } from '@/app/actions/forum';
import { Loader2, Plus, X } from 'lucide-react';

export default function NewThreadForm({
  categoryId,
  categorySlug,
}: { categoryId: string; categorySlug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const res = await createThread({ categoryId, categorySlug, title, body });
      if (res.ok && res.id) {
        setTitle(''); setBody(''); setOpen(false);
        router.push(`/forum/thread/${res.id}`);
      } else {
        setErr(res.message ?? 'Could not create the thread.');
      }
    });
  }

  if (!open) {
    return (
      <button id="new" onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={15} /> New thread
      </button>
    );
  }

  return (
    <div id="new" className="card animate-fade-up w-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[17px] font-bold text-navy">Start a thread</h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 transition hover:text-navy">
          <X size={18} />
        </button>
      </div>

      <label className="label">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What is this about?"
        className="input"
        maxLength={200}
      />

      <label className="label mt-4">Your post</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        placeholder="Make your case. Sources and stats go a long way."
        className="input resize-y"
      />

      {err && <p className="mt-2 text-[13px] font-medium text-red-600">{err}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
        <button onClick={submit} disabled={pending || !title.trim() || !body.trim()} className="btn-primary">
          {pending && <Loader2 size={14} className="animate-spin" />} Post thread
        </button>
      </div>
    </div>
  );
}
