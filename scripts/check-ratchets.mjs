#!/usr/bin/env node
// Brake for pull requests: ratchet files may only get stricter.
// Compares the PR's ratchet files with the base branch. Usage: node scripts/check-ratchets.mjs <base-ref>
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2] ?? "origin/main";
const atBase = (path) => {
  try {
    return JSON.parse(execFileSync("git", ["show", `${base}:${path}`], { encoding: "utf8" }));
  } catch {
    return null; // file is new on this branch
  }
};
const now = (path) => JSON.parse(readFileSync(path, "utf8"));
const problems = [];

const lintBefore = atBase(".factory/lint-ratchet.json");
if (lintBefore) {
  const lintNow = now(".factory/lint-ratchet.json");
  const added = lintNow.pending.filter((rule) => !lintBefore.pending.includes(rule));
  if (added.length > 0) problems.push(`Lint rules moved back to "pending": ${added.join(", ")}`);
  const dropped = Object.keys(lintBefore.rules).filter((rule) => !(rule in lintNow.rules));
  if (dropped.length > 0) problems.push(`Lint rules removed from the target set: ${dropped.join(", ")}`);
}

const testsBefore = atBase("tests/.baseline.json");
if (testsBefore && now("tests/.baseline.json").minTests < testsBefore.minTests) {
  problems.push("tests/.baseline.json minTests was lowered");
}

if (problems.length > 0) {
  console.error("Ratchet check failed (ratchets may only get stricter):\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Ratchets OK.");
