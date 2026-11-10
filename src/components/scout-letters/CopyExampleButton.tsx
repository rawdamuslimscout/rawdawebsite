"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { translator, type Lang } from "@/data/scoutLetters";

type Status = "idle" | "copied" | "failed";

/** Older browsers / non-secure origins have no async clipboard. */
function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}

/** Select the visible example so the visitor can copy it by hand. */
function selectElementText(id: string) {
  const el = document.getElementById(id);
  const selection = window.getSelection();
  if (!el || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default function CopyExampleButton({
  text,
  targetId,
  lang = "ar",
}: {
  text: string;
  /** Id of the element showing the text, selected if copying fails. */
  targetId: string;
  lang?: Lang;
}) {
  const t = translator(lang);
  const [status, setStatus] = useState<Status>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    if (!ok) selectElementText(targetId);
    setStatus(ok ? "copied" : "failed");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), ok ? 3000 : 6000);
  };

  const copied = status === "copied";

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={copy}
        className={`btn ${
          copied
            ? "bg-brand-turquoise-dark text-white"
            : "bg-brand-purple text-white hover:bg-brand-purple-dark hover:shadow-lg"
        }`}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? t("تم النسخ", "Copied") : t("انسخ المثال", "Copy the example")}
      </button>

      {/* Announced to screen readers and shown to everyone. */}
      <p
        role="status"
        aria-live="polite"
        className={`text-sm font-semibold ${
          status === "failed" ? "text-red-700" : "text-brand-turquoise-dark"
        }`}
      >
        {status === "copied" &&
          t(
            "نُسخ المثال. الصقه في محادثة جديدة داخل Claude.",
            "Example copied. Paste it into a new chat in Claude.",
          )}
        {status === "failed" &&
          t(
            "تعذّر النسخ التلقائي. حدّدنا النص، انسخه يدويًا.",
            "Couldn't copy automatically. The text is selected; copy it by hand.",
          )}
      </p>
    </div>
  );
}
