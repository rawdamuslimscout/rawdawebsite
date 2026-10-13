import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  INITIAL_IMAGE_STATE,
  advanceImage,
  imageSources,
  watchImage,
  type ImageSource,
  type ImageState,
  type WatchedImage,
} from "@/lib/image-url";
import SafeImage from "@/components/ui/SafeImage";

// The test runner compiles JSX with the classic runtime (React.createElement
// at render time); in the app, Next provides it automatically.
(globalThis as { React?: typeof React }).React = React;

const BASE = "https://example-project.supabase.co/storage/v1/object/public/uploads";
const UUID = "a8515b4f-1baf-4e57-8ef1-9ce367d05b1e";
const FULL = `${BASE}/gallery/${UUID}/full.jpg`;
const THUMB = `${BASE}/gallery/${UUID}/thumb.jpg`;
const LEGACY = `${BASE}/gallery/4fd78e8f-9dda-4fef-bd26-d85045ab7efa-1000689856.jpg`;
// Sibling thumbnail of a legacy single-file upload (see lib/image-url.ts).
const LEGACY_THUMB = `${BASE}/gallery/4fd78e8f-9dda-4fef-bd26-d85045ab7efa-1000689856.thumb.jpg`;

/* ------------------------------------------------------------------ */
/* A tiny browser model: an <img> that loads one URL and either        */
/* succeeds or fires "error", driven through the real watchImage() and */
/* advanceImage() that SafeImage uses.                                 */
/* ------------------------------------------------------------------ */

class FakeImage extends EventTarget implements WatchedImage {
  complete = false;
  naturalWidth = 0;
  currentSrc = "";
  constructor(public src: string) {
    super();
  }
  finish(ok: boolean) {
    this.complete = true;
    this.naturalWidth = ok ? 640 : 0;
    this.dispatchEvent(new Event(ok ? "load" : "error"));
  }
}

type Outcome = { shown: string; requested: string[] };

/**
 * Plays the fallback chain the way the page does: render the current source,
 * let the "browser" pick a URL (srcset: `pick`), answer it from `ok`, and
 * advance on failure. `errorBeforeWatch` reproduces an error that fired before
 * React hydrated (the listener is attached after the image already failed).
 */
function play(
  sources: ImageSource[],
  ok: (url: string) => boolean,
  { pick = "thumb", errorBeforeWatch = false }: { pick?: "thumb" | "full"; errorBeforeWatch?: boolean } = {},
): Outcome {
  let state: ImageState = INITIAL_IMAGE_STATE;
  const requested: string[] = [];
  for (let guard = 0; guard < 20; guard++) {
    const source = sources[state.index];
    if (!source) return { shown: "placeholder", requested };
    const url = source.srcSet && pick === "full" ? FULL : source.src;
    const img = new FakeImage(source.src);
    img.currentSrc = url;
    requested.push(url);
    const index = state.index;
    const onFail = (failedUrl: string) => {
      state = advanceImage(sources, state, index, failedUrl);
    };
    if (errorBeforeWatch) {
      img.finish(ok(url)); // the error happens first...
      watchImage(img, onFail); // ...then the component mounts and attaches
    } else {
      watchImage(img, onFail);
      img.finish(ok(url));
    }
    if (ok(url)) return { shown: url, requested };
  }
  throw new Error("fallback chain did not settle (loop)");
}

const only = (...good: string[]) => (url: string) => good.includes(url);

test("a broken thumbnail falls back to the original", () => {
  for (const variant of ["responsive", "thumb"] as const) {
    assert.deepEqual(play(imageSources(FULL, variant), only(FULL)), { shown: FULL, requested: [THUMB, FULL] }, variant);
  }
});

test("a broken original falls back to a valid thumbnail (wide tiles pick the original)", () => {
  assert.deepEqual(play(imageSources(FULL, "responsive"), only(THUMB), { pick: "full" }), {
    shown: THUMB,
    requested: [FULL, THUMB],
  });
  assert.deepEqual(play(imageSources(FULL, "original"), only(THUMB)), { shown: THUMB, requested: [FULL, THUMB] });
});

test("when every file fails, the placeholder shows and no URL is requested twice", () => {
  const cases = [["responsive", "thumb"], ["responsive", "full"], ["thumb", "thumb"], ["original", "thumb"]] as const;
  for (const [variant, pick] of cases) {
    const out = play(imageSources(FULL, variant), () => false, { pick });
    assert.equal(out.shown, "placeholder", `${variant}/${pick}`);
    assert.equal(new Set(out.requested).size, out.requested.length, `duplicate request ${out.requested}`);
    assert.ok(out.requested.length <= 2, `${variant}/${pick}: ${out.requested.length} requests`);
  }
});

test("legacy uploads use their sibling thumbnail when it exists", () => {
  assert.deepEqual(play(imageSources(LEGACY), only(LEGACY, LEGACY_THUMB)), { shown: LEGACY_THUMB, requested: [LEGACY_THUMB] });
});

test("a legacy upload whose sibling thumbnail is missing still shows the original", () => {
  for (const variant of ["responsive", "thumb"] as const) {
    assert.deepEqual(play(imageSources(LEGACY, variant), only(LEGACY)), { shown: LEGACY, requested: [LEGACY_THUMB, LEGACY] }, variant);
  }
  // Full-size viewers ask for the original first and never need the thumbnail.
  assert.deepEqual(play(imageSources(LEGACY, "original"), only(LEGACY)), { shown: LEGACY, requested: [LEGACY] });
});

test("a legacy upload with neither file shows the placeholder after at most two requests", () => {
  assert.deepEqual(play(imageSources(LEGACY), () => false), { shown: "placeholder", requested: [LEGACY_THUMB, LEGACY] });
});

test("an error that fired before hydration is still caught and handled", () => {
  assert.deepEqual(play(imageSources(FULL, "thumb"), only(FULL), { errorBeforeWatch: true }), {
    shown: FULL,
    requested: [THUMB, FULL],
  });
  assert.equal(play(imageSources(LEGACY), () => false, { errorBeforeWatch: true }).shown, "placeholder");
});

test("watchImage ignores lazy images that haven't loaded and successful loads", () => {
  const calls: string[] = [];
  const lazy = new FakeImage(FULL); // complete === false: not requested yet
  watchImage(lazy, (u) => calls.push(u));
  assert.deepEqual(calls, []);
  lazy.finish(true);
  assert.deepEqual(calls, []);
});

test("watchImage reports each failure once, with the URL the browser actually chose", () => {
  const calls: string[] = [];
  const img = new FakeImage(THUMB);
  img.currentSrc = FULL; // srcset picked the original
  watchImage(img, (u) => calls.push(u));
  img.finish(false);
  img.dispatchEvent(new Event("error")); // repeated event
  assert.deepEqual(calls, [FULL]);
});

test("watchImage's cleanup stops listening (no updates after unmount)", () => {
  const calls: string[] = [];
  const img = new FakeImage(FULL);
  const stop = watchImage(img, (u) => calls.push(u));
  stop();
  img.finish(false);
  assert.deepEqual(calls, []);
});

test("late errors from an earlier attempt never skip the source on screen", () => {
  const sources = imageSources(FULL, "responsive");
  const s1 = advanceImage(sources, INITIAL_IMAGE_STATE, 0, THUMB); // now showing the original
  assert.equal(s1.index, 1);
  assert.equal(advanceImage(sources, s1, 0, THUMB), s1); // stale error: ignored
});

test("missing, blank, unsafe or malformed URLs go straight to the placeholder", () => {
  for (const bad of [undefined, null, "", "   ", "javascript:alert(1)", "data:image/png;base64,AAAA", "//evil.example/x.jpg", "not a url"]) {
    assert.deepEqual(imageSources(bad), [], String(bad));
  }
  assert.deepEqual(imageSources("/images/logo.png"), [{ src: "/images/logo.png" }]);
});

/* ------------------------------------------------------------------ */
/* What SafeImage renders, and that it is wired to the tested logic    */
/* ------------------------------------------------------------------ */

const render = (props: Record<string, unknown>) =>
  renderToStaticMarkup(createElement(SafeImage, props as never));

test("SafeImage first renders the thumbnail srcset (sizes and loading before srcset/src)", () => {
  const html = render({ src: FULL, alt: "صورة", sizes: "50vw", loading: "lazy", className: "h-full w-full" });
  assert.match(html, /^<img /);
  assert.ok(html.indexOf('sizes="50vw"') < html.indexOf("srcSet="), html);
  assert.ok(html.indexOf('loading="lazy"') < html.indexOf("srcSet="), html);
  assert.ok(html.includes(`src="${THUMB}"`), html);
});

test("SafeImage without a usable URL shows a named placeholder that keeps the image's box", () => {
  const html = render({ src: "", alt: "خيمة المخيم", className: "h-full w-full object-cover" });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="خيمة المخيم"/);
  assert.match(html, /h-full w-full/);
  assert.match(render({ src: "javascript:alert(1)", alt: "" }), /aria-hidden="true"/);
  assert.equal(render({ src: null, alt: "", fallback: createElement("span", null, "م") }), "<span>م</span>");
  assert.equal(render({ src: null, alt: "", fallback: null }), "");
});

test("SafeImage is wired to watchImage/advanceImage (guards against bypassing the tested logic)", () => {
  // No DOM test environment is installed, so the component's wiring is checked
  // at source level, like the admin-session guard in data-integrity.test.ts.
  const source = readFileSync("src/components/ui/SafeImage.tsx", "utf8");
  assert.match(source, /ref=\{ref\}/, "the rendered <img> must carry the ref watchImage observes");
  assert.match(source, /watchImage\(img,/, "errors must be detected through watchImage()");
  assert.match(source, /advanceImage\(/, "failures must advance through advanceImage()");
  assert.match(source, /sources\[state\.index\]/, "the rendered source must follow the fallback state");
  assert.doesNotMatch(source, /onError=/, "a React onError handler would miss errors before hydration");
});
