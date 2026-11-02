#!/usr/bin/env node
// Weekly factory metrics from the GitHub API (via the gh CLI). No LLM involved.
// Usage: node scripts/factory-metrics.mjs [--days 28]
// Needs GH_TOKEN and GH_REPO (or run inside a checkout with gh authenticated).
import { execFileSync } from "node:child_process";

const days = Number(process.argv[process.argv.indexOf("--days") + 1]) || 28;
const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

const gh = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
const prFields = "number,title,state,createdAt,mergedAt,closedAt,labels,comments";

const agentPrs = gh([
  "pr",
  "list",
  "--label",
  "agent",
  "--state",
  "all",
  "--limit",
  "300",
  "--search",
  `created:>=${since}`,
  "--json",
  prFields,
]);
const ciRuns = gh([
  "run",
  "list",
  "--workflow",
  "CI",
  "--branch",
  "main",
  "--limit",
  "200",
  "--json",
  "conclusion,createdAt",
]).filter((run) => run.createdAt >= since);
const stuck = gh([
  "issue",
  "list",
  "--label",
  "ready-for-human",
  "--state",
  "all",
  "--limit",
  "300",
  "--search",
  `created:>=${since}`,
  "--json",
  "number,comments",
]);

const merged = agentPrs.filter((pr) => pr.mergedAt);
const closedUnmerged = agentPrs.filter((pr) => pr.state === "CLOSED" && !pr.mergedAt);
const decided = merged.length + closedUnmerged.length;
const pct = (n, d) => (d === 0 ? "–" : `${Math.round((100 * n) / d)}%`);
const median = (xs) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const hours = (from, to) => (new Date(to) - new Date(from)) / 3_600_000;
const countMarker = (pr, marker) => pr.comments.filter((c) => c.body.startsWith(marker)).length;

const leadTime = median(merged.map((pr) => hours(pr.createdAt, pr.mergedAt)));
const reworks = agentPrs.map((pr) => countMarker(pr, "<!-- factory:rework"));
const firstPassClean = agentPrs.filter(
  (pr) => countMarker(pr, "<!-- factory:review verdict=fail") === 0 && countMarker(pr, "<!-- factory:review") > 0,
);
const reviewed = agentPrs.filter((pr) => countMarker(pr, "<!-- factory:review") > 0);
const mainGreen = ciRuns.filter((run) => run.conclusion === "success").length;
const factoryStuck = stuck.filter((i) => i.comments.some((c) => c.body.startsWith("<!-- factory:stuck"))).length;

const rows = [
  ["Agent PRs opened", agentPrs.length, ""],
  [
    "Merge rate (merged / decided)",
    pct(merged.length, decided),
    "OSS reference ≈ 63%; watch the trend, not the number",
  ],
  [
    "Median PR open → merge",
    leadTime === null ? "–" : `${leadTime.toFixed(1)} h`,
    "Review queue time is the real bottleneck",
  ],
  [
    "Passed factory review first time",
    pct(firstPassClean.length, reviewed.length),
    "Low = briefs or standards need work (see retro)",
  ],
  [
    "Avg rework attempts per PR",
    agentPrs.length ? (reworks.reduce((a, b) => a + b, 0) / agentPrs.length).toFixed(2) : "–",
    "",
  ],
  ["Runs handed to a human (stuck)", factoryStuck, "Many = tickets too big or knowledge missing"],
  ["Main branch CI green rate", pct(mainGreen, ciRuns.length), "Below 90% = slow down"],
];

console.log(`## Factory metrics — last ${days} days (since ${since})\n`);
console.log("| Metric | Value | How to read it |\n|---|---|---|");
for (const [name, value, note] of rows) console.log(`| ${name} | ${value} | ${note} |`);
console.log(
  "\nAlso track outside this report: DORA four keys, revert rate of agent PRs, cost per merged change " +
    "(sum of `total_cost_usd` from run logs), and the visible-vs-holdout pass-rate gap.",
);
