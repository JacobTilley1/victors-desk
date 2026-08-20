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

/*
 * Deliberately short. The old version had four rules covering tone, sourcing
 * and civility, which read as a site that polices arguments. This is a small
 * board that needs people to post, and the surest way to keep a forum empty is
 * to make posting feel risky.
 *
 * What's left is the set that actually has to stay: things that are illegal,
 * things that threaten people, and things that would get the site dropped by
 * an ad network. Everything else is left to the room.
 */
const RULES = [
  {
    icon: <Shield size={17} />,
    title: 'Nothing illegal',
    body: 'No content that breaks the law — that includes anything sexual involving minors, stolen or pirated material, and content that exists to facilitate a crime. This is the one that gets an account removed immediately and without discussion.',
  },
  {
    icon: <MessageSquare size={17} />,
    title: 'No threats, no targeting real people',
    body: 'Threatening someone gets you removed. So does posting a private address, phone number or workplace. Recruits are the reason this matters most here — many of them are teenagers and they read this stuff.',
  },
  {
    icon: <PenLine size={17} />,
    title: 'No spam',
    body: 'Not a values thing — an unmoderated board fills with affiliate links and bot posts within weeks, and it drives out everyone who came to talk. Promotional accounts get removed.',
  },
  {
    icon: <Flag size={17} />,
    title: 'Everything else is yours',
    body: 'Argue as hard as you want. Be wrong loudly. Go off-topic. Talk about a movie, your job, a bad take you regret. You will not get moderated for having an opinion someone disliked, and there is a report button if you would rather flag something than fight about it.',
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
            We moderate as little as possible. Michigan is what brought everyone here,
            but the conversation can go wherever it goes — the list below is short on
            purpose, and it is close to the whole list.
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
            Reports go to a queue an editor actually reads. We can hide, delete, lock or pin
            anything and suspend accounts, but the bar for using any of it is high — a post
            has to break something above, not just annoy someone. Articles from staff writers
            are still reviewed before publication; that part is editing, not moderation.
          </p>
          <Link href="/forum" className="btn-primary btn-sm mt-5">Back to the forum</Link>
        </div>
      </section>
    </>
  );
}
