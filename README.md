# Panicha Portfolio

A content-driven personal portfolio with a private CMS in the same app.

- **Public site**: `/`, `/work`, `/work/[slug]`, `/about`, `/contact`
- **Admin (owner only)**: `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/categories`, `/admin/experience`, `/admin/awards`, `/admin/profile`, `/admin/contact`, `/admin/settings`

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Motion (Framer Motion), Supabase (Postgres, Auth, Storage, RLS).

Design: dark blue-to-black gradient, inspired by the space theme on aona.co.th: a starfield, a glowing planet horizon in the hero, a floating pill navbar, and one accent colour you can change in Admin › Settings. The layout is editorial: big type, lots of space and thin lines.

## Setup

1. **Database**: everything lives in its own Postgres schema, `portfolio`, so it can share a Supabase project with other apps. Run the SQL in order:
   - `supabase/migrations/0001_init.sql`: the `portfolio` schema, tables, RLS policies, the `portfolio-media` storage bucket
   - `supabase/seed.sql` (optional): starter content (EchoSense, Deckora, FastFix)

   Then **expose the schema**: Dashboard › Project Settings › Data API › *Exposed schemas* › add `portfolio`.
2. **Create the owner account**: Supabase › Authentication › Users › *Add user* (email + password). Then make that user the owner:
   ```sql
   insert into portfolio.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
3. **Disable public sign-ups**: Authentication › Sign In / Providers › turn off *Allow new users to sign up*. Only listed admins can edit anything. RLS enforces this even if someone signs up.
4. **Environment**: copy `.env.example` to `.env.local` and fill it in. Email notifications are optional.
5. Run:
   ```bash
   npm install
   npm run dev
   ```
   Sign in at `/admin/login`.

## Deploy (Vercel)

Import the repo and add the same environment variables. Set `NEXT_PUBLIC_SITE_URL` to your domain. No other configuration is needed.

## How it works

| Concern | Where |
| --- | --- |
| Design tokens (colour, type scale, spacing, radius, motion, container, breakpoints) | `src/app/globals.css` |
| Public data, read only through a cookieless anon client so drafts never leak | `src/lib/data.ts` |
| Bilingual fallback (`title_th` / `title_en`, falls back to the other language) | `src/lib/i18n/pick.ts` |
| UI labels (owners can override them in Settings) | `src/lib/i18n/dictionary.ts` |
| Admin writes (owner check plus a column whitelist on every action) | `src/app/admin/actions.ts`, `src/lib/admin.ts` |
| Route protection | `src/proxy.ts` (session) + `requireOwner()` (owner) + RLS (database) |
| Uploads (type/size validation, client-side resize to WebP, owner-only bucket policy) | `src/lib/upload.ts` |
| Contact form (honeypot, rate limit of 3 per 10 min per IP hash, stored in DB, optional email through Resend) | `src/app/(site)/actions.ts` |

### Two languages
Every text field in the admin has a Thai box and an English box side by side. They are stored separately (`title_th` / `title_en`). If one is left empty, the site shows the other language instead, and the admin marks the field `⚠ EN missing` (or TH). Visitors switch TH | EN from the navigation or footer; menus, buttons and section titles switch with it.

### Content model
Nothing about you is hard-coded. Projects, categories, profile, experience, awards, skills, social links, SEO and the contact text all come from the database. Add a category such as "Photography" and it appears as a filter on `/work` as soon as a published project uses it.
