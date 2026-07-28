import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Avatar from '@/components/avatar';
import EmptyState from '@/components/empty-state';
import { Users, PenLine } from 'lucide-react';
import type { Profile } from '@/lib/database.types';

export const metadata = {
  title: 'Writers',
  description:
    'The writers behind The Victors\u2019 Desk \u2014 every byline approved by an editor.',
  alternates: { canonical: '/authors' },
  openGraph: {
    title: 'Writers',
    description:
      'The writers behind The Victors\u2019 Desk \u2014 every byline approved by an editor.',
    url: '/authors',
    type: 'website',
  },
};

export default async function AuthorsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['author', 'admin'])
    .eq('is_banned', false)
    .order('created_at');

  const authors = (data ?? []) as Profile[];

  const { data: postRows } = await supabase
    .from('posts').select('author_id').eq('status', 'published');

  const counts: Record<string, number> = {};
  (postRows ?? []).forEach((p: { author_id: string }) => {
    counts[p.author_id] = (counts[p.author_id] ?? 0) + 1;
  });

  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">Masthead</p>
          <h1 className="mt-2 font-display text-[34px] font-bold sm:text-[40px]">The writers</h1>
          <p className="mt-2.5 max-w-xl text-[15px] text-slate-300">
            Everyone with a byline here was approved by an editor. Want to join them?
          </p>
          <Link href="/account" className="btn-primary btn-sm mt-5">
            <PenLine size={14} /> Apply to write
          </Link>
        </div>
      </section>

      <section className="container-page py-12">
        {authors.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No writers yet"
            body="Approve a writer application from the moderation dashboard and they will appear here."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((a, i) => (
              <Link
                key={a.id}
                href={`/authors/${a.id}`}
                className="group card animate-fade-up p-6 transition-all duration-300 hover:-translate-y-1 hover:border-maize"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <div className="flex items-center gap-3.5">
                  <Avatar name={a.display_name} url={a.avatar_url} size={52} ring />
                  <div className="min-w-0">
                    <p className="truncate font-display text-[17px] font-bold text-navy">
                      {a.display_name}
                    </p>
                    <p className="text-[12.5px] font-semibold text-maize-600">
                      {a.role === 'admin' ? 'Editor' : 'Staff writer'}
                    </p>
                  </div>
                </div>
                {a.bio && (
                  <p className="mt-4 line-clamp-3 text-[13.5px] leading-relaxed text-slate-500">{a.bio}</p>
                )}
                <p className="mt-4 border-t border-[var(--line)] pt-3 text-[12px] font-semibold text-slate-400">
                  {counts[a.id] ?? 0} published {(counts[a.id] ?? 0) === 1 ? 'story' : 'stories'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
