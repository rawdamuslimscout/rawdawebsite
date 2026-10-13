import { test } from "node:test";
import assert from "node:assert/strict";

import { isTransientDbError, retryRead } from "@/lib/db-retry";

const prismaError = (code: string, message = "boom") => Object.assign(new Error(message), { code });
const fast = { baseDelayMs: 1, retries: 2 };

test("connection-level Prisma errors count as transient; query errors don't", () => {
  for (const code of ["P1001", "P1002", "P1008", "P1017", "P2024"]) {
    assert.equal(isTransientDbError(prismaError(code)), true, code);
  }
  assert.equal(isTransientDbError(Object.assign(new Error("init"), { errorCode: "P1001" })), true);
  assert.equal(isTransientDbError(new Error("Can't reach database server at `host:6543`")), true);
  for (const code of ["P2002", "P2022", "P2025"]) {
    assert.equal(isTransientDbError(prismaError(code)), false, code);
  }
  assert.equal(isTransientDbError(new Error("The column `NewsItem.body` does not exist")), false);
  assert.equal(isTransientDbError(null), false);
});

test("a transient failure is retried and the read then succeeds", async () => {
  let calls = 0;
  const result = await retryRead("t", async () => {
    calls++;
    if (calls < 3) throw prismaError("P1001");
    return "rows";
  }, fast);
  assert.equal(result, "rows");
  assert.equal(calls, 3);
});

test("a lasting outage still throws the original error after the last retry", async () => {
  let calls = 0;
  const err = prismaError("P1001");
  await assert.rejects(
    retryRead("t", async () => {
      calls++;
      throw err;
    }, fast),
    (e) => e === err,
  );
  assert.equal(calls, 3); // 1 attempt + 2 retries, never more
});

test("non-transient errors are not retried", async () => {
  let calls = 0;
  await assert.rejects(
    retryRead("t", async () => {
      calls++;
      throw prismaError("P2022", "column does not exist");
    }, fast),
  );
  assert.equal(calls, 1);
});
