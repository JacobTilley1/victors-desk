import { redirect } from 'next/navigation';
import Link from 'next/link';
import CoachEditor from '@/components/coach-editor';
import { getCoaches } from '@/lib/coaches';
import { getProfile, isAdmin } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Manage coaches',
  robots: { index: false, follow: false },
};

export default async function ManageCoachesPage() {
  const profile = await getProfile();
  if (!isAdmin(profile)) redirect('/history/coaches');

  const coaches = await getCoaches();

  return (
    <div className="container-page max-w-4xl py-10">
      <Link
        href="/history/coaches"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-500 hover:underline"
      >
        <ArrowLeft size={13} /> Back to coaches
      </Link>
      <h1 className="mt-3 font-display text-[30px] font-bold text-navy">Manage coaches</h1>
      <p className="mt-1.5 text-[14px] text-slate-500">
        Every coach gets their own page at /history/coaches/&lt;name&gt;.
      </p>

      <div className="mt-8">
        <CoachEditor coaches={coaches} />
      </div>
    </div>
  );
}
