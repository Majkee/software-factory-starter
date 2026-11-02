#!/usr/bin/env node
// Claude Code PreToolUse hook for Bash. Deterministic brake: blocks commands that bypass checks
// or destroy evidence, even if a prompt or an injected issue text asks for them.
// Exit code 2 blocks the tool call and shows stderr to the agent.
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const command = String(input?.tool_input?.command ?? "");

const rules = [
  [/--no-verify\b|\bgit\s+commit\b.*\s-n\b/, "Do not skip git hooks. Fix the failing check instead."],
  [/\bgit\s+push\b.*(--force\b|\s-f\b)/, "Force-pushing is not allowed. Push a new commit."],
  [/\bHUSKY=0\b|\bSKIP=/, "Disabling hooks via environment variables is not allowed."],
  [/\b(rm|git\s+rm)\b[^\n]*\btests?\//, "Deleting test files is not allowed. Fix the code, not the tests."],
  [/\b(curl|wget|nc|ncat)\b/, "Network tools are blocked in this repo. Use gh for GitHub data."],
  [
    /\b(printenv|env)\b\s*($|\|)|\$\{?(ANTHROPIC|GITHUB|GH)_[A-Z_]*TOKEN|ANTHROPIC_API_KEY/,
    "Reading secrets or the environment is not allowed.",
  ],
  [
    /\bnpm\s+(publish|unpublish)\b|\bgh\s+release\b|\bgh\s+pr\s+merge\b/,
    "Publishing, releasing and merging are human-only actions.",
  ],
];

for (const [pattern, reason] of rules) {
  if (pattern.test(command)) {
    process.stderr.write(`Blocked by factory guard: ${reason}\nCommand: ${command}\n`);
    process.exit(2);
  }
}
process.exit(0);
