import { test } from "node:test";
import assert from "node:assert/strict";
import { extractOneDriveUrl, parseOneDriveUrl } from "@/lib/onedrive";
import { coerceValues, getResourceConfig } from "@/lib/admin-resources";

const library = getResourceConfig("library")!;
const getter = (values: Record<string, unknown>) => (name: string) => values[name];

test("legacy onedrive.live.com embed URLs are previewable", () => {
  const url = "https://onedrive.live.com/embed?resid=ABC%21123&authkey=%21XYZ&em=2";
  assert.deepEqual(parseOneDriveUrl(url), { openUrl: url, embedUrl: url });
});

test("1drv.ms embed URLs are previewable and open as the plain share link", () => {
  const link = parseOneDriveUrl("https://1drv.ms/b/c/abc123/EaBcD?e=xYz&embed=1&em=2");
  assert.equal(link?.embedUrl, "https://1drv.ms/b/c/abc123/EaBcD?e=xYz&embed=1&em=2");
  assert.equal(link?.openUrl, "https://1drv.ms/b/c/abc123/EaBcD?e=xYz");
});

test("plain share links and SharePoint links are open-only (never framed)", () => {
  assert.deepEqual(parseOneDriveUrl("https://1drv.ms/b/c/abc123/EaBcD?e=xYz"), {
    openUrl: "https://1drv.ms/b/c/abc123/EaBcD?e=xYz",
    embedUrl: null,
  });
  const sp = "https://contoso-my.sharepoint.com/:b:/g/personal/x/EaBcD?e=1";
  assert.deepEqual(parseOneDriveUrl(sp), { openUrl: sp, embedUrl: null });
});

test("the src is taken from pasted OneDrive embed code", () => {
  const code =
    '<iframe src="https://onedrive.live.com/embed?resid=A&amp;authkey=B&amp;em=2" width="476" height="288" frameborder="0" scrolling="no"></iframe>';
  assert.equal(extractOneDriveUrl(code), "https://onedrive.live.com/embed?resid=A&authkey=B&em=2");
  assert.equal(parseOneDriveUrl(code)?.embedUrl, "https://onedrive.live.com/embed?resid=A&authkey=B&em=2");
});

test("non-OneDrive, insecure and script URLs are rejected", () => {
  for (const bad of [
    "",
    "http://onedrive.live.com/embed?resid=A",
    "https://onedrive.live.com.evil.example/embed",
    "https://evil.example/onedrive.live.com/embed",
    "https://user:pass@onedrive.live.com/embed",
    "https://onedrive.live.com:8443/embed",
    "https://sharepoint.com.evil.example/x",
    "javascript:alert(1)",
    "data:text/html,x",
    '<iframe src="https://evil.example/x"></iframe>',
    "<iframe></iframe>",
  ]) {
    assert.equal(parseOneDriveUrl(bad), null, bad);
  }
  assert.equal(parseOneDriveUrl(null), null);
});

test("admin form stores the validated OneDrive URL and rejects other hosts", () => {
  const code = '<iframe src="https://1drv.ms/b/c/a/B?embed=1"></iframe>';
  assert.equal(
    coerceValues(library, getter({ oneDriveUrl: code })).oneDriveUrl,
    "https://1drv.ms/b/c/a/B?embed=1",
  );
  assert.equal(coerceValues(library, getter({ oneDriveUrl: "" })).oneDriveUrl, "");
  for (const bad of ["https://example.com/guide.pdf", "javascript:alert(1)"]) {
    assert.throws(() => coerceValues(library, getter({ oneDriveUrl: bad })), bad);
  }
});
