import { prisma } from "@/lib/prisma";
import { safeHref } from "@/lib/safe-url";

export type PublicQualification = { id: string; kind: "course" | "education"; title: string; issuer: string; year: string };

export type PublicPerson = {
  id: string;
  name: string;
  photoUrl: string;
  rank: string;
  section: string;
  education: string;
  fieldOfStudy: string;
  occupation: string;
  bio: string;
  qualifications: PublicQualification[];
  /** Every published position this person holds (so a profile can show all of them). */
  positions: { title: string; nodeTitle: string }[];
};

export type PublicMember = { assignmentId: string; title: string; responsibilities: string; person: PublicPerson };
export type StageLeader = { id: string; name: string; rank: string; role: string; photoUrl: string };

export type PublicNode = {
  id: string;
  kind: string;
  title: string;
  description: string;
  logoUrl: string;
  stage: { title: string; ageRange: string } | null;
  stageLeaders: StageLeader[];
  members: PublicMember[];
  children: PublicNode[];
};

export const KIND_LABELS: Record<string, string> = {
  association: "الجمعية",
  governorate: "المفوضية",
  troop: "الفوج",
  dean: "عميد الفوج",
  council: "مجلس الفوج",
  unit: "وحدة",
  other: "",
};

/**
 * Builds the public tree. Only published nodes reachable through published
 * ancestors are included; only published assignments of public people are
 * included; no private columns are ever selected.
 */
export async function getPublicStructure(): Promise<{ roots: PublicNode[]; failed: boolean }> {
  try {
    const [nodes, assignments] = await Promise.all([
      prisma.orgNode.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { title: "asc" }],
        select: {
          id: true, parentId: true, kind: true, title: true, description: true, logoUrl: true,
          stage: {
            select: {
              title: true, ageRange: true,
              leaders: { orderBy: { order: "asc" }, select: { id: true, name: true, rank: true, role: true, photoUrl: true } },
            },
          },
        },
      }),
      prisma.orgAssignment.findMany({
        where: { isPublished: true, node: { isPublished: true }, person: { isPublic: true } },
        orderBy: [{ order: "asc" }],
        select: {
          id: true, nodeId: true, title: true, responsibilities: true,
          node: { select: { title: true } },
          person: {
            select: {
              id: true, fullName: true, photoUrl: true, rank: true, section: true,
              education: true, fieldOfStudy: true, occupation: true, bio: true,
              showEducation: true, showOccupation: true,
              qualifications: {
                orderBy: { order: "asc" },
                select: { id: true, kind: true, title: true, issuer: true, year: true },
              },
            },
          },
        },
      }),
    ]);

    // Positions per person across all published assignments.
    const positionsByPerson = new Map<string, { title: string; nodeTitle: string }[]>();
    for (const a of assignments) {
      const list = positionsByPerson.get(a.person.id) ?? [];
      list.push({ title: a.title, nodeTitle: a.node.title });
      positionsByPerson.set(a.person.id, list);
    }

    const membersByNode = new Map<string, PublicMember[]>();
    for (const a of assignments) {
      const p = a.person;
      const person: PublicPerson = {
        id: p.id,
        name: p.fullName,
        photoUrl: safeHref(p.photoUrl),
        rank: p.rank,
        section: p.section,
        education: p.showEducation ? p.education : "",
        fieldOfStudy: p.showEducation ? p.fieldOfStudy : "",
        occupation: p.showOccupation ? p.occupation : "",
        bio: p.bio,
        qualifications: p.qualifications
          .filter((q) => q.kind === "course" || (q.kind === "education" && p.showEducation))
          .map((q) => ({ ...q, kind: q.kind as "course" | "education" })),
        positions: positionsByPerson.get(p.id) ?? [],
      };
      const list = membersByNode.get(a.nodeId) ?? [];
      list.push({ assignmentId: a.id, title: a.title, responsibilities: a.responsibilities, person });
      membersByNode.set(a.nodeId, list);
    }

    const byId = new Map<string, PublicNode>();
    for (const n of nodes) {
      byId.set(n.id, {
        id: n.id,
        kind: n.kind,
        title: n.title,
        description: n.description,
        logoUrl: safeHref(n.logoUrl),
        stage: n.stage ? { title: n.stage.title, ageRange: n.stage.ageRange } : null,
        stageLeaders: (n.stage?.leaders ?? []).map((l) => ({ ...l, photoUrl: safeHref(l.photoUrl) })),
        members: membersByNode.get(n.id) ?? [],
        children: [],
      });
    }
    const roots: PublicNode[] = [];
    for (const n of nodes) {
      const node = byId.get(n.id)!;
      const parent = n.parentId ? byId.get(n.parentId) : undefined;
      if (parent) parent.children.push(node);
      else if (!n.parentId) roots.push(node);
      // A published node whose parent is unpublished is dropped (not exposed).
    }
    return { roots, failed: false };
  } catch (err) {
    console.error("[data] getPublicStructure failed", err instanceof Error ? err.message : err);
    return { roots: [], failed: true };
  }
}
