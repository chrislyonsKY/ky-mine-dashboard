# DL-003: County-First Navigation Pattern

**Date:** 2026-03-20
**Status:** Accepted
**Author:** Chris Lyons

## Context
The mine boundaries dataset has ~22,455 records. Loading all at once is a performance problem and a poor UX — users need geographic context to navigate.

## Decision
Use a county-first navigation pattern: initial view shows KY counties, clicking a county loads mine boundaries within it via spatial query.

## Alternatives Considered
- **Load all mines statewide** — Rejected. 22K+ polygons overwhelming to render and explore. MaxRecordCount of 1000 means multiple paginated requests.
- **Cluster/aggregate at state level, detail on zoom** — Rejected. MapServer doesn't support client-side clustering on sublayers. Would require FeatureServer or client-side data.
- **Filter by REGION_DES** — Rejected. Regional offices don't map to individual counties — too coarse.

## Consequences
- Requires a counties layer as the navigation layer
- Coal counties must be determined dynamically on load
- Mine boundaries only queried when a county is selected
- All widget statistics must be scoped to the selected county
