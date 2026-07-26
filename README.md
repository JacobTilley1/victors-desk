# The Victors' Desk — Michigan sports blog + community

A full-stack Michigan sports publication: Google sign-in, a rich in-browser editor,
multi-author publishing with editor approval, threaded comments, and a moderated
community forum.

**Stack:** Next.js 14 (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind · Tiptap
**Colors:** Maize `#FFCB05` (primary) · Blue `#00274D` (secondary)

---

## Setup (about 15 minutes)

### 1. Install

```bash
cd michigan-sports-blog
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
Wait for it to finish provisioning.

### 3. Run the schema

In the Supabase dashboard: **SQL Editor → New query**, paste the entire contents of
`supabase/schema.sql`, and click **Run**.

That creates every table, all row-level security policies, the triggers that
auto-create a profile on sign-up, the `post-images` storage bucket, and seeds the
six forum categories.

### 4. Turn on Google sign-in

**a. Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Create a project → **APIs & Services → OAuth consent screen** → External → fill in app name and your email.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. Authorized JavaScript origins:
   - `http://localhost:3000`
   - your production domain later
4. Authorized redirect URI — copy this from Supabase (step b), it looks like:
   - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client secret**.

**b. Supabase dashboard:** **Authentication → Providers → Google** → enable, paste
the Client ID and secret, save. The callback URL to paste into Google is shown right there.

**c. Supabase → Authentication → URL Configuration:**
- Site URL: `http://localhost:3000` (change to your domain on deploy)
- Redirect URLs: add `http://localhost:3000/auth/callback`

### 5. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in from **Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Run it

```bash
npm run dev
```

Open `http://localhost:3000` and sign in with Google once.

### 7. Make yourself the admin

Back in the Supabase SQL Editor:

```sql
update public.profiles
   set role = 'admin', author_status = 'approved'
 where email = 'you@example.com';
```

Refresh the site. You now have **Write** and **Moderation** in the account menu, and
your posts publish instantly instead of going to the review queue.

---

## How the roles work

| Role | Can do |
|---|---|
| **reader** (default on sign-up) | Comment on posts, start and reply to forum threads, report content, apply to write |
| **author** (approved application) | Everything above, plus write posts — each submission goes to the editor queue |
| **admin** | Everything, plus publish instantly, approve/reject posts and writer applications, hide/delete/lock/pin forum content, suspend members |

Anyone signed in can use the forum; blog publishing is approval-gated, exactly as you asked.

---

## The pages

| Route | What it is |
|---|---|
| `/` | Hero, lead story, latest grid, live forum rail, site stats |
| `/blog` | Full archive with sport filters, headline search, pagination |
| `/blog/[slug]` | Article page — likes, share, threaded comments, related posts |
| `/write` | Tiptap editor: headings, lists, quotes, code, links, drag-free image upload, live preview, draft vs. submit |
| `/dashboard` | Your posts with status chips (draft / in review / published / sent back), views, editor notes |
| `/forum` | Six categories, live activity feed, member counts |
| `/forum/[category]` | Thread list with pinned + locked states, inline new-thread composer |
| `/forum/thread/[id]` | Thread view, replies, report buttons, moderator bar |
| `/admin` | Five tabs: post queue, writer applications, reports, members, published |
| `/account` | Profile editing, writer application, linked Google account |
| `/authors`, `/authors/[id]` | Masthead and per-writer archives |
| `/guidelines` | Community rules |

---

## Moderation, concretely

- Every comment, thread and reply has a **Report** button → lands in `/admin?tab=reports`.
- From a report a moderator can hide, delete, or dismiss in one click.
- Thread pages show a moderator bar for admins: pin, lock, hide, delete.
- Members can be suspended from `/admin?tab=members` — suspended accounts can read but not post (enforced in the database, not just the UI).

Security is enforced by Postgres row-level security, so a hostile client can't bypass
it by calling the API directly.

---

## Deploying

1. Push to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Add the three environment variables, setting `NEXT_PUBLIC_SITE_URL` to your real domain.
4. Update the Supabase **Site URL** and **Redirect URLs**, and add the domain to Google's
   authorized origins.

---

## Notes

- Images uploaded in the editor go to the public `post-images` Supabase bucket.
- `npm run build` fetches Inter and Bitter from Google Fonts, so it needs network access.
- Post content is stored as both HTML (for rendering) and Tiptap JSON (for re-editing).
