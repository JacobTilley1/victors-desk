import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getHistoryPage } from '@/lib/history';
import { getProfile, isAdmin } from '@/lib/auth';
import HistoryEditor from '@/components/history-editor';
import { ArrowLeft, Eye } from 'lucide-react';

export const metadata = { title: 'Edit history page', robots: { index: false } };

export default async function EditHistoryPage({
  params,
}: { params: { slug: string } }) {
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=/history/${params.slug}/edit`);
  if (!isAdmin(profile)) redirect(`/history/${params.slug}`);

  const data = await getHistoryPage(params.slug);
  if (!data) notFound();

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/history/${params.slug}`}
            className="mb-2 flex w-fit items-center gap-1.5 text-[13px] font-semibold text-navy-500 transition hover:text-navy"
          >
            <ArrowLeft size={14} /> Back to the page
          </Link>
          <h1 className="font-display text-[28px] font-bold text-navy">
            Editing: {data.page.title}
          </h1>
        </div>
        <Link href={`/history/${params.slug}`} className="btn-ghost btn-sm">
          <Eye size={14} /> View live
        </Link>
      </div>

      <HistoryEditor page={data.page} entries={data.entries} />
    </div>
  );
}
