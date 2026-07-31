import Link from 'next/link';
import { SITE } from '@/lib/constants';
import { Mail, PenLine, AlertTriangle, MessageSquare, Handshake } from 'lucide-react';

const EMAIL = 'jtilley02rio@gmail.com';

export const metadata = {
  title: 'Contact',
  description: `How to reach ${SITE.name} — tips, corrections, writing for us, and partnerships.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact ${SITE.name}`,
    description: `How to reach ${SITE.name} — tips, corrections, writing for us, and partnerships.`,
    url: '/contact',
    type: 'website',
  },
};

const REASONS = [
  {
    icon: <AlertTriangle size={17} />,
    title: 'Corrections',
    body: 'Something here is wrong. Include the article and what needs fixing — this one gets answered first.',
    subject: 'Correction',
  },
  {
    icon: <PenLine size={17} />,
    title: 'Writing for us',
    body: 'You want a byline. Tell us what you would cover and link anything you have written before.',
    subject: 'Writing for The Victors’ Desk',
  },
  {
    icon: <MessageSquare size={17} />,
    title: 'Tips and story ideas',
    body: 'Something we should be covering. If you need to stay anonymous, say so and we will treat it that way.',
    subject: 'Story tip',
  },
  {
    icon: <Handshake size={17} />,
    title: 'Partnerships and press',
    body: 'Sponsorship, syndication, credentials, or anything commercial.',
    subject: 'Partnership enquiry',
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">Get in touch</p>
          <h1 className="mt-2 font-display text-[34px] font-bold sm:text-[40px]">Contact</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-slate-300">
            One inbox, read by an actual person. Expect a reply within a couple of days.
          </p>
        </div>
      </section>

      <section className="container-page max-w-3xl py-12">
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maize-100 text-navy">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Email us
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-1 block break-all font-display text-[22px] font-bold text-navy underline decoration-maize decoration-2 underline-offset-4"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        <h2 className="mb-4 mt-12 font-display text-[22px] font-bold text-navy">
          What are you writing about?
        </h2>
        <p className="mb-5 text-[15px] leading-relaxed text-slate-600">
          Any of these open your email app with a subject line already filled in, which
          helps things get to the right place faster.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {REASONS.map((r) => (
            <a
              key={r.title}
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(r.subject)}`}
              className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-maize"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maize-100 text-navy">
                {r.icon}
              </div>
              <h3 className="mt-3 font-display text-[16px] font-bold text-navy">{r.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{r.body}</p>
            </a>
          ))}
        </div>

        <div className="card mt-10 p-6">
          <h2 className="font-display text-[18px] font-bold text-navy">A few things that are faster elsewhere</h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-slate-700">
            <li>
              <strong>Applying to write</strong> — the{' '}
              <Link href="/account" className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">
                application form
              </Link>{' '}
              goes straight into the editor queue, so it beats email.
            </li>
            <li>
              <strong>Reporting a comment or forum post</strong> — every one has a report
              button that reaches a moderator directly.
            </li>
            <li>
              <strong>Deleting your account or your data</strong> — email is right, and the{' '}
              <Link href="/privacy" className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">
                privacy policy
              </Link>{' '}
              explains what happens next.
            </li>
            <li>
              <strong>Arguing about a take</strong> — that is what the{' '}
              <Link href="/forum" className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">
                forum
              </Link>{' '}
              is for, and it is more fun in public.
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-[13px] leading-relaxed text-slate-400">
          {SITE.name} is fan-run and independent. It is not affiliated with the University of
          Michigan or its athletic department, so we cannot help with tickets, merchandise, or
          anything official.
        </p>
      </section>
    </>
  );
}
