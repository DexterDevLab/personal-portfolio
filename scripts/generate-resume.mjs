// Generates public/resume.pdf from scripts/resume/resume.html with headless
// Chrome (the one installed on this Mac), so the résumé shares the site's
// fonts and palette. Edit the HTML, then run `npm run resume`.
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = process.cwd();
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const fonts = join(root, "node_modules/geist/dist/fonts");
const f = (file) => pathToFileURL(join(fonts, file)).href;

let html = await readFile(join(root, "scripts/resume/resume.html"), "utf8");
html = html
  .replace("__FONT_SANS_REGULAR__", f("geist-sans/Geist-Regular.ttf"))
  .replace("__FONT_SANS_MEDIUM__", f("geist-sans/Geist-Medium.ttf"))
  .replace("__FONT_SANS_BOLD__", f("geist-sans/Geist-Bold.ttf"))
  .replace("__FONT_SANS_BLACK__", f("geist-sans/Geist-Black.ttf"))
  .replace("__FONT_MONO_SEMIBOLD__", f("geist-mono/GeistMono-SemiBold.ttf"))
  .replace("__PORTRAIT__", pathToFileURL(join(root, "src/assets/portrait.jpg")).href);

const work = join(tmpdir(), `dexter-resume-${Date.now()}`);
await mkdir(work, { recursive: true });
const page = join(work, "resume.html");
await writeFile(page, html);
const out = join(root, "public/resume.pdf");

execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--no-margins",
  `--print-to-pdf=${out}`,
  pathToFileURL(page).href,
], { stdio: "ignore" });
await rm(work, { recursive: true, force: true });
console.log("Wrote public/resume.pdf");
