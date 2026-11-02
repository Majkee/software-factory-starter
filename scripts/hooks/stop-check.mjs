#!/usr/bin/env node
// Claude Code Stop hook. The agent may not finish while `npm run check` is red.
// Exit code 2 sends the failure output back to the agent so it keeps working.
// `stop_hook_active` is true when the agent is already continuing because of this hook;
// we then let it stop to avoid an endless loop (CI will still block the merge).
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
if (input.stop_hook_active === true) process.exit(0);

const changed = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" }).stdout.trim();
if (changed === "") process.exit(0); // nothing was edited, nothing to check

const result = spawnSync("npm", ["run", "check", "--silent"], { encoding: "utf8" });
if (result.status === 0) process.exit(0);

const output = `${result.stdout}\n${result.stderr}`.trim().split("\n").slice(-60).join("\n");
process.stderr.write(`npm run check is failing. Fix it before you finish:\n${output}\n`);
process.exit(2);
