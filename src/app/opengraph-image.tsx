import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME_LATIN } from "@/lib/site";

// Site-wide share image, served at /opengraph-image (see OG_IMAGE in
// src/lib/seo.ts). Latin text only: satori does not shape Arabic reliably.

export const alt = `${SITE_NAME_LATIN} — Muslim Scouts Association in Lebanon, Tripoli`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

// Logo is 388×643 (portrait).
const LOGO_HEIGHT = 300;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 388) / 643);

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2C1750 0%, #4B2A82 100%)",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: 9999,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="" />
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -0.5,
            display: "flex",
          }}
        >
          {SITE_NAME_LATIN}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 28,
            color: "#F3EEFA",
            display: "flex",
          }}
        >
          Muslim Scouts Association in Lebanon · Tripoli
        </div>
      </div>
    ),
    size,
  );
}
