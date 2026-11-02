#!/usr/bin/env node
// Claude Code PreToolUse hook for Edit/Write. Agents may not change the factory's own brakes:
// workflows, agent settings, hooks, ratchet baselines or CODEOWNERS. Humans change those in a PR.
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const target = String(input?.tool_input?.file_path ?? input?.tool_input?.path ?? "");
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const rel = relative(root, resolve(root, target)).replaceAll("\\", "/");

const protectedPaths = [
  /^\.github\/workflows\//,
  /^\.github\/CODEOWNERS$/,
  /^\.claude\/settings(\.local)?\.json$/,
  /^scripts\/hooks\//,
  /^scripts\/check-(test-)?ratchets?\.mjs$/,
  /^tests\/\.baseline\.json$/,
  /^\.husky\//,
];

if (protectedPaths.some((pattern) => pattern.test(rel))) {
  process.stderr.write(
    `Blocked by factory guard: ${rel} is part of the factory's brakes and is human-owned.\n` +
      "If it really needs to change, explain why in the PR description and label the issue ready-for-human.\n",
  );
  process.exit(2);
}
process.exit(0);
