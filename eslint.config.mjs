// Lint ratchet: .factory/lint-ratchet.json lists the rules we want ("rules") and the ones not
// enforced yet ("pending"). The nightly maintenance task promotes ONE pending rule per run:
// it fixes the violations, removes the rule from "pending" and opens a small PR.
// The pending list may only ever shrink (scripts/check-ratchets.mjs enforces this in CI).
import js from "@eslint/js";
import { readFileSync } from "node:fs";
import tseslint from "typescript-eslint";

const ratchet = JSON.parse(readFileSync(new URL("./.factory/lint-ratchet.json", import.meta.url), "utf8"));
const ratchetRules = Object.fromEntries(
  Object.entries(ratchet.rules).map(([rule, level]) => [rule, ratchet.pending.includes(rule) ? "off" : level]),
);

export default tseslint.config(
  { ignores: ["node_modules", "coverage", "holdout"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.ts"],
    rules: {
      "no-console": "error",
      eqeqeq: "error",
      // Architecture boundary (ADR 0003): the domain must not import Node built-ins; only the CLI may.
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["node:*"], message: "Domain code is pure. Do I/O in src/cli.ts (ADR 0003)." }] },
      ],
      ...ratchetRules,
    },
  },
  {
    files: ["src/cli.ts", "tests/**/*.ts", "*.config.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", URL: "readonly", fetch: "readonly" },
    },
    rules: { "no-console": "off" },
  },
);
