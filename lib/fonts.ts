import { Press_Start_2P } from 'next/font/google';

/**
 * The arcade face. Declared once and imported by the two places that use it —
 * the games routes and the home-page strip — so only those pages load the
 * file. Keeping it out of the root layout means an article never pays for it.
 */
export const pixel = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
});
