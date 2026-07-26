import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import Avatar from '@/components/avatar';
import { ProfileForm, AuthorApplication } from '@/components/account-forms';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/account');

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-4">
        <Avatar name={profile.display_name} url={profile.avatar_url} size={62} ring />
        <div>
          <h1 className="font-display text-[26px] font-bold text-navy">{profile.display_name}</h1>
          <p className="text-[13.5px] text-slate-500">
            {profile.email} · member since {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      {profile.is_banned && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <strong className="font-bold">Your account is suspended.</strong> You can still read the site,
          but posting is disabled. Reach out to a moderator if you think this is a mistake.
        </div>
      )}

      <div className="space-y-6">
        <ProfileForm profile={profile} />
        <AuthorApplication profile={profile} />

        <div className="card p-6">
          <h2 className="font-display text-[18px] font-bold text-navy">Connected account</h2>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-slate-50/70 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <div>
                <p className="text-[14px] font-semibold text-navy">Google</p>
                <p className="text-[12.5px] text-slate-500">{profile.email}</p>
              </div>
            </div>
            <span className="chip bg-emerald-100 text-emerald-800">Linked</span>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button className="btn border border-red-200 bg-white text-red-600 hover:bg-red-50">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
