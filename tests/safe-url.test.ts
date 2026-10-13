import { test } from "node:test";
import assert from "node:assert/strict";
import { safeHref } from "@/lib/safe-url";

test("safeHref keeps http(s) and site-relative links", () => {
  assert.equal(safeHref("https://example.com/a.pdf"), "https://example.com/a.pdf");
  assert.equal(safeHref("http://example.com/"), "http://example.com/");
  assert.equal(safeHref("/library"), "/library");
});

test("safeHref blocks script, data and protocol-relative links", () => {
  for (const bad of [
    "javascript:alert(1)",
    " JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.example/x",
    "not a url",
  ]) {
    assert.equal(safeHref(bad), "", bad);
  }
  assert.equal(safeHref(""), "");
  assert.equal(safeHref(null), "");
});
