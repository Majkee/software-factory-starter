---
name: maintain
description: Nightly continuous-improvement task. Argument is the job - lint-ratchet, dependencies or architecture.
disable-model-invocation: true
---

# Maintenance job: $ARGUMENTS

Do exactly one small thing. Small, boring and safe beats ambitious.

## lint-ratchet

1. Read `.factory/lint-ratchet.json`. Take the FIRST rule in `pending`.
2. Remove it from `pending`, run `npm run lint:report`, and fix every violation of that rule in the
   simplest way that keeps behaviour identical. Do not touch tests' assertions.
3. If fixing it needs more than ~150 changed lines or any behaviour change, revert, and instead file an
   issue "Lint ratchet: <rule> needs a human decision" with the violation count. Stop.
4. `npm run check` green → branch `agent/maint-lint-<rule-slug>`, commit, draft PR with labels
   `agent` and `factory:maintenance`. Evidence: violation count before → 0.

## dependencies

1. `npm audit --json` and `npm outdated --json`.
2. If there is a fixable advisory: apply the smallest fix (`npm audit fix` without `--force`), run
   `npm run check`, open a draft PR (`agent`, `factory:maintenance`) listing each advisory.
3. Otherwise, if a dev dependency is a major version behind, file ONE issue describing the upgrade
   and its changelog risks, labeled `needs-triage`. Never upgrade majors yourself.

## architecture

1. Look for: functions over 40 lines, duplicated logic, modules importing across ADR 0003's boundary,
   names that disagree with GLOSSARY.md, tests that assert on internals.
2. File ONE issue titled "Refactor candidates (<date>)" listing at most 5 candidates, each with
   location, problem, and a suggested small change. Label it `needs-triage`. Change no code.
