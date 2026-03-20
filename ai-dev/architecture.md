# Architecture — KY Mine Dashboard

## System Overview

A static single-page application (SPA) that consumes live ArcGIS REST services to display Kentucky permitted coal mine boundaries in an interactive, cross-filtered dashboard. No backend, no AGOL dependency. Hosted on GitHub Pages.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build | Vite 6.x | ESM-first bundler, dev server, production build |
| UI Framework | React 19 + TypeScript 5.4+ | Component architecture, type safety |
| Map | ArcGIS Maps SDK for JS 5.0 | Map rendering, layer management, spatial queries |
| Map Components | `@arcgis/map-components-react` | React wrappers for `<arcgis-*>` web components |
| UI Components | `@esri/calcite-components-react` | Panels, cards, buttons, inputs — WCAG built-in |
| Charts | Recharts 2.x | Bar, pie, area/line charts |
| State | Zustand 5.x | Lightweight global store, cross-filter state |
| Hosting | GitHub Pages | Static file serving, no server runtime |

---

## Layer Architecture

### Counties Layer
- **Source**: `kygisserver.ky.gov/.../Ky_Counties_Generalized_WGS84WM/MapServer`
- **SDK Class**: `MapImageLayer` with sublayer access
- **Behavior**: Always visible. Click handler captures county geometry for spatial queries. Styled with coal/non-coal distinction (determined on load).

### Mine Boundaries Layer
- **Source**: `kygisserver.ky.gov/.../Ky_Permitted_Mine_Boundaries_WGS84WM/MapServer/0`
- **SDK Class**: `MapImageLayer` → `sublayer.createFeatureLayer()` for query capabilities
- **Behavior**: Not visible in statewide view. Loads via spatial query when a county is selected. Definition expression always includes `Type_Flag <> 'TRNS'`.
- **Renderer**: Unique value on `FeatCLS` — Surface (blue hatching) and Underground (red solid), matching the service default symbology.

### KYFromAbove Imagery
- **Source**: `kyraster.ky.gov/.../Ky_KYAPED_Imagery_WGS84WM/ImageServer`
- **SDK Class**: `ImageryLayer`
- **Behavior**: Hidden at statewide zoom. Becomes visible when zoomed to county level. Provides ortho context for mine boundary inspection.

---

## Query Strategy

### Statistics Queries (KPIs, Charts)
Use `StatisticDefinition` with `count` operations, grouped by `Type_Flag`, `FeatCLS`, `MINE_STATU`, etc. These are efficient server-side aggregations that don't count against MaxRecordCount.

```
outStatistics: [{ statisticType: 'count', onStatisticField: 'OBJECTID', outStatisticFieldName: 'count' }]
groupByFieldsForStatistics: ['Type_Flag', 'FeatCLS']
where: "Type_Flag <> 'TRNS'"
```

### Spatial Queries (County → Mines)
When a county is clicked, use its geometry as a spatial filter:
```
geometry: countyPolygon
spatialRelationship: 'intersects'
where: "Type_Flag <> 'TRNS'" + any active filters
outFields: [all display fields]
returnGeometry: true
```

MaxRecordCount is 1000. For counties with >1000 mines, paginate using `resultOffset` and `resultRecordCount`, or use the `exceededTransferLimit` flag.

### Permit Search
```
where: "PermitNo LIKE '%{input}%' AND Type_Flag <> 'TRNS'"
outFields: ['PermitNo', 'PER_NAME', 'FeatCLS']
returnGeometry: true
resultRecordCount: 10
```

### Coal County Detection (on load)
Query mine boundaries for distinct spatial extents, intersect with counties. Or: query a count of mine features within each county polygon. Cache the result — coal county list won't change between monthly updates.

---

## State Management

Zustand store with these slices:

### Navigation State
- `viewState`: 'statewide' | 'county' | 'mine-detail'
- `selectedCounty`: Feature | null
- `selectedMine`: Feature | null

### Filter State
- `typeFlag`: 'ACT' | 'INACT' | 'RECNF' | null (null = all non-TRNS)
- `featCLS`: 'SF' | 'UG' | null
- `mineStatuGroup`: string | null

### Derived State
- `definitionExpression`: Computed from all active filters. Base: `Type_Flag <> 'TRNS'`. Appends AND clauses for each active filter.

### Data Flow
```
User Action (click card, click county, search)
  → Zustand store update
    → definitionExpression recompute
      → Map layer definitionExpression update
      → KPI query re-fire
      → Chart data re-query
      → Feature table refresh
```

---

## Layout (CSS Grid)

```
grid-template-areas:
  "header   header   header"
  "left     map      right"
  "table    table    table"

grid-template-columns: 280px 1fr 300px
grid-template-rows: 56px 1fr 280px
```

- **header**: Full width — title, search, breadcrumb
- **left**: KPI cards stack vertically
- **map**: Dominant center — `<arcgis-map>` fills available space
- **right**: Charts stack vertically (MINE_STATU chart, time series, region breakdown)
- **table**: Full width bottom — `<arcgis-feature-table>`, collapsible

All panels use Calcite `<calcite-panel>` with `<calcite-block>` for collapsible sections.

---

## Performance Considerations

1. **Don't load all mines at once.** County-first spatial query limits initial payload.
2. **Use server-side statistics** for KPIs and chart data — avoid fetching all records just to count them.
3. **Paginate if needed** — MaxRecordCount is 1000 per request.
4. **Cache coal county detection** — run once on load, store in memory.
5. **Debounce permit search** — don't query on every keystroke; wait 300ms after last input.
6. **Lazy-load imagery** — KYFromAbove ImageryLayer only added to map at county zoom level.

---

## Accessibility (WCAG 2.1 AA)

- Calcite components provide built-in ARIA roles and keyboard navigation
- Charts use accessible color palettes (distinguishable with color blindness)
- Chart data also available in tabular form (feature table)
- KPI card state changes announced via `aria-live` regions
- Focus management on state transitions (county select, search result select)
- Map controls accessible via keyboard (Calcite map components handle this)
- All interactive elements have visible focus indicators
- Minimum 4.5:1 contrast ratio on all text
