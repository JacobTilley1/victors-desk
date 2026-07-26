'use client';

import { useState, useTransition } from 'react';
import { addReply } from '@/app/actions/forum';
import Avatar from '@/components/avatar';
import { Loader2 } from 'lucide-react';
import type { Profile } from '@/lib/database.types';

export default function ReplyForm({ threadId, viewer }: { threadId: string; viewer: Profile }) {
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!body.trim()) return;
    setErr(null);
    start(async () => {
      const res = await addReply({ threadId, body });
      if (res.ok) setBody('');
      else setErr(res.message ?? 'Could not post that.');
    });
  }

  return (
    <div className="card p-5">
      <div className="flex gap-3">
        <Avatar name={viewer.display_name} url={viewer.avatar_url} size={38} />
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Add your reply…"
            className="input resize-y"
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}
          />
          {err && <p className="mt-1.5 text-[13px] font-medium text-red-600">{err}</p>}
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[11.5px] text-slate-400">⌘/Ctrl + Enter to post</span>
            <button onClick={submit} disabled={pending || !body.trim()} className="btn-primary btn-sm">
              {pending && <Loader2 size={13} className="animate-spin" />} Post reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
