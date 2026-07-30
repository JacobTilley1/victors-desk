import Link from 'next/link';
import { SITE } from '@/lib/constants';

export const metadata = {
  title: 'Privacy policy',
  description: `What ${SITE.name} collects, why, and how to have it deleted.`,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy policy',
    description: `What ${SITE.name} collects, why, and how to have it deleted.`,
    url: '/privacy',
    type: 'website',
  },
};

const UPDATED = 'July 29, 2026';
const CONTACT = 'jtilley02rio@gmail.com';

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-[22px] font-bold text-navy">{children}</h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15.5px] leading-relaxed text-slate-700">{children}</p>;
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2 pl-5 text-[15.5px] leading-relaxed text-slate-700">
      {items.map((t, i) => (
        <li key={i} className="list-disc">{t}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">Legal</p>
          <h1 className="mt-2 font-display text-[34px] font-bold sm:text-[40px]">Privacy policy</h1>
          <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-slate-300">
            Plain English, and specific to how this site actually works.
          </p>
          <p className="mt-3 text-[13px] text-slate-400">Last updated {UPDATED}</p>
        </div>
      </section>

      <article className="container-page max-w-3xl py-12">
        <P>
          {SITE.name} (&ldquo;we&rdquo;, &ldquo;the Site&rdquo;) is an independent, fan-run
          publication covering University of Michigan athletics at victorsdesk.com. It is not
          affiliated with the University of Michigan. This policy explains what we collect,
          why, who else sees it, and how to have it removed.
        </P>

        <H>What we collect</H>
        <P>
          <strong>If you never sign in</strong>, we do not collect anything that identifies you
          personally. Our analytics providers record anonymous usage data as described below.
        </P>
        <P>
          <strong>If you sign in with Google</strong>, Google shares a limited profile with us
          and we store:
        </P>
        <Bullets
          items={[
            'Your name, as supplied by Google — you can change this at any time in your account settings.',
            'Your email address.',
            'Your Google profile picture, unless you upload your own.',
            'A unique account identifier.',
          ]}
        />
        <P>
          We never receive your Google password, and we cannot access your Gmail, contacts,
          Drive, or any other Google service.
        </P>
        <P>
          <strong>Content you create</strong> — comments, forum threads and replies, articles if
          you write for us, your bio, and any image you upload — is stored on our behalf and,
          except for drafts, is public.
        </P>
        <P>
          <strong>Technical data</strong> collected automatically includes pages viewed,
          approximate location at country or region level, device and browser type, and
          referring site.
        </P>

        <H>Cookies</H>
        <P>We use two kinds:</P>
        <Bullets
          items={[
            <>
              <strong>Essential cookies</strong> keep you signed in. Without them the site
              cannot tell who you are, so they cannot be turned off while you hold an account.
            </>,
            <>
              <strong>Analytics cookies</strong> from Google Analytics measure how the site is
              used. You can block these with a browser setting, an extension, or Google&rsquo;s{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                opt-out add-on
              </a>
              . Nothing on the site will break if you do.
            </>,
          ]}
        />

        <H>Who else handles your data</H>
        <P>
          We do not sell your personal information. We rely on a small number of providers to
          run the site, and each holds data on our behalf:
        </P>
        <Bullets
          items={[
            <><strong>Supabase</strong> — database, sign-in, and image storage.</>,
            <><strong>Vercel</strong> — hosting and privacy-preserving traffic analytics, which do not use cookies.</>,
            <><strong>Google</strong> — sign-in and Google Analytics 4.</>,
          ]}
        />

        <H>Advertising</H>
        <P>
          The Site does not currently show advertising. If that changes, this policy will be
          updated before any ads appear, and it will name the advertising partners and describe
          the cookies they use to personalise and measure ads.
        </P>

        <H>How long we keep it</H>
        <P>
          Account data is kept while your account exists. Published articles, comments, and
          forum posts are kept indefinitely as part of the site&rsquo;s public record, including
          after an account is deleted, though we will remove your name from them on request.
          Analytics data is retained according to our providers&rsquo; standard periods.
        </P>

        <H>Your choices</H>
        <Bullets
          items={[
            'Change your display name, bio, and picture at any time under Account.',
            'Delete individual comments and forum posts yourself.',
            <>Ask us to delete your account and personal data by emailing{' '}
              <a href={`mailto:${CONTACT}`} className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">{CONTACT}</a>.
            </>,
            'Request a copy of the personal data we hold about you.',
            'Disconnect the site from your Google account at any time via your Google security settings.',
          ]}
        />
        <P>
          Depending on where you live, you may have additional rights under laws such as the
          GDPR or CCPA, including access, correction, deletion, and objecting to processing. We
          apply these requests to everyone regardless of location. Email us and we will respond
          within 30 days.
        </P>

        <H>Children</H>
        <P>
          This site is not intended for children under 13, and we do not knowingly collect their
          personal information. If you believe a child under 13 has created an account, email us
          and we will remove it.
        </P>

        <H>Security</H>
        <P>
          Data is transmitted over HTTPS and access is restricted at the database level, so one
          member cannot read another member&rsquo;s private data. No system is perfectly secure,
          and we cannot guarantee absolute security.
        </P>

        <H>Changes</H>
        <P>
          We may update this policy. The date at the top always reflects the current version,
          and material changes will be noted on the site.
        </P>

        <H>Contact</H>
        <P>
          Questions, deletion requests, or corrections:{' '}
          <a href={`mailto:${CONTACT}`} className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">{CONTACT}</a>.
        </P>

        <div className="mt-12 border-t border-[var(--line)] pt-6">
          <Link href="/guidelines" className="btn-ghost btn-sm">Community rules</Link>
        </div>
      </article>
    </>
  );
}
