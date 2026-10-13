import { test } from "node:test";
import assert from "node:assert/strict";
import { isOwnStorageUrl } from "@/lib/supabase-storage";
import { getClientIp } from "@/lib/request";

const base = "https://example-project.supabase.co/storage/v1/object/public/uploads";

test("only files in this site's own storage bucket are accepted as uploads", () => {
  assert.equal(isOwnStorageUrl(`${base}/library/48a5860f-d7dc-47fe-bd88-ffeefa60a153.pdf`), true);
  assert.equal(isOwnStorageUrl(`${base}/news/6f47a635-ed71-4c41-af9a-883f2f1a49b1/full.jpg`), true);
  for (const bad of [
    "https://evil.example/storage/v1/object/public/uploads/news/a.jpg",
    "https://example-project.supabase.co/storage/v1/object/public/other-bucket/news/a.jpg",
    `${base}/../secrets/a.jpg`,
    `${base}/news/%2e%2e/a.jpg`,
    "javascript:alert(1)",
  ]) {
    assert.equal(isOwnStorageUrl(bad), false, bad);
  }
});

test("client IP prefers platform-set headers over spoofable X-Forwarded-For", () => {
  const ip = (headers: Record<string, string>) => getClientIp({ headers: new Headers(headers) });
  assert.equal(ip({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "1.1.1.1" }), "203.0.113.7");
  assert.equal(ip({ "x-vercel-forwarded-for": "203.0.113.8, 10.0.0.1" }), "203.0.113.8");
  assert.equal(ip({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }), "198.51.100.2");
  assert.equal(ip({}), "unknown");
});
