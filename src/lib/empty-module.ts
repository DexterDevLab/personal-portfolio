// Empty stand-ins for build-time-only packages that must not load at runtime
// inside the Vercel function (see the `resolve.alias` entries in
// astro.config.mjs). The named exports exist only so the bundler is happy;
// none of them is ever called while serving a request.
const unavailable = (name: string) => () => {
  throw new Error(`${name} is a build-time helper and is not available at runtime.`);
};
export const getTransformedRoutes = unavailable("getTransformedRoutes");
export const normalizeRoutes = unavailable("normalizeRoutes");
export const rolldown = unavailable("rolldown");
