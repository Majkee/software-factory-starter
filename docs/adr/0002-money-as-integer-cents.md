# ADR 0002: Money is integer cents

- Status: accepted
- Date: 2026-11-02

## Context

Floating-point arithmetic cannot represent 0.10 exactly, so sums of prices drift by fractions of a cent.

## Decision

All amounts are `Cents` (integer). Strings are converted with `toCents` at the edge and formatted
with `formatCents` for display. Multiplication by a rate goes through `applyRate`, which rounds half
away from zero.

## Consequences

- Any `number` that is not a safe integer and claims to be money is a bug (`assertCents` throws).
- Changing rounding changes invoice totals for existing inputs: treat it as a one-way door.
