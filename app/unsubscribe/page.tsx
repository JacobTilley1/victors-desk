import Link from 'next/link';
import { unsubscribeByToken } from '@/app/actions/subscribe';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  const result = token ? await unsubscribeByToken(token) : null;
  const done = result?.ok && result.found;

  return (
    <div className="container-page max-w-lg py-20">
      <div className="card p-8 text-center">
        {done ? (
          <>
            <CheckCircle2 className="mx-auto mb-3 text-emerald-500" />
            <h1 className="font-display text-[22px] font-bold text-navy">You&rsquo;re unsubscribed</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
              You won&rsquo;t get any more emails from us. The site is still here whenever
              you want it.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto mb-3 text-amber-500" />
            <h1 className="font-display text-[22px] font-bold text-navy">
              We couldn&rsquo;t find that subscription
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
              The link may be out of date, or you may already have unsubscribed. If you keep
              receiving emails, reply to one and we&rsquo;ll sort it out.
            </p>
          </>
        )}
        <Link href="/" className="btn-ghost btn-sm mt-6">Back to the site</Link>
      </div>
    </div>
  );
}
