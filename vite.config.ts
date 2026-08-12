// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// This app is deployed on Cloudflare Pages with Workers for SSR. The Lovable
// config skips nitro entirely on self-deploys, so we force nitro on with the
// cloudflare-pages preset here. It emits static assets to dist/ plus a single
// _worker.js (Pages Functions) that runs the TanStack Start server on Workers.
export default defineConfig({
  vite: {
    build: {
      rolldownOptions: {
        external: ["cloudflare:workers"],
      },
    },
  },
  nitro: {
    preset: "cloudflare-pages",
    compatibilityDate: { cloudflare: "2026-08-11" },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
