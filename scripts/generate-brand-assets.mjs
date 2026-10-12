// One-off generator for the favicon, touch icon (from src/assets/logo.svg), and social share image.
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

// Favicon and touch icon: the monitor symbol from src/assets/logo.svg, centred
// in a square. The symbol is pure paths (no text), so sharp rasterises it
// exactly as the browser draws the logo.
async function icon() {
  const logo = await readFile("src/assets/logo.svg", "utf8");
  const style = logo.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const symbol = logo.match(/<g id="symbol">([\s\S]*?)<\/g>\s*<g id="wordmark"/)?.[1];
  if (!symbol) throw new Error("Could not find <g id=\"symbol\"> in src/assets/logo.svg");
  // The symbol spans roughly x 15–295, y 8–352 in the logo's coordinates.
  const art = (background) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
    `<defs><style>${style}</style></defs>` +
    (background ? `<rect width="400" height="400" rx="88" fill="${background}"/>` : "") +
    `<g transform="translate(45 20)">${symbol}</g></svg>`;

  const svg = art(null);
  await writeFile("public/favicon.svg", svg);
  const png = (size) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png();
  await png(32).toFile("public/favicon-32.png");
  await png(192).toFile("public/favicon-192.png");
  // iOS applies its own corner radius and dislikes transparency: cream square behind the symbol.
  const touch = art("#f5eedc").replace('rx="88"', 'rx="0"');
  await sharp(Buffer.from(touch), { density: 300 }).resize(180, 180).png().toFile("public/apple-touch-icon.png");
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
