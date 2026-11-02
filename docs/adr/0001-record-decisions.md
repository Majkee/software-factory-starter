# ADR 0001: Record hard-to-reverse decisions

- Status: accepted
- Date: 2026-11-02

## Context

Agents copy whatever the codebase already does. They cannot ask "why is it like this?" in a hallway.

## Decision

Write a short ADR when a decision is hard to reverse, surprising without context, and a real
trade-off. Skip ADRs for everything else. Number them `NNNN-title.md`.

## Consequences

Agents read the ADRs that touch their change (see AGENTS.md). Reviewers point to an ADR instead of
re-arguing it.
