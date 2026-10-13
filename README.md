# فوج روضة الفيحاء — Rawda Al Fayhaa Scout Group

Official website. Next.js (App Router) + TypeScript + Tailwind CSS, RTL-first Arabic,
with a Prisma/Postgres (Supabase) backend and an admin panel for editing content.

The package manager is **pnpm** (pinned via `packageManager` in `package.json`;
`corepack enable` picks the right version). Don't use `npm install` — there is no
`package-lock.json`.

## Run locally

```bash
pnpm install
cp .env.example .env   # then fill in the values (see below)
pnpm dev
```

Open http://localhost:3000. Every page reads its content from the database
through `src/lib/data*.ts` — there is **no static fallback**, so a database
connection is required (a local Postgres or a Supabase branch/staging project
is best for development; avoid pointing a dev machine at production).

`pnpm install` also runs `prisma generate` automatically (via `postinstall`) — this
needs internet access to download Prisma's query-engine binary the first time.

## Connecting Supabase (do this yourself — nothing here connects automatically)

1. Create a Supabase project and grab both connection strings from
   **Project Settings → Database → Connection string**.
2. `cp .env.example .env` and fill in:
   - `DATABASE_URL` — the **pooled** connection (port 6543, `pgbouncer=true`) — used by the running app.
   - `DIRECT_URL` — the **direct** connection (port 5432) — used only by migrations and the seed.
   - `SESSION_SECRET` — a random string of at least 32 characters (`openssl rand -hex 32`) that signs the admin login cookie.
   - `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL (also used to allow Storage URLs in the CSP).
   - `SUPABASE_SERVICE_ROLE_KEY` — the server-only service-role key; never expose it to the browser.
   - `SUPABASE_STORAGE_BUCKET` — optional bucket name, defaulting to `uploads`.
   - `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — the admin login the seed creates
     (pick a non-obvious username, not `admin`).
3. In Supabase Storage, create a public bucket named `uploads` (or use the value of
   `SUPABASE_STORAGE_BUCKET`). Admin uploads are stored under resource folders and
   their public URLs are saved in the database.
4. Apply the migrations and seed the structural content:
   ```bash
   pnpm prisma migrate deploy
   pnpm db:seed
   ```
   The seed only **creates** missing rows (site settings, scout stages, activities,
   values and the admin login); re-running it never overwrites anything edited in
   `/admin` and never changes an existing admin's password. News, events, camps,
   blog posts, gallery, library, join pricing/schedule, stats and milestones are
   not seeded — add the real ones from `/admin`.
5. Restart `pnpm dev`. Anything you edit in `/admin` shows up on the site immediately.

## Migrations and deploys

Migrations — including `20261012100000_enable_rls`, which enables Row Level
Security (no policies) on every table so the Supabase API roles can't read or
write them — are **never applied automatically**. Apply them deliberately with

```bash
pnpm prisma migrate deploy
```

against the production `DIRECT_URL` **before** deploying code that depends on
them, then check **Supabase Dashboard → Advisors → Security**. Don't run
`prisma migrate dev` against production.

## Admin panel

Go to **`/admin`** and log in with the admin username/password. From there you can
edit every piece of content on the site: site settings (name, tagline, contact
info, «عن الفوج» photos), stats, scout stages and their leaders, activities,
events, camps, the activities **map** (places), milestones, values, news, gallery
photos, blog posts, library files, join-us pricing/schedule, the **FAQ**, and the
**organisational structure** (units, people, assignments, qualifications).
Changes save straight to Supabase and appear on the site right away — no
redeploy needed.

Editing uses Next.js **server actions** (`src/app/admin/(protected)/**/actions.ts`)
that check the session, validate input, write to the database, record an audit
log entry and revalidate the affected pages. Uploaded images and files go to
Supabase Storage; files that an item no longer uses are removed from the bucket
(best effort) when the item is deleted or the file is replaced.

### Resetting the admin password

There is no in-app "change password" screen. Set `SEED_ADMIN_USERNAME` /
`SEED_ADMIN_PASSWORD` (in the shell or `.env`) and run:

```bash
pnpm admin:reset-password
```

It updates the password (or creates the admin if missing) and signs out every
existing session of that admin. Re-running the seed does **not** change passwords.

## Adding the real logo

Place the official crest at:

```
public/images/logo.png
```

`src/components/ui/Logo.tsx` already renders it with a white circular backing so
the purple linework stays legible on dark sections (navbar, footer).

## Where content lives

- **The database**, edited via `/admin`. `prisma/schema.prisma` defines every table.
- `src/data/content.ts` holds the starting values the seed uses for structural
  content (and some static UI data); it is not read as a fallback at runtime.

## Structure

```
prisma/
  schema.prisma             # every content table + Admin / AuditLog / RateLimit
  migrations/               # applied with `prisma migrate deploy`
  seed.ts                   # create-only seed of structural content + admin
  reset-admin-password.ts   # `pnpm admin:reset-password`
src/
  app/
    (site)/         # public pages (home, blog, library, join, faq, structure)
    admin/          # login, dashboard, generic resource pages + server actions
    api/            # public read route (/api/[resource]) + login/logout
  components/
    layout/         # Navbar, Footer
    home/           # one component per homepage section
    map/            # Leaflet map (OpenStreetMap tiles) and location picker
    ui/             # reusable cards, section headings, logo, page header
  lib/
    data*.ts        # database reads used by the pages
    prisma.ts       # Prisma client singleton
    session.ts      # signed-cookie admin session (HMAC, no extra auth lib)
    password.ts     # scrypt password hashing
    rate-limit.ts   # Postgres-backed rate limiting (login, uploads)
    supabase-storage.ts # validated uploads + cleanup in Supabase Storage
    admin-resources.ts  # registry driving the generic admin UI
  data/content.ts   # seed source for structural content
```

## Security notes

- Admin sessions are a signed HTTP-only cookie (HMAC with `SESSION_SECRET`).
  Middleware checks the signature and expiry; every admin page, layout and server
  action then re-checks the session against the database (so logout and password
  resets revoke old cookies).
- Login is rate limited per IP, per username+IP, and with a higher per-username
  backstop, so guessing stays bounded without letting anyone lock the admin out.
- A Content-Security-Policy limits remote content to this site, Supabase Storage
  and OpenStreetMap.
