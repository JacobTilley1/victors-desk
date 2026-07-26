'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Avatar from '@/components/avatar';
import ReportButton from '@/components/report-button';
import { addComment, deleteComment } from '@/app/actions/comments';
import { relative } from '@/lib/utils';
import { MessageSquare, Loader2, Trash2, CornerDownRight, ShieldCheck } from 'lucide-react';
import type { CommentWithAuthor, Profile } from '@/lib/database.types';

interface Node extends CommentWithAuthor { children: Node[] }

export default function Comments({
  postId,
  slug,
  comments,
  viewer,
}: {
  postId: string;
  slug: string;
  comments: CommentWithAuthor[];
  viewer: Profile | null;
}) {
  const tree = useMemo(() => buildTree(comments), [comments]);

  return (
    <section id="comments" className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-2.5">
        <MessageSquare size={19} className="text-maize-600" />
        <h2 className="font-display text-[22px] font-bold text-navy">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </h2>
      </div>

      {viewer ? (
        viewer.is_banned ? (
          <p className="card p-5 text-sm text-red-700">
            Your account is suspended, so you cannot comment right now.
          </p>
        ) : (
          <CommentForm postId={postId} slug={slug} viewer={viewer} />
        )
      ) : (
        <div className="card flex flex-col items-center gap-3 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-[16px] font-bold text-navy">Join the conversation</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Sign in with Google to comment — it takes one tap.
            </p>
          </div>
          <Link href={`/login?next=/blog/${slug}`} className="btn-navy btn-sm shrink-0">Sign in</Link>
        </div>
      )}

      <div className="mt-9 space-y-7">
        {tree.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No comments yet. Be the first to say something worth reading.
          </p>
        ) : (
          tree.map((n) => (
            <CommentNode key={n.id} node={n} postId={postId} slug={slug} viewer={viewer} depth={0} />
          ))
        )}
      </div>
    </section>
  );
}

function buildTree(list: CommentWithAuthor[]): Node[] {
  const map = new Map<string, Node>();
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: Node[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CommentNode({
  node, postId, slug, viewer, depth,
}: { node: Node; postId: string; slug: string; viewer: Profile | null; depth: number }) {
  const [replying, setReplying] = useState(false);
  const [pending, start] = useTransition();
  const canDelete = viewer && (viewer.id === node.author_id || viewer.role === 'admin');

  return (
    <div className={depth > 0 ? 'border-l-2 border-maize/35 pl-4 sm:pl-5' : ''}>
      <div className="flex gap-3">
        <Avatar name={node.author?.display_name ?? 'Member'} url={node.author?.avatar_url} size={36} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-bold text-navy">
              {node.author?.display_name ?? 'Member'}
            </span>
            {node.author?.role === 'admin' && (
              <span className="chip bg-navy px-2 py-0.5 text-[10px] text-maize">
                <ShieldCheck size={10} /> Editor
              </span>
            )}
            {node.author?.role === 'author' && (
              <span className="chip bg-maize-100 px-2 py-0.5 text-[10px] text-navy-700">Writer</span>
            )}
            <span className="text-[12px] text-slate-400">{relative(node.created_at)}</span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
            {node.body}
          </p>

          <div className="mt-2 flex items-center gap-4">
            {viewer && !viewer.is_banned && depth < 3 && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy-500 transition hover:text-navy"
              >
                <CornerDownRight size={12} /> Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={() =>
                  start(async () => {
                    if (confirm('Delete this comment?')) await deleteComment(node.id, slug);
                  })
                }
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-400 transition hover:text-red-600"
              >
                {pending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
              </button>
            )}
            {viewer && viewer.id !== node.author_id && (
              <ReportButton targetType="comment" targetId={node.id} />
            )}
          </div>

          {replying && viewer && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                slug={slug}
                viewer={viewer}
                parentId={node.id}
                compact
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="mt-5 space-y-5">
          {node.children.map((child) => (
            <CommentNode key={child.id} node={child} postId={postId} slug={slug} viewer={viewer} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  postId, slug, viewer, parentId, compact, onDone,
}: {
  postId: string;
  slug: string;
  viewer: Profile;
  parentId?: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const [body, setBody] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!body.trim()) return;
    setErr(null);
    start(async () => {
      const res = await addComment({ postId, slug, body, parentId });
      if (res.ok) {
        setBody('');
        onDone?.();
      } else {
        setErr(res.message ?? 'Could not post that.');
      }
    });
  }

  return (
    <div className={compact ? '' : 'card p-5'}>
      <div className="flex gap-3">
        {!compact && <Avatar name={viewer.display_name} url={viewer.avatar_url} size={36} />}
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={compact ? 2 : 3}
            placeholder={parentId ? 'Write a reply…' : 'Add to the conversation…'}
            className="input resize-none"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
            }}
          />
          {err && <p className="mt-1.5 text-[12.5px] font-medium text-red-600">{err}</p>}
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11.5px] text-slate-400">⌘/Ctrl + Enter to post</span>
            <div className="flex gap-2">
              {onDone && (
                <button onClick={onDone} className="btn-ghost btn-sm">Cancel</button>
              )}
              <button onClick={submit} disabled={pending || !body.trim()} className="btn-primary btn-sm">
                {pending && <Loader2 size={13} className="animate-spin" />}
                {parentId ? 'Reply' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
