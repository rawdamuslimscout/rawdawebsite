"use client";

/* eslint-disable @next/next/no-img-element */
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Crown,
  Flag,
  GraduationCap,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  Tent,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Qualification = {
  id: string;
  kind: "course" | "education";
  title: string;
  issuer: string;
  year: string;
};
type Person = {
  id: string;
  name: string;
  photoUrl: string;
  rank: string;
  section: string;
  education: string;
  fieldOfStudy: string;
  occupation: string;
  bio: string;
  qualifications: Qualification[];
  positions: { title: string; nodeTitle: string; responsibilities: string }[];
};
type Member = {
  assignmentId: string;
  title: string;
  responsibilities: string;
  person: Person;
};
type StageLeader = {
  id: string;
  name: string;
  rank: string;
  role: string;
  photoUrl: string;
};
export type TreeNode = {
  id: string;
  kind: string;
  title: string;
  description: string;
  logoUrl: string;
  stage: { title: string; ageRange: string } | null;
  stageLeaders: StageLeader[];
  members: Member[];
  children: TreeNode[];
};

const STRUCTURAL = ["association", "governorate", "troop"];
const KIND_LABEL: Record<string, string> = {
  association: "الجمعية",
  governorate: "المفوضية",
  troop: "الفوج",
  dean: "عميد الفوج",
  council: "مجلس الفوج",
  unit: "وحدة",
  other: "",
};
const KIND_ICON: Record<string, typeof Flag> = {
  association: Landmark,
  governorate: MapPin,
  troop: Flag,
};

function Avatar({
  name,
  url,
  size = "h-12 w-12",
}: {
  name: string;
  url: string;
  size?: string;
}) {
  return url ? (
    <img
      src={url}
      alt={name}
      width={96}
      height={96}
      loading="lazy"
      decoding="async"
      className={`${size} shrink-0 rounded-full object-cover ring-2 ring-brand-yellow/70`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-brand-purple-tint font-display text-lg font-bold text-brand-purple`}
    >
      {name.trim().charAt(0)}
    </span>
  );
}

/* ---------- Profile dialog: swipe-to-close bottom sheet on mobile, centered card on larger screens ---------- */
function ProfileDialog({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          "button, [href], [tabindex]:not([tabindex='-1'])",
        );
        if (!f.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const facts: { icon: typeof Award; label: string; value: string }[] = [
    { icon: Award, label: "الرتبة الكشفية", value: person.rank },
    { icon: Layers, label: "المرحلة / القسم", value: person.section },
    { icon: GraduationCap, label: "المؤهل العلمي", value: person.education },
    { icon: BookOpen, label: "التخصص", value: person.fieldOfStudy },
    { icon: Briefcase, label: "المهنة", value: person.occupation },
  ].filter((f) => f.value);
  const duties = person.positions.filter((p) => p.responsibilities);
  const courses = person.qualifications.filter((q) => q.kind === "course");
  const education = person.qualifications.filter((q) => q.kind === "education");

  const timeline = (title: string, items: Qualification[]) =>
    items.length === 0 ? null : (
      <section>
        <h3 className="font-display text-base font-bold text-brand-ink">
          {title}
        </h3>
        <ol className="mt-3 space-y-4 border-s-2 border-brand-purple/15 ps-5">
          {items.map((q) => (
            <li key={q.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -start-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-purple"
              />
              <p className="text-sm font-semibold leading-6 text-brand-ink">
                {q.title}
              </p>
              {(q.issuer || q.year) && (
                <p className="text-xs text-brand-ink/55">
                  {[q.issuer, q.year].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    );

  // Swipe down on the grab handle / header to dismiss (mobile).
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    if (dragY > 100) onClose();
    else setDragY(0);
    startY.current = null;
  };

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end justify-center bg-brand-ink/60 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:p-6 ${shown ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        tabIndex={-1}
        style={
          dragY
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : undefined
        }
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift outline-none transition duration-300 motion-reduce:transition-none sm:max-w-2xl sm:rounded-3xl ${shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div
          className="relative shrink-0 bg-brand-purple-dark text-white"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex justify-center pt-2.5 sm:hidden"
            aria-hidden="true"
          >
            <span className="h-1.5 w-12 rounded-full bg-white/30" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute start-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:pb-8 sm:pt-8 sm:text-start">
            <Avatar
              name={person.name}
              url={person.photoUrl}
              size="h-28 w-28 sm:h-32 sm:w-32 ring-4"
            />
            <div className="min-w-0">
              <h2
                id="profile-title"
                className="font-display text-2xl font-bold leading-snug sm:text-3xl"
              >
                {person.name}
              </h2>
              <ul className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {person.positions.map((p, i) => (
                  <li
                    key={i}
                    className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-purple-dark"
                  >
                    {p.title}
                    <span className="font-medium opacity-70">
                      {" "}
                      · {p.nodeTitle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8 overflow-y-auto overscroll-contain px-6 py-7 sm:px-8">
          {facts.length > 0 && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl bg-brand-cream p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-purple">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-brand-ink/55">{label}</dt>
                    <dd className="text-sm font-semibold leading-6 text-brand-ink">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
          {person.bio && (
            <section>
              <h3 className="font-display text-base font-bold text-brand-ink">
                نبذة
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-8 text-brand-ink/75">
                {person.bio}
              </p>
            </section>
          )}
          {duties.length > 0 && (
            <section>
              <h3 className="font-display text-base font-bold text-brand-ink">
                المهام والمسؤوليات
              </h3>
              <ul className="mt-3 space-y-3">
                {duties.map((p, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-brand-purple/10 p-4"
                  >
                    <p className="text-sm font-bold text-brand-purple">
                      {p.title}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-7 text-brand-ink/70">
                      {p.responsibilities}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {timeline("الدورات التدريبية", courses)}
          {timeline("المؤهلات العلمية", education)}
          {facts.length === 0 &&
            !person.bio &&
            duties.length === 0 &&
            courses.length === 0 &&
            education.length === 0 && (
              <p className="py-4 text-center text-sm text-brand-ink/55">
                لا تتوفر معلومات إضافية حاليًا.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Building blocks ---------- */
function PersonCard({
  m,
  onOpen,
  big,
}: {
  m: Member;
  onOpen: (p: Person) => void;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(m.person)}
      className={`group flex h-full w-full gap-4 rounded-2xl border border-brand-purple/10 bg-white text-start shadow-soft transition hover:-translate-y-0.5 hover:border-brand-purple/30 motion-reduce:transform-none ${
        big
          ? "flex-col items-center p-6 text-center sm:flex-row sm:items-center sm:p-8 sm:text-start"
          : "items-start p-4"
      }`}
    >
      <Avatar
        name={m.person.name}
        url={m.person.photoUrl}
        size={big ? "h-24 w-24 sm:h-28 sm:w-28" : "h-14 w-14"}
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block font-display font-bold text-brand-ink ${big ? "text-xl sm:text-2xl" : "text-base"}`}
        >
          {m.person.name}
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-brand-purple">
          {m.title}
        </span>
        {/* {m.person.rank && (
          <span className="block text-xs text-brand-ink/55">
            {m.person.rank}
          </span>
        )} */}
        {m.responsibilities && (
          <span
            className={`mt-2 block text-xs leading-6 text-brand-ink/65 ${big ? "" : "border-t border-brand-purple/10 pt-2"}`}
          >
            {m.responsibilities}
          </span>
        )}
        <span className="mt-2 inline-block text-xs font-bold text-brand-purple opacity-80 group-hover:opacity-100">
          عرض الملف التعريفي ←
        </span>
      </span>
    </button>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  hint,
  children,
}: {
  id: string;
  icon: typeof Flag;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple text-brand-yellow">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2
            id={`${id}-h`}
            className="font-display text-xl font-bold text-brand-ink sm:text-2xl"
          >
            {title}
          </h2>
          {hint && <p className="text-xs text-brand-ink/55">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MemberGrid({
  members,
  onOpen,
}: {
  members: Member[];
  onOpen: (p: Person) => void;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <li key={m.assignmentId}>
          <PersonCard m={m} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

/* ---------- Units ---------- */
function UnitCard({
  node,
  onOpen,
}: {
  node: TreeNode;
  onOpen: (p: Person) => void;
}) {
  const hasPeople = node.members.length > 0 || node.stageLeaders.length > 0;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/10 bg-white shadow-soft">
      <div
        className="h-1.5 bg-gradient-to-l from-brand-yellow to-brand-purple"
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple-tint text-brand-purple">
            <Tent className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-brand-ink">
              {node.title}
            </h3>
            {node.stage && (
              <p className="text-xs text-brand-ink/55">
                {node.stage.title}
                {node.stage.ageRange ? ` · ${node.stage.ageRange}` : ""}
              </p>
            )}
          </div>
        </div>
        {node.description && (
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-brand-ink/70">
            {node.description}
          </p>
        )}
        {hasPeople && (
          <ul className="mt-4 space-y-2 border-t border-brand-purple/10 pt-4">
            {node.members.map((m) => (
              <li key={m.assignmentId}>
                <button
                  type="button"
                  onClick={() => onOpen(m.person)}
                  className="flex w-full items-center gap-3 rounded-xl p-1.5 text-start hover:bg-brand-purple-tint"
                >
                  <Avatar
                    name={m.person.name}
                    url={m.person.photoUrl}
                    size="h-10 w-10"
                  />
                  <span className="text-sm">
                    <span className="block font-semibold text-brand-ink">
                      {m.person.name}
                    </span>
                    <span className="text-xs text-brand-purple">{m.title}</span>
                  </span>
                </button>
              </li>
            ))}
            {node.stageLeaders.map((l) => (
              <li key={l.id} className="flex items-center gap-3 p-1.5">
                <Avatar name={l.name} url={l.photoUrl} size="h-10 w-10" />
                <span className="text-sm">
                  <span className="block font-semibold text-brand-ink">
                    {l.name}
                  </span>
                  <span className="text-xs text-brand-ink/55">
                    {l.role || l.rank}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {node.children.length > 0 && (
          <ul
            className="mt-4 flex flex-wrap gap-2"
            aria-label={`ما يتبع ${node.title}`}
          >
            {node.children.map((c) => (
              <li
                key={c.id}
                className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-ink/75"
              >
                {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/* ---------- Page body ---------- */
function Branch({
  root,
  onOpen,
}: {
  root: TreeNode;
  onOpen: (p: Person) => void;
}) {
  // Follow the single structural line (association → governorate → troop). If it forks, stop and show all branches below.
  const chain = [root];
  let last = root;
  while (
    last.children.length === 1 &&
    STRUCTURAL.includes(last.children[0].kind)
  ) {
    last = last.children[0];
    chain.push(last);
  }
  const by = (k: string) => last.children.filter((c) => c.kind === k);
  const deans = by("dean"),
    councils = by("council"),
    units = by("unit");
  const others = last.children.filter(
    (c) => !["dean", "council", "unit"].includes(c.kind),
  );

  return (
    <div className="space-y-12">
      {deans.map((d) => (
        <Section
          key={d.id}
          id={`dean-${root.id}`}
          icon={Crown}
          title={d.title || "عميد الفوج"}
          hint={d.description || undefined}
        >
          {d.members.length ? (
            <ul className="grid gap-4">
              {d.members.map((m) => (
                <li key={m.assignmentId}>
                  <PersonCard m={m} onOpen={onOpen} big />
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ))}

      {(councils.length > 0 || last.members.length > 0) && (
        <div id={`council-${root.id}`} className="scroll-mt-24 space-y-10">
          {last.members.length > 0 && (
            <Section id={`team-${root.id}`} icon={Users} title="القيادة">
              <MemberGrid members={last.members} onOpen={onOpen} />
            </Section>
          )}
          {councils.map((c) => (
            <Section
              key={c.id}
              id={`c-${c.id}`}
              icon={ShieldCheck}
              title={c.title || "مجلس الفوج"}
              hint={c.description || undefined}
            >
              {c.members.length ? (
                <MemberGrid members={c.members} onOpen={onOpen} />
              ) : null}
            </Section>
          ))}
        </div>
      )}

      {units.length > 0 && (
        <Section
          id={`units-${root.id}`}
          icon={Tent}
          title="وحدات الفوج"
          hint={`${units.length} ${units.length === 1 ? "وحدة" : "وحدات"}`}
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((u) => (
              <li key={u.id}>
                <UnitCard node={u} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {others.length > 0 && (
        <Section id={`more-${root.id}`} icon={UserRound} title="فروع أخرى">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((u) => (
              <li key={u.id}>
                <UnitCard node={u} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default function StructureTree({ roots }: { roots: TreeNode[] }) {
  const [person, setPerson] = useState<Person | null>(null);
  const close = useCallback(() => setPerson(null), []);
  return (
    <>
      <div className="space-y-16">
        {roots.map((r) => (
          <Branch key={r.id} root={r} onOpen={setPerson} />
        ))}
      </div>
      {person && <ProfileDialog person={person} onClose={close} />}
    </>
  );
}
