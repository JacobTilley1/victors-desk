# AdSense

## The kill switch

Everything hangs off one Vercel environment variable:

```
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
```

Clear it and redeploy, and every ad on the site is gone — no loader script, no
slots, and `/ads.txt` starts returning 404.

**You will need to do exactly that.** The site also runs Grow by Mediavine to
start the clock on Journey, and Mediavine support says Journey requires
exclusivity: AdSense has to come off before Journey ads go live. Running
AdSense in the meantime is fine, but the day Journey approves, clear this
variable first.

## Turning it on

1. Get approved at <https://adsense.google.com> and note the publisher ID.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` in Vercel → Settings → Environment
   Variables, Production only. Redeploy.
3. Confirm `https://victorsdesk.com/ads.txt` returns one line naming your
   publisher ID. AdSense warns about a missing ads.txt and buyers bid less
   without it.
4. In AdSense → **Privacy & messaging**, switch on the GDPR and CCPA messages.
   Google's own consent prompt is what satisfies the certified-CMP
   requirement for visitors in the EEA, the UK and Switzerland; without it
   Google simply stops serving ads to that traffic. There is no consent code
   in this repo on purpose — the AdSense script carries it.
5. Create the ad units below and set each slot ID.

## The slots

Create each in AdSense → **Ads → By ad unit → Display ad**, then paste the
numeric slot ID into the matching variable. A slot left unset renders nothing,
so you can add them one at a time.

| Variable | Where it appears | Suggested unit |
|---|---|---|
| `NEXT_PUBLIC_ADSLOT_ARTICLE_TOP` | a fifth of the way into an article | Horizontal, responsive |
| `NEXT_PUBLIC_ADSLOT_ARTICLE_MID` | past the middle of a long article | Horizontal, responsive |
| `NEXT_PUBLIC_ADSLOT_ARTICLE_END` | below the article, above the like bar | Square, responsive |
| `NEXT_PUBLIC_ADSLOT_SIDEBAR` | home page sidebar, under the newsletter | Vertical, responsive |
| `NEXT_PUBLIC_ADSLOT_FEED` | below the grid on `/blog` | Horizontal, responsive |

Articles decide for themselves how many in-content units they can carry:
under five blocks, none; under twelve, one; longer than that, two. The cut is
only ever made between top-level blocks, so a table or a list is never torn in
half. `npm run test:ads` proves it.

## Where ads never appear

`/privacy`, `/terms`, `/guidelines`, `/contact`, `/login`, `/logout`,
`/admin`, `/account`, `/dashboard` and anything beneath them. The list is
`AD_FREE_PREFIXES` in `lib/ads.ts`.

Ads **do** run on the arcade and the individual game pages. Those are the
longest sessions on the site. If that ever looks wrong against the cabinet
design, add `/games` to the list.

## In development

The loader script never runs outside production — a stray impression from a
dev server is invalid traffic, and invalid traffic gets AdSense accounts
closed rather than warned. Slots render as labelled dashed boxes instead, at
the height the real ad will occupy, so you can lay pages out without guessing.

## Why the boxes reserve height

Every unit is given a `minHeight`. An ad that arrives late and pushes the
article down loses the reader their place and takes a direct bite out of
Cumulative Layout Shift. The reserved box is not decoration.

## Tests

```
npm run test:ads
```

Covers the kill switch, the ad-free path matching (including that
`/terminology` is not caught by the `/terms` rule), and the article splitter
against tables, lists, blockquotes, figures and malformed HTML.
