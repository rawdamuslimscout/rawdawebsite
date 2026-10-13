import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const ADMIN_ID = "clxadmin0000000000000001";

test("a freshly signed session token verifies", () => {
  const token = createSessionToken(ADMIN_ID, 3);
  assert.deepEqual(verifySessionToken(token), { adminId: ADMIN_ID, sessionVersion: 3 });
});

test("tampered, forged or expired tokens are rejected", () => {
  const token = createSessionToken(ADMIN_ID, 1);
  const [v, id, exp, ver, sig] = token.split(".");
  const flipped = sig.slice(0, -1) + (sig.endsWith("0") ? "1" : "0");
  assert.equal(verifySessionToken(`${v}.${id}.${exp}.${ver}.${flipped}`), null);
  assert.equal(verifySessionToken(`${v}.${id}.${exp}.${Number(ver) + 1}.${sig}`), null);
  assert.equal(verifySessionToken(`${v}.otheradmin00000000001.${exp}.${ver}.${sig}`), null);
  assert.equal(verifySessionToken("x"), null);
  assert.equal(verifySessionToken(""), null);

  const realNow = Date.now;
  try {
    Date.now = () => realNow() + 9 * 60 * 60 * 1000; // past the 8h lifetime
    assert.equal(verifySessionToken(token), null);
  } finally {
    Date.now = realNow;
  }
});
