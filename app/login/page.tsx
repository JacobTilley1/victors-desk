import Link from 'next/link';
import { redirect } from 'next/navigation';
import GoogleButton from '@/components/google-button';
import Logo from '@/components/logo';
import { getProfile } from '@/lib/auth';
import { MessageSquare, PenLine, Users } from 'lucide-react';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: { searchParams: { next?: string; error?: string } }) {
  const profile = await getProfile();
  if (profile) redirect(searchParams.next || '/');

  const next = searchParams.next || '/';

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-navy" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,203,5,0.22),transparent_60%)]" />
      <div className="field-grain absolute inset-0 -z-10 opacity-60" />

      <div className="container-page flex min-h-[calc(100vh-68px)] items-center justify-center py-16">
        <div className="animate-fade-up w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-white p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
            <div className="flex justify-center"><Logo size={44} /></div>

            <h1 className="mt-7 text-center font-display text-[26px] font-bold text-navy">
              Join the sideline
            </h1>
            <p className="mt-2 text-center text-[15px] leading-relaxed text-slate-500">
              One tap with Google. No password to remember, no email to verify.
            </p>

            {searchParams.error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                Something went wrong signing you in. Give it another try.
              </p>
            )}

            <div className="mt-7">
              <GoogleButton next={next} className="btn-navy w-full py-3.5 text-[15px]" />
            </div>

            <div className="mt-8 space-y-3.5 border-t border-[var(--line)] pt-6">
              <Perk icon={<MessageSquare size={15} />} text="Comment on every post" />
              <Perk icon={<Users size={15} />} text="Start threads in the community forum" />
              <Perk icon={<PenLine size={15} />} text="Apply to write for the site" />
            </div>

            <p className="mt-7 text-center text-xs leading-relaxed text-slate-400">
              By continuing you agree to keep it civil under our{' '}
              <Link href="/guidelines" className="font-semibold text-navy underline decoration-maize decoration-2 underline-offset-2">
                community rules
              </Link>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-300">
            <Link href="/" className="transition hover:text-maize">← Back to the site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-maize-100 text-navy">
        {icon}
      </span>
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  );
}
