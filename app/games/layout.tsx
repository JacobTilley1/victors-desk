import { pixel } from '@/lib/fonts';

/*
 * The pixel face is only ever used in the arcade, so it is attached here
 * rather than in the root layout — no reason to make an article page pay
 * for a font it never shows.
 */
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <div className={pixel.variable}>{children}</div>;
}
