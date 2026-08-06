import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProEditor from '@/components/pro-editor';
import { getProPlayers, getProSettings } from '@/lib/pro';
import { getProfile, isAdmin } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Manage Pro Blue',
  robots: { index: false, follow: false },
};

export default async function ManageProPage() {
  const profile = await getProfile();
  if (!isAdmin(profile)) redirect('/pro');

  const [players, settings] = await Promise.all([getProPlayers(), getProSettings()]);

  return (
    <div className="container-page max-w-4xl py-10">
      <Link href="/pro" className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-500 hover:underline">
        <ArrowLeft size={13} /> Back to Pro Blue
      </Link>
      <h1 className="mt-3 font-display text-[30px] font-bold text-navy">Manage Pro Blue</h1>
      <p className="mt-1.5 text-[14px] text-slate-500">
        Every player gets their own page at /pro/&lt;name&gt;.
      </p>

      <div className="mt-8">
        <ProEditor players={players} settings={settings} />
      </div>
    </div>
  );
}
