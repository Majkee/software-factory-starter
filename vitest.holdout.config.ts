import { defineConfig } from "vitest/config";

// Holdout scenarios live in a separate private repository that agents cannot read.
// CI checks it out into ./holdout (see .github/workflows/ci.yml, job "holdout").
export default defineConfig({
  test: {
    include: ["holdout/**/*.test.ts"],
  },
});
