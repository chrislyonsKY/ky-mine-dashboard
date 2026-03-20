# DL-004: Spatial Query for County-Mine Association

**Date:** 2026-03-20
**Status:** Accepted
**Author:** Chris Lyons

## Context
Mine boundaries don't have a county name field. `REGION_DES` contains DMP regional office names (Pikeville, Prestonsburg, etc.), not counties. `QUAD_DESC` has USGS quad names.

## Decision
Use spatial queries to associate mines with counties. When a county is clicked, pass its polygon geometry to the mine boundaries query as a spatial filter with `spatialRelationship: 'intersects'`.

## Alternatives Considered
- **Add a county lookup table** — Rejected. Would require pre-processing the data and maintaining a static mapping that could drift from the live service.
- **Use REGION_DES as proxy** — Rejected. A regional office covers multiple counties — too coarse for county-level dashboard.

## Consequences
- County click handler must capture the full polygon geometry
- Spatial queries may be slightly slower than attribute-only queries
- For coal county detection on load, need an efficient approach (count query per county, or query mine extents and intersect)

---

# DL-005: TRNS Record Exclusion

**Date:** 2026-03-20
**Status:** Accepted
**Author:** Chris Lyons

## Context
`Type_Flag = 'TRNS'` (3,768 records) represents transferred permit numbers — old permits replaced when mine ownership changed. The geometries are exact duplicates of the current permit holder's boundaries.

## Decision
TRNS records are unconditionally excluded from all queries, displays, statistics, and exports. The base definition expression `Type_Flag <> 'TRNS'` is applied to every query.

## Alternatives Considered
- **Show TRNS as a separate category** — Rejected. Duplicate geometries would inflate counts and confuse the spatial display.
- **User toggle to show/hide TRNS** — Rejected. No valid use case for seeing duplicate transferred boundaries in this dashboard context.

## Consequences
- Every query WHERE clause must include the TRNS exclusion
- Dashboard total count is ~18,687 (not 22,455)
- Query builder utility must enforce this as the immutable base expression
