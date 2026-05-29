// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe.
// Nitro is configured here explicitly via `nitro: { preset }` for Vercel deployment.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Custom SSR error-handling wrapper around @tanstack/react-start/server-entry
    server: { entry: "server" },
  },
  nitro: {
    // "vercel" preset generates .vercel/output/ — Vercel deploys it automatically.
    // Switch to "vercel-edge" if you want Edge Runtime instead of Node.js serverless.
    preset: "vercel",
  },
});
