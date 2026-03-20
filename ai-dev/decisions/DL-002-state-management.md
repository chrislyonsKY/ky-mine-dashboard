# DL-002: Zustand for State Management

**Date:** 2026-03-20
**Status:** Accepted
**Author:** Chris Lyons

## Context
Dashboard requires cross-filter state shared across 6+ widgets. Need a state management solution.

## Decision
Use Zustand 5.x for lightweight global state management.

## Alternatives Considered
- **React Context + useReducer** — Rejected. Fine for simple state, but cross-filter with 6+ consumers causes unnecessary re-renders without careful memoization.
- **Redux Toolkit** — Rejected. Overkill for this project's scope. Zustand is simpler, less boilerplate, and sufficient.
- **Jotai** — Considered. Atomic state model is appealing but Zustand's single-store pattern maps better to the cross-filter use case.

## Consequences
- Single store with navigation, filter, and derived state slices
- All widgets subscribe to relevant slices via selectors
- Definition expression computed as derived state from filter slices
