# ADR 0003: The domain is pure; I/O lives in the CLI

- Status: accepted
- Date: 2026-11-02

## Context

Pure functions are fast to test and easy for agents to change safely. I/O mixed into the domain makes
tests slow and failures hard to reproduce.

## Decision

`src/money.ts`, `src/discounts.ts` and `src/invoice.ts` do no I/O and import no `node:*` modules.
Only `src/cli.ts` reads files and writes output. ESLint enforces this (`no-restricted-imports`).

## Consequences

New integrations (HTTP, files, databases) get their own adapter module next to the CLI, never
inside the domain.
