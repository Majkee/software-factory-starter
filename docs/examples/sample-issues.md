# Sample issues to try the factory

File these (with the issue forms) once the factory is set up. Each one exercises a different path.

## 1. Feature → ready-for-agent (happy path)

**Discount codes should be case-insensitive**

- Goal: customers type codes in any case.
- Acceptance: `computeInvoice(lines, "save10")` equals `computeInvoice(lines, "SAVE10")`;
  `" Save10 "` (spaces) also works; unknown codes still throw `DiscountError`.
- Out of scope: new codes, changing discount amounts.

## 2. Bug → triage reproduces it → ready-for-agent

**Negative amounts lose their sign when formatted**

- Repro: `formatCents(-50)` returns `"0.50 PLN"`; expected `"-0.50 PLN"`. (`formatCents(-150)` is fine.)
- This is a real bug in `src/money.ts` (`Math.trunc(-0.5)` is `-0`, which prints as `0`).

## 3. Ambiguous → needs-info

**Support credit notes**

- Goal: issue credit notes. (No acceptance criteria — triage should ask what a credit note must contain.)

## 4. Risky → ready-for-human

**Round VAT on the invoice total instead of per line**

- Changes totals for existing invoices and contradicts ADR 0002 / GLOSSARY "line VAT": a one-way door.

## 5. Out of scope → wontfix

**Allow lines in EUR and PLN on one invoice** — already in `.out-of-scope/multi-currency.md`.

## Debugging path (CI doctor)

Push a commit to `main` that breaks a test (e.g. change `applyRate` to round down). CI fails, the CI
doctor files a `ci-failure` issue with the failing step, repro and suspected commit, and triage
picks it up from there.
