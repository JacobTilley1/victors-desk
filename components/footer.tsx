import Link from 'next/link';
import Logo from '@/components/logo';
import SubscribeForm from '@/components/subscribe-form';
import { SITE, TEAMS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-navy text-slate-300">
      <div className="field-grain">
        <div className="container-page grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-8">
              <SubscribeForm source="footer" variant="dark" />
            </div>
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {SITE.description}
            </p>
            <p className="mt-5 text-xs text-slate-500">
              Fan-run and independent. Not affiliated with the University of Michigan
              or its athletic department.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-maize">
              Coverage
            </h4>
            <ul className="space-y-2 text-sm">
              {TEAMS.slice(0, 5).map((t) => (
                <li key={t.value}>
                  <Link href={`/blog?team=${t.value}`} className="text-slate-400 transition hover:text-maize">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-maize">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/history" className="text-slate-400 transition hover:text-maize">History archive</Link></li>
              <li><Link href="/pro" className="text-slate-400 transition hover:text-maize">Pro Blue</Link></li>
              <li><Link href="/games" className="text-slate-400 transition hover:text-maize">Games</Link></li>
              <li><Link href="/about" className="text-slate-400 transition hover:text-maize">About</Link></li>
              <li><Link href="/contact" className="text-slate-400 transition hover:text-maize">Contact</Link></li>
              <li><Link href="/forum" className="text-slate-400 transition hover:text-maize">Forum</Link></li>
              <li><Link href="/authors" className="text-slate-400 transition hover:text-maize">Our writers</Link></li>
              <li><Link href="/account" className="text-slate-400 transition hover:text-maize">Write for us</Link></li>
              <li><Link href="/guidelines" className="text-slate-400 transition hover:text-maize">Community rules</Link></li>
              <li><Link href="/privacy" className="text-slate-400 transition hover:text-maize">Privacy policy</Link></li>
              <li><a href="/feed.xml" className="text-slate-400 transition hover:text-maize">RSS feed</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} {SITE.name}. Go Blue.</p>
            <p className="font-semibold tracking-wide text-maize/70">HAIL TO THE VICTORS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
