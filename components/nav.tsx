'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, PenLine, Shield, LayoutGrid, LogOut, User, BarChart3, Search as SearchIcon } from 'lucide-react';
import Logo from '@/components/logo';
import Avatar from '@/components/avatar';
import GoogleButton from '@/components/google-button';
import type { Profile } from '@/lib/database.types';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/forum', label: 'Forum' },
  { href: '/history', label: 'History' },
  { href: '/games', label: 'Games' },
  { href: '/authors', label: 'Writers' },
];

export default function Nav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const canWrite =
    !!profile && !profile.is_banned &&
    (profile.role === 'admin' || (profile.role === 'author' && profile.author_status === 'approved'));

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--line)] bg-white/85 backdrop-blur-xl shadow-[0_4px_24px_-16px_rgba(0,39,77,0.5)]'
          : 'border-b border-transparent bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="transition hover:opacity-85">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-lg px-3.5 py-2 text-[14px] font-semibold transition ${
                active(l.href) ? 'text-navy' : 'text-slate-500 hover:text-navy'
              }`}
            >
              {l.label}
              {active(l.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-maize" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy"
            aria-label="Search"
            title="Search"
          >
            <SearchIcon size={18} />
          </Link>

          {canWrite && (
            <Link href="/write" className="btn-primary btn-sm hidden sm:inline-flex">
              <PenLine size={15} /> Write
            </Link>
          )}

          {profile ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white p-1 pr-2.5 transition hover:border-navy/25 hover:shadow-sm"
              >
                <Avatar name={profile.display_name} url={profile.avatar_url} size={28} />
                <span className="hidden max-w-[110px] truncate text-[13px] font-semibold text-navy lg:block">
                  {profile.display_name}
                </span>
              </button>

              {menu && (
                <div className="animate-fade-up absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(0,39,77,0.45)]">
                  <div className="border-b border-[var(--line)] px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-navy">{profile.display_name}</p>
                    <p className="truncate text-xs text-slate-500">{profile.email}</p>
                    <span className="chip mt-2 bg-maize-100 text-navy-700">
                      {profile.role === 'admin'
                        ? 'Admin'
                        : profile.author_status === 'approved'
                        ? 'Writer'
                        : profile.author_status === 'pending'
                        ? 'Application pending'
                        : 'Member'}
                    </span>
                  </div>
                  <MenuLink href="/dashboard" icon={<LayoutGrid size={15} />}>Dashboard</MenuLink>
                  <MenuLink href="/dashboard/analytics" icon={<BarChart3 size={15} />}>Analytics</MenuLink>
                  <MenuLink href="/account" icon={<User size={15} />}>Account</MenuLink>
                  {canWrite && (
                    <MenuLink href="/write" icon={<PenLine size={15} />}>New post</MenuLink>
                  )}
                  {profile.role === 'admin' && (
                    <MenuLink href="/admin" icon={<Shield size={15} />}>Moderation</MenuLink>
                  )}
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-navy btn-sm">Sign in</Link>
          )}

          <button
            className="rounded-lg p-2 text-navy transition hover:bg-navy/5 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-[var(--line)] bg-white md:hidden">
          <div className="container-page space-y-1 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
                  active(l.href) ? 'bg-maize-50 text-navy' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {canWrite && (
              <Link href="/write" className="btn-primary mt-2 w-full">
                <PenLine size={15} /> Write a post
              </Link>
            )}
            {!profile && (
              <div className="pt-2">
                <GoogleButton next={pathname} />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href, icon, children,
}: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-maize-50"
    >
      {icon}
      {children}
    </Link>
  );
}
