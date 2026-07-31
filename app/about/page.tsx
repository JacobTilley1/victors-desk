import Link from 'next/link';
import { SITE } from '@/lib/constants';
import { PenLine, Users, ShieldCheck, Mail } from 'lucide-react';

export const metadata = {
  title: 'About',
  description: `Who runs ${SITE.name}, why it exists, and how it works.`,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About ${SITE.name}`,
    description: `Who runs ${SITE.name}, why it exists, and how it works.`,
    url: '/about',
    type: 'website',
  },
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-[24px] font-bold text-navy">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[16px] leading-[1.75] text-slate-700">{children}</p>;
}

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_-10%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-60" />
        <div className="container-page relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">About us</p>
          <h1 className="mt-2 max-w-2xl font-display text-[34px] font-bold leading-tight sm:text-[44px]">
            Michigan sports, without the machine.
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
            An independent site for fans and writers who wanted somewhere to go that
            isn&rsquo;t a big media brand chasing a number.
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <article className="container-page max-w-3xl py-12">
        <H>Why this exists</H>
        <P>
          Michigan coverage is not in short supply. What&rsquo;s harder to find is coverage
          that isn&rsquo;t built around traffic targets — the aggregation, the recycled hot
          takes, the pieces written because a keyword was trending rather than because
          somebody had something to say.
        </P>
        <P>
          {SITE.name} was founded as a place for fans and creators to step away from that.
          No paywall, no engagement bait, no chasing whatever will do numbers this week.
          Just people who care about the program writing for people who care about the
          program.
        </P>

        <H>Who runs it</H>
        <P>
          The site was founded by Jacob Tilley, who has been writing about sports since he
          was 14. He is a Biochemistry major on a pre-med track — which means this is not
          his job, and that&rsquo;s rather the point. Nothing published here needs to hit a
          quota to justify itself.
        </P>

        <H>What we cover</H>
        <P>
          Michigan football first, because that&rsquo;s what most people come for — but also
          basketball, hockey, recruiting, and the occasional piece about the sport itself
          when something bigger is going on. Analysis and opinion rather than wire copy;
          if you want a box score, you already know where to find one.
        </P>

        <H>How it works</H>
        <div className="mt-4 space-y-4">
          <Feature icon={<PenLine size={17} />} title="Anyone can apply to write">
            Writers apply, and approved contributors publish under their own byline. You
            don&rsquo;t need a journalism degree — you need to know the program and be able
            to make an argument.
          </Feature>
          <Feature icon={<ShieldCheck size={17} />} title="Everything is edited before it runs">
            Submissions go through an editor before publication. Nothing goes live unread.
          </Feature>
          <Feature icon={<Users size={17} />} title="The forum is the point, not an add-on">
            Comments and a moderated community forum sit alongside the writing, because
            arguing about the offensive line with other people is half of why anyone
            follows this team.
          </Feature>
        </div>

        <H>Independence and corrections</H>
        <P>
          This site is fan-run and has no affiliation with the University of Michigan or its
          athletic department. Nothing here is official, and nobody here has inside access
          they haven&rsquo;t earned.
        </P>
        <P>
          We get things wrong sometimes. When that happens, tell us and we&rsquo;ll fix it —
          corrections are noted rather than quietly edited away. If something published here
          is inaccurate, the{' '}
          <Link href="/contact" className="font-medium text-navy-500 underline decoration-maize decoration-2 underline-offset-2">
            contact page
          </Link>{' '}
          is the fastest way to reach us.
        </P>

        <div className="card mt-12 flex flex-col gap-4 bg-navy p-7 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-[19px] font-bold">Want to write for us?</h3>
            <p className="mt-1 text-[14.5px] leading-relaxed text-slate-300">
              Approved writers publish under their own byline. Tell us what you&rsquo;d cover.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/account" className="btn-primary btn-sm">
              <PenLine size={14} /> Apply
            </Link>
            <Link href="/contact" className="btn border border-white/20 bg-white/5 btn-sm text-white hover:bg-white/10">
              <Mail size={14} /> Contact
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

function Feature({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card flex gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maize-100 text-navy">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-[16px] font-bold text-navy">{title}</h3>
        <p className="mt-1 text-[14.5px] leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  );
}
