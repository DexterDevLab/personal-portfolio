# Working in this repo

This is an **Astro 7** site (static output on Vercel, one on-demand API route). There is no React and no UI-framework integration: components are `.astro` files, interactivity is small vanilla TypeScript in `<script>` tags, styling is Tailwind 4 configured in `src/styles/global.css`.

Before writing framework code, check the installed version's docs (`node_modules/astro/README.md`, `node_modules/astro/dist/` types, or docs.astro.build for the version in `package.json`). Astro 7 is stricter than older releases: every tag must be closed, whitespace between inline elements is stripped (use `{" "}`), and `src/fetch.ts` is a reserved filename.

Content lives in `src/content/work/*.md` (projects) and `src/data/*.ts` (site constants, services, process). See `README.md` for the editing map and `HANDOFF.md` for the migration notes.
