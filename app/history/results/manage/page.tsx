import { redirect } from 'next/navigation';
import Link from 'next/link';
import ResultEditor from '@/components/result-editor';
import { getGames } from '@/lib/results';
import { getProfile, isAdmin } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Log games',
  robots: { index: false, follow: false },
};

export default async function ManageResultsPage() {
  const profile = await getProfile();
  if (!isAdmin(profile)) redirect('/history/results');

  const games = await getGames();

  return (
    <div className="container-page max-w-4xl py-10">
      <Link
        href="/history/results"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-500 hover:underline"
      >
        <ArrowLeft size={13} /> Back to the record
      </Link>
      <h1 className="mt-3 font-display text-[30px] font-bold text-navy">Log games</h1>
      <p className="mt-1.5 text-[14px] text-slate-500">
        Every game gets its own page, and the series pages build themselves from the
        opponent name.
      </p>

      <div className="mt-8">
        <ResultEditor games={games} />
      </div>
    </div>
  );
}
