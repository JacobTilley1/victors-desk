import Link from 'next/link';
import { Shield, MessageSquare, Flag, PenLine } from 'lucide-react';

export const metadata = {
  title: 'Community rules',
  description:
    'How comments and the forum are moderated on The Victors\u2019 Desk, and what gets your account suspended.',
  alternates: { canonical: '/guidelines' },
  openGraph: {
    title: 'Community rules',
    description:
      'How comments and the forum are moderated on The Victors\u2019 Desk, and what gets your account suspended.',
    url: '/guidelines',
    type: 'website',
  },
};

const RULES = [
  {
    icon: <MessageSquare size={17} />,
    title: 'Argue the take, not the person',
    body: 'Disagree as loudly as you want about the play call. Insults, slurs, and pile-ons get removed and repeat offenders lose posting rights.',
  },
  {
    icon: <Shield size={17} />,
    title: 'No doxxing, no harassment',
    body: 'Never post private information about players, recruits, staff, or other members. Recruits in particular are teenagers — treat them that way.',
  },
  {
    icon: <Flag size={17} />,
    title: 'Report instead of retaliating',
    body: 'Every post and comment has a report button. Moderators see the queue. Escalating a fight yourself usually gets both accounts actioned.',
  },
  {
    icon: <PenLine size={17} />,
    title: 'Sourcing matters',
    body: 'If you are passing along a rumor, say where it came from. Fabricated insider info is the fastest way to a permanent suspension.',
  },
];

export default function GuidelinesPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">House rules</p>
          <h1 className="mt-2 font-display text-[34px] font-bold sm:text-[40px]">Community guidelines</h1>
          <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-slate-300">
            This place works because people show up to talk about Michigan, not to fight.
            Four rules, moderated consistently.
          </p>
        </div>
      </section>

      <section className="container-page max-w-3xl py-12">
        <div className="space-y-5">
          {RULES.map((r, i) => (
            <div key={r.title} className="card animate-fade-up flex gap-4 p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maize-100 text-navy">
                {r.icon}
              </div>
              <div>
                <h2 className="font-display text-[17px] font-bold text-navy">{r.title}</h2>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-600">{r.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-8 bg-navy p-6 text-white">
          <h2 className="font-display text-[17px] font-bold">How moderation works</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-slate-300">
            Reports go straight to an editor queue. Moderators can hide, delete, lock or pin
            anything in the forum, and can suspend accounts. Blog posts from staff writers are
            reviewed before publication — nothing goes live unread.
          </p>
          <Link href="/forum" className="btn-primary btn-sm mt-5">Back to the forum</Link>
        </div>
      </section>
    </>
  );
}
