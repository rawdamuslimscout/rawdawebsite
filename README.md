# فوج روضة الفيحاء — Rawda Al Fayhaa Scout Group

Official website. Next.js (App Router) + TypeScript + Tailwind CSS, RTL-first Arabic,
with a Prisma/Postgres (Supabase) backend and an admin panel for editing content.

## Run locally (without a database)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site works immediately with no database connected —
every page reads through `src/lib/data.ts`, which tries the database first and
**falls back to the static data in `src/data/content.ts`** if it can't connect.
That means you can preview and tweak the whole site before ever touching Supabase.

## Connecting Supabase (do this yourself — nothing here connects automatically)

1. Create a Supabase project and grab both connection strings from
   **Project Settings → Database → Connection string**.
2. `cp .env.example .env` and fill in:
   - `DATABASE_URL` — the **pooled** connection (port 6543, `pgbouncer=true`) — used by the running app.
   - `DIRECT_URL` — the **direct** connection (port 5432) — used only by `prisma migrate` / `prisma db seed`.
   - `SESSION_SECRET` — a random string (`openssl rand -hex 32`) that signs the admin login cookie.
   - `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — the admin login the seed script will create.

- `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — the server-only service-role key; never expose it to the browser.
- `SUPABASE_STORAGE_BUCKET` — optional bucket name, defaulting to `uploads`.

3. In Supabase Storage, create a public bucket named `uploads` (or use the value of
   `SUPABASE_STORAGE_BUCKET`). Admin uploads are stored under resource folders and
   their public URLs are saved in the database.
4. Create the tables and seed initial content (the same content already on the site,
   plus one admin login):
   ```bash
   npm run db:migrate   # prisma migrate dev
   npm run db:seed      # prisma db seed
   ```
5. Restart `npm run dev`. The site now reads from Supabase, and anything you edit
   in `/admin` shows up on the live site immediately.

`npm install` also runs `prisma generate` automatically (via `postinstall`) — this
needs internet access to download Prisma's query-engine binary the first time.

## Admin panel

Go to **`/admin`** and log in with the `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`
from your `.env`. From there you can edit every piece of content on the site:
scout stages and their leaders, activities, events, camps, milestones, values, news, gallery
captions/photos, blog posts, library resources/files, join-us pricing/schedule, and the
site's general settings (name, tagline, contact info). Changes save straight
to Supabase and appear on the site right away — no redeploy needed.

The admin panel won't work until Supabase is connected and seeded (step above) —
it needs a real `Admin` row to log in against.

## Adding the real logo

Place the official crest at:

```
public/images/logo.png
```

`src/components/ui/Logo.tsx` already renders it with a white circular backing so
the purple linework stays legible on dark sections (navbar, footer).

## Adding library files

Upload library files and gallery images directly from their admin forms. They are
stored in Supabase Storage and the resulting public URL is saved automatically.

## Where content lives

- **Before Supabase is connected:** `src/data/content.ts` — every section's
  starting content, clearly marked where it's a placeholder.
- **After Supabase is connected:** the database, edited via `/admin`.
  `prisma/schema.prisma` defines every table; `prisma/seed.ts` is what
  originally populated them from `content.ts`.

## Structure

```
prisma/
  schema.prisma     # every content table + Admin auth table
  seed.ts           # seeds the DB from src/data/content.ts
src/
  app/
    admin/          # login, dashboard, generic CRUD pages (session-protected)
    api/            # public read routes + protected admin CRUD routes
    blog/           # blog listing + [slug] detail page
    library/        # library listing (client-side category filter)
    join/           # pricing + weekly schedule page
    (layout, page, globals.css)
  components/
    layout/         # Navbar, Footer
    home/           # one component per homepage section
    ui/             # reusable cards, section headings, logo, page header
  lib/
    data.ts         # DB-with-static-fallback data access (used by every page)
    prisma.ts       # Prisma client singleton
    session.ts      # signed-cookie admin session (HMAC, no extra auth lib)
    password.ts     # scrypt password hashing
    admin-resources.ts  # registry driving the generic admin CRUD UI + API
  data/content.ts   # static fallback content (also the seed source)
```

## Security notes

- Admin sessions are a signed HTTP-only cookie (HMAC with `SESSION_SECRET`),
  verified server-side on every admin page render — not just in middleware.
- Change the seeded admin password after first login if you plan to keep
  using this login flow long-term (there's no in-app "change password" UI yet;
  update it via `prisma db seed` again with a new `SEED_ADMIN_PASSWORD`, or
  directly in Supabase).
