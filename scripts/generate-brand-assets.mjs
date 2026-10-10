// One-off generator for the favicon, touch icon, and social share image.
// Run with `npm run brand` and commit the files it writes to public/.
//
// satori renders a small JSX-like object tree to SVG with text converted to
// paths (so the Geist fonts don't need to be installed), then sharp
// rasterises the PNGs.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

// The `geist` package ships the TTFs but doesn't export them; read them by path.
const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts");
const font = (file) => readFile(join(fontDir, file));

const site = {
  wordmark: "DexterDevLab",
  name: "Dexter Iglesia",
  role: "Freelance Web Developer",
  tagline: "Websites and web apps, built and maintained. WordPress & WooCommerce, custom web apps, hosting and ongoing care.",
  domain: "dexteriglesia.com",
};

const accent = "#4f7cff";
const bg = "#0a0a0b";

const el = (type, style, children) => ({ type, props: { style, children } });

async function icon() {
  const mono = await font("geist-mono/GeistMono-Bold.ttf");
  const svg = await satori(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: accent,
        borderRadius: 112,
        color: "#ffffff",
        fontFamily: "Geist Mono",
        fontSize: 384,
        fontWeight: 700,
      },
      "D",
    ),
    { width: 512, height: 512, fonts: [{ name: "Geist Mono", data: mono, weight: 700, style: "normal" }] },
  );
  await writeFile("public/favicon.svg", svg);
  const png = (size) => sharp(Buffer.from(svg)).resize(size, size).png();
  await png(32).toFile("public/favicon-32.png");
  await png(192).toFile("public/favicon-192.png");
  // Apple touch icons are masked by iOS; render without the rounded corners.
  const square = svg.replace(/rx="[^"]+"/g, 'rx="0"').replace(/ry="[^"]+"/g, 'ry="0"');
  await sharp(Buffer.from(square)).resize(180, 180).png().toFile("public/apple-touch-icon.png");
}

async function og() {
  const [sansBlack, sansSemiBold, sansRegular, monoSemiBold] = await Promise.all([
    font("geist-sans/Geist-Black.ttf"),
    font("geist-sans/Geist-SemiBold.ttf"),
    font("geist-sans/Geist-Regular.ttf"),
    font("geist-mono/GeistMono-SemiBold.ttf"),
  ]);

  const svg = await satori(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: bg,
        backgroundImage: `radial-gradient(900px circle at 8% -5%, rgba(79,124,255,0.28), transparent 55%)`,
        color: "#ededef",
        fontFamily: "Geist",
      },
      [
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: accent,
          },
          site.wordmark,
        ),
        el("div", { display: "flex", flexDirection: "column" }, [
          el(
            "div",
            { display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", color: "#ffffff" },
            site.name,
          ),
          el("div", { display: "flex", marginTop: 16, fontSize: 46, fontWeight: 600, color: accent }, site.role),
          el(
            "div",
            { display: "flex", marginTop: 28, maxWidth: 920, fontSize: 30, lineHeight: 1.4, color: "#8a8a94" },
            site.tagline,
          ),
        ]),
        el("div", { display: "flex", alignItems: "center" }, [
          el("div", { display: "flex", width: 14, height: 14, borderRadius: 14, background: accent, marginRight: 16 }),
          el("div", { display: "flex", fontFamily: "Geist Mono", fontSize: 28, color: "#ededef" }, site.domain),
        ]),
      ],
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: sansBlack, weight: 800, style: "normal" },
        { name: "Geist", data: sansSemiBold, weight: 600, style: "normal" },
        { name: "Geist", data: sansRegular, weight: 400, style: "normal" },
        { name: "Geist Mono", data: monoSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
  await sharp(Buffer.from(svg)).png().toFile("public/og.png");
}

await icon();
await og();
console.log("Wrote public/favicon.svg, favicon-32.png, favicon-192.png, apple-touch-icon.png, og.png");
