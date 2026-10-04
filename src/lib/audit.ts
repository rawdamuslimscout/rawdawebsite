import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  adminId?: string | null;
  resource?: string;
  targetId?: string;
  ip?: string;
  /** Small, non-sensitive details only. Never pass passwords, tokens or secrets. */
  meta?: Record<string, string | number | boolean | null>;
};

/** Structured log line (visible in Vercel logs) + durable DB record. Never throws. */
export async function audit(input: AuditInput) {
  const meta = input.meta ? JSON.stringify(input.meta).slice(0, 500) : "";
  console.log(JSON.stringify({ type: "audit", ts: new Date().toISOString(), ...input, meta: undefined, details: input.meta }));
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action.slice(0, 60),
        adminId: input.adminId ?? null,
        resource: input.resource?.slice(0, 60),
        targetId: input.targetId?.slice(0, 60),
        ip: input.ip?.slice(0, 64),
        meta,
      },
    });
  } catch (err) {
    console.error("[audit] could not persist record", err instanceof Error ? err.message : err);
  }
}
