import { test } from "node:test";
import assert from "node:assert/strict";

import { legacyThumbPath, thumbUrl } from "@/lib/image-url";
import { isOwnStorageUrl, storagePathsToRemove } from "@/lib/supabase-storage";

// tests/setup.cjs points the site at this Supabase project and bucket.
const ORIGIN = "https://example-project.supabase.co";
const BASE = `${ORIGIN}/storage/v1/object/public/uploads`;
const UUID = "a8515b4f-1baf-4e57-8ef1-9ce367d05b1e";

// The real shapes of the 12 legacy images (uuid, uuid-number, uuid-phone_file_name).
const LEGACY = [
  "scout-stages/b0ce03a1-0457-4bb6-96ce-a7a0440d2325.jpg",
  "news/49784cfd-0eb0-461b-9109-d073962d56f1-1000612625.jpg",
  "scout-stages/c2a3a0b1-0a1b-4c2d-9e8f-1a2b3c4d5e6f-625465571_1229939375914892_8312847624295679079_n.jpg",
];

/* ------------------------------------------------------------------ */
/* thumbUrl(): which URLs get a thumbnail, and which stay untouched    */
/* ------------------------------------------------------------------ */

test("legacy single-file images on this site's Storage map to a sibling .thumb.jpg", () => {
  for (const path of LEGACY) {
    const expected = `${BASE}/${path.replace(/\.jpg$/, ".thumb.jpg")}`;
    assert.equal(thumbUrl(`${BASE}/${path}`), expected, path);
  }
  for (const ext of ["jpeg", "png", "webp", "avif", "JPG"]) {
    assert.equal(thumbUrl(`${BASE}/gallery/x-1.${ext}`), `${BASE}/gallery/x-1.thumb.jpg`, ext);
  }
});

test("the newer <uuid>/full layout keeps mapping to <uuid>/thumb.jpg", () => {
  assert.equal(thumbUrl(`${BASE}/gallery/${UUID}/full.jpg`), `${BASE}/gallery/${UUID}/thumb.jpg`);
  assert.equal(thumbUrl(`${BASE}/news/${UUID}/full.webp`), `${BASE}/news/${UUID}/thumb.jpg`);
});

test("external, foreign and unrelated URLs are returned unchanged", () => {
  for (const url of [
    "https://evil.example/storage/v1/object/public/uploads/gallery/a.jpg", // another site
    "https://other-project.supabase.co/storage/v1/object/public/uploads/gallery/a.jpg", // another Supabase project
    "https://cdn.example.com/photo.jpg",
    "/images/logo.png", // local asset
    `${BASE}/library/${UUID}.pdf`, // not an image
    `${BASE}/gallery/anim.gif`, // GIFs never get thumbnails
    `${BASE}/gallery/x-1.thumb.jpg`, // already a thumbnail
    `${BASE}/gallery/${UUID}/thumb.jpg`, // already a thumbnail (new layout)
    `${BASE}/gallery/${UUID}/other.jpg`, // nested, but not the "full" original
    `${BASE}/gallery/sub/dir/a.jpg`, // deeper than one folder
    `${BASE}/a.jpg`, // no folder
    `${BASE}/gallery/a.jpg?download=1`, // query string
    `${BASE}/gallery/a.jpg#x`,
    `${BASE}/gallery/a b.jpg`, // spaces / unusual names
    `${BASE}/gallery/../secret.jpg`,
    `${ORIGIN}/storage/v1/object/sign/uploads/gallery/a.jpg?token=x`, // signed URL, not public
    "",
  ]) {
    assert.equal(thumbUrl(url), url, url);
  }
});

test("thumbUrl is stable: a thumbnail URL maps to itself", () => {
  const t = thumbUrl(`${BASE}/${LEGACY[0]}`);
  assert.equal(thumbUrl(t), t);
});

test("legacyThumbPath only accepts <folder>/<plain-name>.<image-ext>", () => {
  assert.equal(legacyThumbPath("gallery/abc-1_2.jpg"), "gallery/abc-1_2.thumb.jpg");
  for (const bad of ["gallery/abc.thumb.jpg", "gallery/a.pdf", "a.jpg", "gallery/x/y.jpg", "../a.jpg", "gallery/../a.jpg", "gal_lery/a.jpg", "gallery/a.b.jpg"]) {
    assert.equal(legacyThumbPath(bad), null, bad);
  }
});

/* ------------------------------------------------------------------ */
/* Storage ownership: the underscore fix is limited to file names      */
/* ------------------------------------------------------------------ */

test("file names with underscores in our bucket are recognised as ours", () => {
  assert.equal(isOwnStorageUrl(`${BASE}/${LEGACY[2]}`), true);
  assert.equal(isOwnStorageUrl(`${BASE}/${LEGACY[2].replace(/\.jpg$/, ".thumb.jpg")}`), true);
});

test("the underscore fix doesn't accept unsafe or unrelated paths", () => {
  for (const bad of [
    `${BASE}/bad_folder/a.jpg`, // underscores still not allowed in folders
    `${BASE}/gallery/sub/a_b.jpg`, // nested non-uuid folder
    `${BASE}/gallery/../a_b.jpg`,
    `${BASE}/gallery/%2e%2e/a_b.jpg`,
    `${BASE}/gallery/a%2Fb_c.jpg`, // encoded slash
    `${BASE}/gallery/a_b.jpg?x=1`.replace("?x=1", "/x"), // extra segment
    `${ORIGIN}/storage/v1/object/public/other-bucket/gallery/a_b.jpg`,
    `https://evil.example/storage/v1/object/public/uploads/gallery/a_b.jpg`,
  ]) {
    assert.equal(isOwnStorageUrl(bad), false, bad);
  }
});

/* ------------------------------------------------------------------ */
/* Cleanup: which objects removeFromStorage() would delete             */
/* ------------------------------------------------------------------ */

test("removing a legacy image also removes its sibling thumbnail, and nothing else", () => {
  for (const path of LEGACY) {
    assert.deepEqual(storagePathsToRemove([`${BASE}/${path}`]), [path, path.replace(/\.jpg$/, ".thumb.jpg")]);
  }
});

test("removing a new-layout image removes its pair; documents and thumbnails only themselves", () => {
  assert.deepEqual(storagePathsToRemove([`${BASE}/gallery/${UUID}/full.jpg`]), [`gallery/${UUID}/full.jpg`, `gallery/${UUID}/thumb.jpg`]);
  assert.deepEqual(storagePathsToRemove([`${BASE}/library/${UUID}.pdf`]), [`library/${UUID}.pdf`]);
  // A thumbnail URL never pulls in its original.
  assert.deepEqual(storagePathsToRemove([`${BASE}/gallery/x-1.thumb.jpg`]), ["gallery/x-1.thumb.jpg"]);
  assert.deepEqual(storagePathsToRemove([`${BASE}/gallery/${UUID}/thumb.jpg`]), [`gallery/${UUID}/thumb.jpg`]);
});

test("cleanup ignores URLs outside our bucket and de-duplicates", () => {
  assert.deepEqual(
    storagePathsToRemove([
      "https://evil.example/storage/v1/object/public/uploads/gallery/a.jpg",
      `${ORIGIN}/storage/v1/object/public/other-bucket/gallery/a.jpg`,
      "/images/logo.png",
      `${BASE}/gallery/../a.jpg`,
    ]),
    [],
  );
  const url = `${BASE}/${LEGACY[0]}`;
  assert.equal(storagePathsToRemove([url, url]).length, 2);
});
