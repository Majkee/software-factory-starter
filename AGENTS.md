# AGENTS.md

A small invoice library (`src/`) run by a brakes-first software factory (`.github/workflows/agent-*.yml`).
Keep this file short and human-written. Recurring mistakes become checks, not new lines here.

## Commands

- `npm ci` — install (Node 22+)
- `npm run check` — the one gate: typecheck, lint, format, tests, test ratchet. Must be green before you stop.
- `npx vitest run tests/<file>.test.ts` — run one test file
- `npm run format` — fix formatting
- `npm run invoice -- examples/invoice.json` — run the CLI

## Map

- `src/money.ts` — `Cents` type, parsing, formatting, rounding. All money is integer cents.
- `src/discounts.ts` — discount codes and how much they take off.
- `src/invoice.ts` — invoice totals (discount allocation, per-line VAT).
- `src/cli.ts` — the only place allowed to do I/O.
- `tests/` — Vitest tests, one file per module.
- `GLOSSARY.md` — domain words. Use them exactly in code and PRs.
- `docs/adr/` — decisions that are expensive to reverse. Read the ones your change touches.
- `CODING_STANDARDS.md` — judgement rules the reviewer checks.
- `docs/factory/` — how the factory works (tasks, labels, limits).

## Rules that are not obvious from the code

- Money: never use floats for amounts; convert at the edge with `toCents` (ADR 0002).
- Domain code must not import `node:*` modules (ADR 0003, enforced by lint).
- Rounding is half away from zero, per line (GLOSSARY: "line VAT").
- New behaviour starts with a failing test. Show it failing, then make it pass.
- Never edit or delete existing tests to make them pass. If a test is wrong, stop and say so.
- Do not touch `.github/`, `.claude/`, `scripts/hooks/`, `tests/.baseline.json` — they are human-owned.
- One issue per branch and PR. Branch name: `agent/<issue-number>-<short-slug>`.
- PRs are drafts and use `.github/pull_request_template.md` (Summary / Evidence / Merge danger).

## When you are stuck

After two honest attempts that still fail `npm run check`, stop. Comment on the issue with what you
tried and what you think is wrong, add the label `ready-for-human`, and end the run.
