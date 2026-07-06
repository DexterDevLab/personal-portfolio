import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

// Preview card shown when the site link is shared on social media and chat apps.
export const alt = `${site.shortPerson} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const domain = site.url.replace(/^https?:\/\//, "");

const fontPath = (file: string) =>
  join(process.cwd(), "node_modules/geist/dist/fonts", file);

export default async function OpengraphImage() {
  const [sansBlack, sansSemiBold, sansRegular, monoSemiBold] = await Promise.all(
    [
      readFile(fontPath("geist-sans/Geist-Black.ttf")),
      readFile(fontPath("geist-sans/Geist-SemiBold.ttf")),
      readFile(fontPath("geist-sans/Geist-Regular.ttf")),
      readFile(fontPath("geist-mono/GeistMono-SemiBold.ttf")),
    ],
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0a0a0b",
          backgroundImage:
            "radial-gradient(900px circle at 8% -5%, rgba(79,124,255,0.28), transparent 55%)",
          color: "#ededef",
          fontFamily: "Geist",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "#4f7cff",
          }}
        >
          DexterDevLab
        </div>

        {/* Name + role */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {site.shortPerson}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 46,
              fontWeight: 600,
              color: "#4f7cff",
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 880,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#8a8a94",
            }}
          >
            10+ years building fast, modern websites and web apps for
            businesses, agencies, and startups.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 14,
              background: "#4f7cff",
              marginRight: 16,
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: 28,
              color: "#ededef",
            }}
          >
            {domain}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: sansBlack, weight: 800, style: "normal" },
        { name: "Geist", data: sansSemiBold, weight: 600, style: "normal" },
        { name: "Geist", data: sansRegular, weight: 400, style: "normal" },
        { name: "Geist Mono", data: monoSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
