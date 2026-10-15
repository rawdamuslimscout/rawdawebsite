import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const request = (path: string, cookie?: string) =>
  new NextRequest(`https://www.rawdamuslimscout.org${path}`, {
    headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {},
  });

const redirectsToLogin = (res: Response) =>
  res.status >= 300 &&
  res.status < 400 &&
  new URL(res.headers.get("location")!).pathname === "/admin/login";

test("admin pages without a session cookie redirect to login", async () => {
  assert.ok(redirectsToLogin(await middleware(request("/admin"))));
  assert.ok(redirectsToLogin(await middleware(request("/admin/org-people"))));
});

test("a forged or malformed session cookie no longer passes the middleware", async () => {
  assert.ok(redirectsToLogin(await middleware(request("/admin/org-people", "x"))));
  const forged = createSessionToken("clxadmin0000000000000001", 1).replace(/\.[0-9a-f]+$/, ".deadbeef");
  assert.ok(redirectsToLogin(await middleware(request("/admin/faqs", forged))));
});

test("a validly signed cookie and the login page pass through", async () => {
  const token = createSessionToken("clxadmin0000000000000001", 1);
  assert.equal((await middleware(request("/admin/faqs", token))).headers.get("location"), null);
  assert.equal((await middleware(request("/admin/login"))).headers.get("location"), null);
});

test("security headers are set and remote sources are not wildcarded", async () => {
  const res = await middleware(request("/"));
  const csp = res.headers.get("content-security-policy") ?? "";
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'self'/);
  for (const directive of ["img-src", "connect-src", "frame-src", "media-src"]) {
    const value = csp.split(";").find((d) => d.trim().startsWith(directive)) ?? "";
    assert.ok(!/\shttps:(\s|$)/.test(value), `${directive} must not allow every https: origin`);
  }
  // OneDrive is allowed as a frame (library previews) and nowhere else.
  const directive = (name: string) => csp.split(";").find((d) => d.trim().startsWith(name)) ?? "";
  assert.match(directive("frame-src"), /https:\/\/onedrive\.live\.com/);
  for (const name of ["script-src", "connect-src", "img-src", "default-src"]) {
    assert.ok(!/onedrive|1drv/.test(directive(name)), `${name} must not allow OneDrive`);
  }
  assert.ok(res.headers.get("strict-transport-security"));
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
});
