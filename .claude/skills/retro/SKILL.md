---
name: retro
description: Weekly retro - learn from recently merged agent PRs and propose changes to the factory's instructions as one PR for a human.
disable-model-invocation: true
---

# Weekly retro

1. List agent PRs merged in the last 7 days:
   `gh pr list --state merged --label agent --search "merged:>=$(date -d '7 days ago' +%F)" --json number,title`.
   Also look at closed-unmerged agent PRs and issues labeled `ready-for-human` by the factory.
2. For each, read the factory review comments, rework comments and any human review comments.
3. Find patterns that happened at least twice: the same review finding, the same human correction,
   the same reason for getting stuck.
4. For each pattern pick the strongest fix, in this order of preference:
   1. a **deterministic check** (lint rule, test, ratchet) → describe it in the PR; a human adds it;
   2. a sharper line in `CODING_STANDARDS.md` or a skill under `.claude/skills/`;
   3. a missing term in `GLOSSARY.md` or a missing ADR.
      Prefer removing or tightening text over adding it. `AGENTS.md` must stay under 100 lines.
5. Open ONE draft PR (labels `factory:retro`) with the edits and a table: pattern → evidence (PR links)
   → change. If nothing happened twice, open nothing and print "no retro changes".

Never edit `.github/`, `.claude/settings.json`, hooks or ratchet baselines. Never chain into other tasks.
