# DL-001: ArcGIS JS SDK 5.0 with Web Components

**Date:** 2026-03-20
**Status:** Accepted
**Author:** Chris Lyons

## Context
Need to choose between JS SDK 4.x (widgets) and 5.0 (web components) for the dashboard.

## Decision
Use ArcGIS Maps SDK for JavaScript 5.0 with web components exclusively. No deprecated widget classes.

## Alternatives Considered
- **SDK 4.33 (widgets)** — Rejected. Widgets deprecated at 5.0, removed at 6.0 (early 2027). Building on deprecated API is technical debt.
- **SDK 4.34 (components preferred)** — Rejected. If targeting components anyway, use 5.0 for full component support and latest features.

## Consequences
- Must use `<arcgis-map>`, `<arcgis-feature-table>`, etc. instead of `new MapView()`, `new FeatureTable()`
- React integration via `@arcgis/map-components-react`
- Some community examples/tutorials still show 4.x patterns — do not copy them
