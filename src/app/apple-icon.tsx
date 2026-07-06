import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Icon used when the site is saved to an iOS/macOS home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const geistMonoBold = await readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf",
    ),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f7cff",
          color: "#ffffff",
          fontFamily: "Geist Mono",
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        D
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: geistMonoBold, weight: 700, style: "normal" },
      ],
    },
  );
}
