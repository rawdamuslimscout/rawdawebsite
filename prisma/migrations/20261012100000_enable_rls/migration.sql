-- Defence in depth: enable Row Level Security on every table in "public",
-- with NO policies (based on the dry-run-tested SQL from chore/rls-hardening).
--
-- APPLY DELIBERATELY: this is a production database change. Apply it on its
-- own with `pnpm prisma migrate deploy` (never `migrate dev` against prod),
-- ideally on a Supabase branch / staging project first.
--
-- Effect:
--   * Prisma connects as the table owner ("postgres", rolbypassrls = true) and
--     RLS is NOT forced, so the website and admin panel keep full access;
--   * the Supabase API roles (anon / authenticated) reached through PostgREST
--     get zero rows and can't write, even after a future accidental GRANT;
--   * Storage (storage.objects) is not touched — uploads use the service-role key.
--
-- Verify after applying:
--   * Supabase Dashboard -> Advisors -> Security: no "RLS disabled in public"
--     errors ("RLS enabled, no policy" notices are expected and intended);
--   * SQL: select relname, relrowsecurity from pg_class c
--          join pg_namespace n on n.oid = c.relnamespace
--          where n.nspname = 'public' and c.relkind = 'r';   -- all true
--   * smoke test: homepage, /structure, /faq, admin login, save one item,
--     upload one image.
--
-- Rollback: the same statements with DISABLE ROW LEVEL SECURITY.
-- Every statement is idempotent (enabling RLS twice is a no-op).
-- No BEGIN/COMMIT: `prisma migrate deploy` already wraps this in a transaction.

ALTER TABLE public."Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Camp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Faq" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GalleryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JoinPricing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JoinSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LibraryResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NewsItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrgAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrgNode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrgPerson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrgQualification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ScoutLeader" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ScoutPlace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ScoutStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteStat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ValueItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
