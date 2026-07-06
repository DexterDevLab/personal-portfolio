import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Favicon shown in browser tabs, bookmarks, and search results.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          borderRadius: 7,
          color: "#ffffff",
          fontFamily: "Geist Mono",
          fontSize: 24,
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
