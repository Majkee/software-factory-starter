#!/usr/bin/env node
// Brake: the number of test cases may never go down, and skipped/focused tests are not allowed.
// Usage: node scripts/check-test-ratchet.mjs [--update]
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASELINE = "tests/.baseline.json";

function testFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return testFiles(path);
    return name.endsWith(".test.ts") ? [path] : [];
  });
}

let count = 0;
const problems = [];
for (const file of testFiles("tests")) {
  const source = readFileSync(file, "utf8");
  count += (source.match(/^\s*(it|test)\s*\(/gm) ?? []).length;
  for (const bad of source.match(/\b(it|test|describe)\.(skip|only|todo)\b|\bx(it|describe)\s*\(/g) ?? []) {
    problems.push(`${file}: "${bad}" is not allowed (it hides or narrows tests)`);
  }
  if (/expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/.test(source)) {
    problems.push(`${file}: "expect(true).toBe(true)" is a fake assertion`);
  }
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
if (process.argv.includes("--update")) {
  baseline.minTests = count;
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`Baseline set to ${count} tests.`);
  process.exit(0);
}

if (count < baseline.minTests) {
  problems.push(`Only ${count} test cases, but the baseline is ${baseline.minTests}. Tests were deleted.`);
}
if (problems.length > 0) {
  console.error("Test ratchet failed:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log(`Test ratchet OK: ${count} tests (baseline ${baseline.minTests}).`);
