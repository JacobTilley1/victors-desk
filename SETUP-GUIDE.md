# The Victors' Desk — complete setup guide

Written for Windows, assuming you've never done this before. Mac differences are noted
where they matter.

Work through it in order. Parts 1–4 get the site running privately on your computer.
Parts 5–7 put it on the internet. **Do Parts 1–4 first and stop there for a while** —
there's no rush to deploy.

Total time: about an hour for Parts 1–4, another 30 minutes for 5–7.

---

# PART 1 — Install the tools (15 min)

You need two programs. Skip either one you already have.

## 1.1 Node.js

Node is what runs the website code on your machine.

1. Go to **https://nodejs.org**
2. Download the button that says **LTS** (not "Current")
3. Run the installer. Click Next through everything, accept the defaults, Install.
4. **Restart your computer.** Annoying, but it saves you a confusing error later.

**Check it worked:** press `Win`, type `powershell`, hit Enter. In the blue window, type:

```
node --version
```

Press Enter. You should see something like `v22.11.0`. If you see "not recognized,"
the restart didn't happen or the install failed — try again.

## 1.2 A code editor

You barely need this, but you'll want it for editing one file and it's better than Notepad.

1. Go to **https://code.visualstudio.com**
2. Download, install, accept defaults.

## 1.3 Git (only needed for Part 5, install it now anyway)

1. Go to **https://git-scm.com/download/win**
2. Download and run. Click Next through every screen — the defaults are fine.
   There are a lot of screens. Just keep clicking Next.

---

# PART 2 — Set up Supabase (20 min)

This creates the database that stores your accounts, posts, and comments.

## 2.1 Make an account

1. Go to **https://supabase.com** → **Start your project**
2. Sign in with GitHub (it'll make you create a GitHub account if you don't have one —
   do it, you need one for Part 5 anyway)

## 2.2 Create the project

1. Click **New project**
2. **Name:** `victors-desk` (or whatever)
3. **Database Password:** click Generate, then **copy it somewhere safe**. You probably
   won't need it, but if you do need it there's no way to recover it.
4. **Region:** pick the one closest to you — `East US (North Virginia)` for Michigan
5. **Plan:** Free
6. Click **Create new project**

It takes 2–3 minutes to build. Get coffee.

## 2.3 Build the database tables

This is the step that actually matters.

1. In the left sidebar, click the **SQL Editor** icon (looks like a terminal prompt)
2. Click **New query**
3. Open the file `supabase/schema.sql` from your project folder — right-click it →
   Open with → Visual Studio Code
4. Select all of it (`Ctrl+A`), copy (`Ctrl+C`)
5. Paste into the Supabase query box (`Ctrl+V`)
6. Click **Run** (bottom right, or `Ctrl+Enter`)

**What you should see:** "Success. No rows returned" in green.

**If you see red:** copy the error message and ask me — but the most common cause is
only pasting part of the file. Make sure you got everything from the first line to the last.

**Check it worked:** click the **Table Editor** icon in the sidebar. You should see
tables named `profiles`, `posts`, `comments`, `forum_categories`, `forum_threads`,
`forum_replies`, `post_likes`, and `reports`. Click `forum_categories` — it should
already have six rows in it (The Big House, Crisler Center, etc.).

## 2.4 Grab your two keys

1. Sidebar → **Project Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **anon public** key — a very long string starting with `eyJ`
3. Leave this tab open. You'll paste both into a file in Part 4.

> The `anon public` key is safe to put in your code — it's designed to be public. Do
> **not** use the `service_role` key anywhere. That one bypasses all security rules.

---

# PART 3 — Turn on Google sign-in (20 min)

This is the fiddliest part because you're bouncing between two websites that each need
something from the other. Read the whole section once before starting.

## 3.1 Get the callback URL from Supabase

1. In Supabase: sidebar → **Authentication** → **Sign In / Providers**
2. Find **Google** in the list, click it
3. Toggle it **on**
4. Near the bottom you'll see **Callback URL (for OAuth)** — something like
   `https://abcdefghijk.supabase.co/auth/v1/callback`
5. **Copy it.** Paste it in Notepad for a second. You need it in 3.3.
6. Leave this page open — you're coming back to it.

## 3.2 Create a Google Cloud project

1. Open a new tab: **https://console.cloud.google.com**
2. Sign in with your Google account
3. If it asks you to agree to terms, agree
4. At the top left, next to "Google Cloud," there's a project dropdown. Click it →
   **New Project**
5. Name it `victors-desk` → **Create**
6. Wait a few seconds, then make sure that project is selected in the dropdown

## 3.3 Configure the consent screen

This is the "Sign in with Google" popup your visitors will see.

1. Search bar at the top → type **OAuth consent screen** → click it
2. Click **Get started**
3. **App name:** `The Victors' Desk`
   **User support email:** your email → **Next**
4. **Audience:** choose **External** → **Next**
5. **Contact information:** your email → **Next**
6. Check the box to agree → **Create**

## 3.4 Create the credentials

1. Left sidebar → **Clients** → **Create client**
   (older layout: **Credentials** → **Create credentials** → **OAuth client ID**)
2. **Application type:** Web application
3. **Name:** `Victors Desk Web`
4. Under **Authorized JavaScript origins**, click **Add URI** and enter:
   ```
   http://localhost:3000
   ```
5. Under **Authorized redirect URIs**, click **Add URI** and paste the Supabase
   callback URL you copied in 3.1:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. A popup shows your **Client ID** and **Client secret**. Copy both.

> Getting these two boxes mixed up is the #1 cause of sign-in failing later. Origins gets
> `localhost:3000`. Redirect URIs gets the long Supabase URL.

## 3.5 Paste them into Supabase

1. Back on the Supabase Google provider page
2. **Client IDs:** paste the Client ID
3. **Client Secret:** paste the secret
4. Click **Save**

## 3.6 Tell Supabase where your site lives

1. Supabase sidebar → **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs** → Add URL → `http://localhost:3000/auth/callback`
4. **Save**

Done with the hard part.

---

# PART 4 — Run the site on your computer (10 min)

## 4.1 Open a terminal in the project folder

1. Open File Explorer and navigate to the `michigan-sports-blog` folder
2. Click the address bar at the top (where the path is), type `powershell`, press Enter

A blue window opens, already pointed at the right folder.

## 4.2 Install the code's dependencies

Type this and press Enter:

```
npm install
```

It downloads about 200 small packages. Takes 1–3 minutes and prints a lot of text.
A few warnings in yellow are normal. Wait for your cursor to come back.

## 4.3 Create your settings file

In the same terminal:

```
copy .env.local.example .env.local
```

Then open that new file:

```
code .env.local
```

(If `code` doesn't work, open the folder in VS Code manually and click the file.)

Replace the placeholder values with the two things you copied in step 2.4:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No quotes, no spaces around the `=`. Save with `Ctrl+S`.

## 4.4 Start it

Back in the terminal:

```
npm run dev
```

You'll see:

```
✓ Ready in 2.1s
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser. **That's your website.**

> Leave that terminal window open. It's running the site. Closing it takes the site down.
> To stop it deliberately, click the terminal and press `Ctrl+C`.

## 4.5 Sign in and make yourself the boss

1. Click **Sign in** on the site → **Continue with Google** → pick your account
2. You may see a "Google hasn't verified this app" warning — that's expected for a new
   app. Click **Advanced** → **Go to The Victors' Desk (unsafe)**. It's your own app.
3. You should land back on the site, signed in, with your name in the top right

Now promote yourself:

1. Supabase → **SQL Editor** → **New query**
2. Paste this, replacing the email with the Google account you just used:

```sql
update public.profiles
   set role = 'admin', author_status = 'approved'
 where email = 'you@example.com';
```

3. Click **Run** — should say "Success"
4. Back on your site, refresh the page

You should now see a **Write** button in the header, and **Moderation** in your account menu.

## 4.6 Take it for a drive

- Click **Write**, type a headline and a couple paragraphs, hit **Publish now**
- Go to the home page — your post is the lead story
- Open the post, leave a comment on yourself
- Go to **Forum** → pick a category → **New thread**
- Visit `/admin` and look at the five moderation tabs

If all that works, you're done with the hard parts. **Stop here for now if you want.**

---

# PART 5 — Put the code on GitHub (10 min)

Only needed when you're ready to go live.

## 5.1 Create the repository

1. Go to **https://github.com** → sign in
2. Top right **+** → **New repository**
3. **Name:** `victors-desk`
4. **Private** is fine (Vercel can still read it)
5. **Do not** check "Add a README" — leave all the extras unchecked
6. **Create repository**
7. Leave the page open — it shows commands you'll partly use

## 5.2 Push your code

In your project terminal (press `Ctrl+C` first to stop the dev server):

```
git init
git add .
git commit -m "The Victors' Desk"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/victors-desk.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username. A browser window may pop up
to log you in — do it.

If git asks who you are, run these once and then retry the commit:

```
git config --global user.email "you@example.com"
git config --global user.name "Jacob"
```

**Check:** refresh the GitHub page. Your files should be listed.

> Your `.env.local` is deliberately **not** uploaded — the `.gitignore` file excludes it.
> That's correct. Keys don't belong on GitHub.

---

# PART 6 — Deploy to Vercel (10 min)

## 6.1 Import the project

1. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub**
2. Click **Add New…** → **Project**
3. Find `victors-desk` in the list → **Import**
4. Vercel auto-detects Next.js. Don't change the build settings.

## 6.2 Add your environment variables

Before clicking Deploy, expand **Environment Variables** and add all three. Same values
as your `.env.local`, except the last one:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
| `NEXT_PUBLIC_SITE_URL` | leave as `http://localhost:3000` for now — you'll fix it in 6.4 |

## 6.3 Deploy

Click **Deploy**. Two minutes. You get confetti and a URL like
`victors-desk.vercel.app`.

**Sign-in will be broken right now.** That's expected — three things still think your
site lives on localhost. Fix them next.

## 6.4 Point everything at the real URL

Copy your new Vercel URL, then:

**In Vercel:** Settings → Environment Variables → edit `NEXT_PUBLIC_SITE_URL` to
`https://victors-desk.vercel.app` (no trailing slash) → Save. Then go to the
**Deployments** tab → the three dots on the newest one → **Redeploy**.

**In Supabase:** Authentication → URL Configuration:
- Site URL: `https://victors-desk.vercel.app`
- Redirect URLs: add `https://victors-desk.vercel.app/auth/callback`
  (keep the localhost one too, so you can still develop locally)

**In Google Cloud:** Clients → your OAuth client:
- Authorized JavaScript origins: add `https://victors-desk.vercel.app`
- Save. Google changes can take a few minutes to take effect.

Now open your Vercel URL and sign in. It should work exactly like localhost did — same
database, same posts, same account.

---

# PART 7 — A real domain (optional, 15 min + ~$12/yr)

1. Buy a domain at **Cloudflare Registrar** (cheapest, no upsells) or **Namecheap**
2. In Vercel: your project → **Settings** → **Domains** → **Add** → type your domain
3. Vercel shows you two DNS records to create
4. In your registrar's DNS settings, add exactly those records
5. Wait 10–60 minutes. Vercel handles the HTTPS certificate automatically.
6. **Then repeat 6.4 with the new domain** — Vercel env var, Supabase URLs, Google origins.
   Forgetting this is the classic mistake.

---

# Day-to-day, once it's live

**To publish:** go to your site, sign in, click Write, publish. No terminal, no code.

**To approve a writer:** `/admin` → Writers tab → Approve.

**To review a submission:** `/admin` → Post queue → Publish or Send back with a note.

**To change the code** (colors, wording, layout): edit files locally, run `npm run dev`
to check it, then:

```
git add .
git commit -m "what you changed"
git push
```

Vercel redeploys automatically within a minute.

---

# When something breaks

**"npm is not recognized"** — Node didn't install, or you didn't restart. Redo 1.1.

**Sign-in loops back to the login page** — a URL mismatch. Check that Supabase's
Redirect URLs contain the exact address you're visiting, with `/auth/callback` on the
end and no trailing slash.

**"redirect_uri_mismatch" from Google** — the Supabase callback URL in Google Cloud's
Authorized redirect URIs is wrong. Copy it fresh from the Supabase Google provider page.

**Site loads but everything is empty and errors mention "supabaseUrl"** — `.env.local`
is missing, misspelled, or the dev server was started before you saved it. Fix the file,
`Ctrl+C`, then `npm run dev` again.

**"permission denied" or "row-level security" errors** — you're doing something your
role doesn't allow. Usually means step 4.5 (making yourself admin) didn't take. Rerun it
and check the email matches exactly.

**Post published but not showing on the home page** — if you're not an admin, it went to
the review queue instead. Check `/dashboard` for its status.

Stuck anywhere? Paste me the exact error text and which step you're on.
