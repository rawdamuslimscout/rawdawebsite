# Operations runbook: backups, environments, migrations, seed

For whoever maintains rawdamuslimscout.org. Every step here is **manual and deliberate**; nothing in the app runs it automatically.

**Rules of thumb**

- Never paste connection strings, keys or passwords into chat, issues or commits. Commands below read them from environment variables.
- Never run `prisma migrate dev`, `prisma migrate reset`, `prisma db push` or `pnpm db:seed` against production.
- Production credentials belong in Vercel (and a password manager), **not** in the local `.env`.

Placeholders used below (set them in your shell; do not commit them):

| Variable | Meaning |
|---|---|
| `PROD_DIRECT_URL` | Production Postgres, **session** connection (port 5432) from Supabase → Connect |
| `DEV_DIRECT_URL` | The development project's session connection (port 5432) |
| `PROD_SUPABASE_URL`, `PROD_SERVICE_ROLE_KEY` | Production project URL and service-role key (Storage backup only) |
| `DEV_SUPABASE_URL`, `DEV_SERVICE_ROLE_KEY` | Development project URL and service-role key |

---

## 1. Back up production (database + Storage) — do this first, then weekly

Supabase Free has **no automatic backups and no point-in-time recovery**. Until you do this, a mistake cannot be undone.

### 1a. Database

Needs PostgreSQL 15+ client tools (`pg_dump`, `psql`); the Supabase CLI (`supabase db dump`) is an alternative but needs Docker.

```sh
STAMP=$(date +%Y-%m-%d)
mkdir -p "backups/$STAMP"     # keep backups OUTSIDE the repo folder, e.g. an external/cloud drive
pg_dump "$PROD_DIRECT_URL" --schema=public --no-owner --no-privileges \
  --format=custom --file="backups/$STAMP/public.dump"
pg_dump "$PROD_DIRECT_URL" --schema=public --no-owner --no-privileges \
  --format=plain  --file="backups/$STAMP/public.sql"   # human-readable copy
```

- `--schema=public` covers every app table **including `_prisma_migrations`** (migration history travels with the backup).
- Supabase-managed schemas (`auth`, `storage`, …) are not needed: the app does not use Supabase Auth, and Storage files are backed up separately below.
- Read-only: `pg_dump` takes a consistent snapshot and changes nothing.

### 1b. Storage (the `uploads` bucket, ~145 files, ~43 MB today)

Any tool that can list and download a Supabase bucket works (Supabase CLI `supabase storage cp -r --experimental`, or the dashboard for a one-off). A minimal read-only Node script, run from the project folder (it uses `@supabase/supabase-js`, already a dependency):

```js
// save as backup-storage.mjs OUTSIDE the repo, run: node backup-storage.mjs <targetDir>
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const s = createClient(process.env.PROD_SUPABASE_URL, process.env.PROD_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const bucket = "uploads", out = process.argv[2];
async function walk(prefix = "") {
  const { data, error } = await s.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  for (const e of data) {
    const path = prefix ? `${prefix}/${e.name}` : e.name;
    if (!e.id) { await walk(path); continue; }            // folder
    const { data: blob, error: err } = await s.storage.from(bucket).download(path);
    if (err) throw err;
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), Buffer.from(await blob.arrayBuffer()));
    console.log("saved", path);
  }
}
await walk();
```

Afterwards, check the count: it should match the number of objects in the dashboard (Storage → uploads).

### 1c. Where to keep backups

At least two places, one of them off your computer (e.g. a cloud drive owned by the troop, not a personal account). Keep the last 4 weekly copies plus one monthly copy.

---

## 2. Verify a backup by restoring it (into the development project)

A backup you have never restored is not a backup.

```sh
pg_restore --no-owner --no-privileges --clean --if-exists \
  --dbname="$DEV_DIRECT_URL" "backups/$STAMP/public.dump"
```

Then check:

1. `DATABASE_URL="$DEV_DIRECT_URL" DIRECT_URL="$DEV_DIRECT_URL" pnpm prisma migrate status` → *Database schema is up to date*.
2. Row counts match production for a few tables (Supabase → Table editor, or `select count(*)` in both).
3. Run the site locally against the dev project (section 3) and open `/`, `/structure`, `/faq`, `/news`.
4. Optional: upload the Storage backup to the dev project's `uploads` bucket. Note: the restored rows still contain **production** image URLs, so the dev site shows production images (read-only) until the files and URLs are moved. The admin panel only deletes files that belong to the bucket configured in `.env`, so a dev admin can't delete production files.

---

## 3. Separate development project (stop developing against production)

Today the local `.env` points at the production project: saving in the local admin panel edits the live site, and `prisma migrate dev` could offer to **reset** it.

1. Supabase dashboard → New project (Free allows 2 active projects), same region (eu-central-1) as production.
2. In the new project: Storage → New bucket `uploads`, **Public**.
3. Restore the latest backup into it (section 2) — or start empty: `DATABASE_URL=... DIRECT_URL=... pnpm prisma migrate deploy`, then `pnpm db:seed` (the working-tree seed is create-only).
4. Rewrite the local `.env` with the **dev** values only (see `.env.example`):
   - `DATABASE_URL` = dev pooled (port 6543, `?pgbouncer=true`), `DIRECT_URL` = dev session (port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` = dev project
   - a **new** `SESSION_SECRET` (`openssl rand -hex 32`), and a dev-only admin password
5. Move the production values to a password manager. They stay set in Vercel → Settings → Environment Variables (Production).
6. Optional but recommended: in Vercel, give **Preview** deployments the dev project's variables, so preview builds never touch production.

Check: the project ref in `.env` (the part before `.supabase.co`) is no longer the production ref.

---

## 4. Migrations: reconcile history with the repository

### Current state (verified 2026-10-12, read-only)

- Production has 11 migrations applied, the last two on 2026-10-11 22:07 UTC: `20261012100000_enable_rls`, `20261012110000_content_dates_and_news_body`.
- Those two folders exist **only in the working tree** (untracked). Their files match the applied checksums exactly. **Do not edit them.**
- Line-ending mismatch (Git `core.autocrlf=true` converts files on checkout). Prisma stores a SHA-256 of each applied file:

| Migration | Applied as | Stored in Git | Checkout here | Matches production on… |
|---|---|---|---|---|
| `20260924195510_` | LF | LF | CRLF | Linux/CI only (**not** this PC) |
| `…26120000…`, `…26140000…`, `…1001120000…` | CRLF | LF | CRLF | this PC only (**not** Linux/CI) |
| `…0927120000…`, `…0927150000…` | single line | — | — | everywhere |
| `…1004141723_`, `…1004201050_`, `…1005190037_` | LF | LF | LF | everywhere |
| the two new ones | LF | untracked | LF | here now; **not** on a future Windows clone |

`prisma migrate status` does not flag this, `prisma migrate deploy` only applies pending migrations, but **`prisma migrate dev` treats a changed applied migration as drift and offers to reset the database.**

### Fix (one commit, review the diff before committing)

1. Stop Git from converting migration files — create `.gitattributes`:

   ```gitattributes
   # Prisma checksums every applied migration byte for byte: never convert line endings.
   prisma/migrations/**/migration.sql -text
   ```

2. Make each file's bytes equal what production applied:
   - `20260924195510_`: restore the LF version from Git: `git checkout -- prisma/migrations/20260924195510_/migration.sql`
   - the three CRLF-applied ones and the two new ones: keep the current working-tree bytes.
3. Stage exactly those bytes: `git add .gitattributes prisma/migrations` (with `-text`, Git stores the files as they are).
4. Verify **before committing** with a read-only checksum comparison against production (or the dev restore). Every line must say `MATCH`:

   ```sh
   node -e "
   const {PrismaClient}=require('@prisma/client');const fs=require('fs'),c=require('crypto');
   const p=new PrismaClient({datasources:{db:{url:process.env.CHECK_URL}}});
   p.\$queryRawUnsafe('select migration_name, checksum from _prisma_migrations where rolled_back_at is null').then(async rows=>{
     for(const r of rows){const f='prisma/migrations/'+r.migration_name+'/migration.sql';
       console.log((c.createHash('sha256').update(fs.readFileSync(f)).digest('hex')===r.checksum?'MATCH  ':'DIFFERS')+' '+r.migration_name)}
     await p.\$disconnect()})"
   ```

   (`CHECK_URL` = a session connection string; the query only reads `_prisma_migrations`.)
5. Commit; then, on a fresh clone, re-run step 4 to confirm.

### Future schema changes

1. Create the migration against the **dev** project: `pnpm prisma migrate dev --name <what_changed>`.
2. Review the SQL; prefer additive changes (new nullable columns / defaults) so the running code keeps working.
3. Back up production (section 1).
4. Apply to production from a clean checkout: `DATABASE_URL="$PROD_DIRECT_URL" DIRECT_URL="$PROD_DIRECT_URL" pnpm prisma migrate deploy`.
5. Commit the migration folder **in the same change** as the code that uses it, then deploy.
6. Vercel's build never runs migrations (`next build` only) — keep it that way.

---

## 5. Seed script: replace the destructive committed version

| | Committed on `main` (HEAD `1548e7b`) | Working tree (reviewed) |
|---|---|---|
| Admin | creates or **resets the admin password** | creates the admin **only if missing**; never changes a password (`pnpm admin:reset-password` does that, explicitly) |
| Stats, events, camps, milestones, news, gallery, blog, library, join pricing/schedule | **upserted with sample content** (overwrites real edits) | **not seeded at all** |
| Scout stages | `deleteMany` of legacy slugs (**cascades to their leaders**) + upsert with sample text | create-only (`update: {}`): existing stages are never touched |
| Activities, values, site settings | upsert (overwrites) | create-only |

Steps:

1. Review the diff: `git diff HEAD -- prisma/seed.ts prisma/reset-admin-password.ts package.json`.
2. Commit it together with the migrations fix (section 4) so `main` never again contains the destructive version.
3. Even the safe version **writes** (it creates missing rows): run it only against the dev project. Note that `prisma migrate reset` runs the seed automatically after wiping the database — never run `reset` against production.
4. The test `tests/data-integrity.test.ts` ("the seed never overwrites existing rows") guards the new behaviour; keep it passing.

---

## 6. Routine checks (monthly, ~10 minutes)

- Supabase → Usage: database size, egress (cached + uncached), storage size. Note the numbers; a trend matters more than one snapshot.
- Vercel → Usage: function invocations, fast data transfer, image optimization transformations.
- A free uptime monitor on `https://www.rawdamuslimscout.org/` plus one page that reads the database on revalidation (e.g. `/api/news`), which also keeps the Free Supabase project from pausing after 7 days without activity.
- If Supabase paused the project: dashboard → Restore project. Cached pages keep being served meanwhile; admin, new pages and deploys fail until it is restored.
- Restore-test one backup per quarter (section 2).
