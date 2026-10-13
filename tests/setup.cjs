// Test preload. Inside the app, Next resolves "react" to its bundled React
// build, which exports `cache()` for server code. Plain Node loads React 18.3
// from node_modules, which doesn't, so give server modules a pass-through
// `cache` (no per-request memoisation is needed in unit tests).
const React = require("react");
if (typeof React.cache !== "function") React.cache = (fn) => fn;

// Never let a test reach a real database or Supabase project.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test?connect_timeout=2";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-0123456789";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
process.env.SUPABASE_STORAGE_BUCKET = "uploads";
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
