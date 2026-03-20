# CLAUDE.md — KY Mine Dashboard

> Interactive ArcGIS Maps SDK dashboard for Kentucky permitted coal mine boundaries.
> Vite + React + TypeScript + ArcGIS JS SDK 5.0 + Calcite Design System

> **Note:** Do not include this file as indexable context. It is the entry point, not a reference doc.

Read this file completely before doing anything.
Then read `ai-dev/architecture.md` for full system design.
Then read `ai-dev/guardrails/` for hard constraints.
Then read `ai-dev/field-schema.md` for the complete data model.

---

## Context Boundaries

This file is the AI entry point for this project.
Do NOT auto-scan or index the following:
- `ai-dev/`   (read specific files only when instructed)
- `CLAUDE.md` (this file — entry point only)

When a task requires architecture context: read `ai-dev/architecture.md` explicitly.
When a task requires constraints: read `ai-dev/guardrails/` explicitly.
When a task requires data model details: read `ai-dev/field-schema.md` explicitly.

---

## Workflow Protocol

When starting a new task:
1. Read CLAUDE.md (this file)
2. Read `ai-dev/architecture.md`
3. Read `ai-dev/guardrails/` — constraints override all other guidance
4. Read the relevant `ai-dev/agents/` file for your role
5. Check `ai-dev/decisions/` for prior decisions affecting your work
6. Check `ai-dev/skills/` for domain patterns specific to this project

Plan before building. Show the plan. Wait for confirmation before writing code.

---

## Compatibility Matrix

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | 20 LTS+ | Required for Vite dev server |
| TypeScript | 5.4+ | Strict mode enabled |
| Vite | 6.x | Build tool, ESM-first |
| React | 19.x | Functional components only, hooks-based |
| ArcGIS Maps SDK for JS | **5.0** | Web components only — NO deprecated widgets |
| `@arcgis/core` | 5.0.x | ES modules build for Vite |
| `@arcgis/map-components-react` | 5.0.x | React wrappers for `<arcgis-*>` components |
| Calcite Design System | `@esri/calcite-components` | UI framework — panels, cards, buttons, inputs |
| `@esri/calcite-components-react` | Latest compatible | React wrappers for Calcite |
| Recharts | 2.x | Charts (bar, pie, time-series) |
| Zustand | 5.x | Lightweight global state management |

---

## Project Overview

### Purpose

An interactive, publicly accessible dashboard displaying Kentucky's permitted coal mine boundaries — active, inactive, released, and pre-SMCRA historic mines. Users navigate by county, drill into mine boundaries with orthoimagery context, and analyze permit lifecycle data through cross-filtered charts, KPI cards, and tabular views.

### Target Audience

- Kentucky Division of Mine Permits (DMP) staff
- Public citizens researching mining activity
- EEC regulatory stakeholders

### Hosting

Static SPA deployed to **GitHub Pages**. No server-side component. No AGOL account required.

---

## Data Sources

### Mine Boundaries (primary)

- **URL**: `https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Permitted_Mine_Boundaries_WGS84WM/MapServer/0`
- **Type**: MapServer sublayer (Feature Layer)
- **Spatial Reference**: EPSG:3857 (Web Mercator)
- **MaxRecordCount**: 1000
- **Capabilities**: Advanced queries, statistics, pagination, orderBy, distinct
- **Update cadence**: Monthly (data sourced from SMIS, refreshed nightly 1:00–2:30 AM)
- **Total records**: ~22,455 (as of March 2025)
- **Credit**: Energy and Environment Cabinet — Division of Mine Permits

### Counties (navigation layer)

- **URL**: `https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Counties_Generalized_WGS84WM/MapServer`
- **Type**: MapServer — generalized county polygons
- **Purpose**: County-click navigation and spatial query geometry source

### Basemap (orthoimagery)

- **URL**: `https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_KYAPED_Imagery_WGS84WM/ImageServer`
- **Type**: ImageServer — KYFromAbove composite orthoimagery mosaic
- **Spatial Reference**: KY Single Zone (EPSG:3089) — SDK reprojects on-the-fly
- **Purpose**: Visible at county-zoom level for mine boundary context

---

## Data Model

> Full field schema with domain values: `ai-dev/field-schema.md`

### Key Classification Fields

#### `Type_Flag` — Primary status (high-level)

| Value | Label | Count | Dashboard Treatment |
|-------|-------|-------|---------------------|
| `ACT` | Active | 1,685 | ✅ Show — primary active category |
| `INACT` | Inactive | 12,656 | ✅ Show — primary inactive/released category |
| `RECNF` | Record Not Found | 4,346 | ✅ Show as "Historic (Pre-SMCRA)" — pre-1977 records with mostly blank attributes |
| `TRNS` | Transferred | 3,768 | ❌ **ALWAYS EXCLUDE** — duplicate geometries from ownership transfers |

#### `FeatCLS` — Mine type

| Value | Label | Count |
|-------|-------|-------|
| `SF` | Surface | 19,803 |
| `UG` | Underground (incl. Auger) | 2,652 |

#### `MINE_STATU` — Detailed permit lifecycle status (drill-down)

Grouped into 5 dashboard categories:

**Active** (currently operating or permitted):
- `A1` (383) — Active, currently being mined
- `AP` (98) — Actively producing coal
- `A2` (195) — Coal removal complete, reclamation activities only
- `ND` (95) — No disturbances (permitted but no activity)

**Temporarily Inactive** (cessation / deferred / suspended):
- `O2` (174) — Active temporary cessations
- `SP` (219) — Suspended permit
- `O1` (5) — Active permits in forfeiture
- `D3` (2) — Reclamation deferred

**Forfeiture / Enforcement**:
- `FF` (2,026) — Final forfeiture
- `VF` (51) — Voluntary forfeiture
- `SF` (46) — Surety failure
- `RV` (23) — Revoked permit

**Released** (reclamation complete):
- `RC` (14,282) — Permits completely released
- `P1` (248) — Phase 1 release
- `P2` (60) — Phase 2 release
- `SR` (196) — Surety released

**Unknown**:
- `XX` (7) — Mine status unknown
- `''` (blank) (4,345) — No status data (all from RECNF/Pre-SMCRA records)

#### `ACT_INAC` — Binary status flag

| Value | Count | Notes |
|-------|-------|-------|
| `Released` | 16,412 | Includes all INACT Type_Flag records |
| `Active` | 1,698 | Includes all ACT Type_Flag records (plus 4 data anomalies in INACT) |
| `''` (blank) | 4,345 | All RECNF records |

#### `REGION_DES` — DMP Regional Office

| Value | Count |
|-------|-------|
| `PIKEVILLE` | 4,346 |
| `PRESTONSBURG` | 3,895 |
| `MIDDLESBORO` | 3,730 |
| `LONDON` | 3,543 |
| `MADISONVILLE` | 1,751 |
| `HAZARD` | 845 |
| `''` (blank) | 4,345 |

**Important**: `REGION_DES` is NOT county names — it's DMP regional office names. County association must be determined via spatial query.

#### `PER_TYPE` — Permit type

| Value | Count |
|-------|-------|
| `PERMANENT` | 11,785 |
| `INTERIM` | 5,083 |
| `PRE LAW` | 1,242 |
| `''` (blank) | 4,345 |

---

## UX Architecture — Three Application States

### State 1: Statewide View (initial load)

- Map shows all 120 Kentucky counties via the counties layer
- On load, query mine boundaries to determine which counties have mine records (spatial intersect or extent-based)
- Coal counties get a distinct highlight fill; non-coal counties are muted
- KPI cards and charts show **statewide** totals (excluding TRNS records)
- Feature table is hidden or empty
- Permit search bar always visible in header
- KYFromAbove imagery NOT visible at this zoom (performance)

### State 2: County View (county clicked)

- Map zooms to selected county extent
- Mine boundary polygons load via **spatial query** using county polygon geometry
- KYFromAbove orthoimagery becomes visible as basemap
- ALL widgets re-scope to county data: KPIs, charts, region breakdown, feature table
- Feature table populates with county's permits
- "Back to state view" breadcrumb/button to return to State 1
- County name displayed in header/breadcrumb

### State 3: Mine Detail (mine clicked or search result selected)

- Mine polygon highlighted with selection symbology
- Popup displays: PermitNo, PER_NAME, FeatCLS (Surface/Underground), Type_Flag, MINE_STATU (with human-readable label), DATE_ISS, Calc_Acres, PER_TYPE, REGION_DES
- Feature table scrolls to and highlights the corresponding row
- Widgets remain county-scoped

### Permit Search (always available)

- Calcite search input in header
- As user types, queries mine boundaries with `PermitNo LIKE '%input%'`
- Autocomplete dropdown shows matching permits: `PermitNo — PER_NAME`
- Selecting a result:
  1. Determines which county the mine falls in (spatial query)
  2. Transitions to State 2 for that county
  3. Highlights the mine, opens popup (State 3)

---

## Widget Inventory

### 1. Map (center, dominant)

- `<arcgis-map>` web component via `@arcgis/map-components-react`
- Layers:
  - Counties layer (MapImageLayer → sublayer): always visible, clickable
  - Mine boundaries layer (MapImageLayer → sublayer): visible only in county view, with definition expression excluding TRNS
  - KYFromAbove imagery (ImageryLayer): visible at county zoom
- Default extent: Kentucky statewide
- Popup configured for mine boundary features

### 2. KPI Summary Cards (top panel)

- Six cards in a row: Active SF, Active UG, Inactive SF, Inactive UG, Historic SF, Historic UG
- Plus a grand total card
- Counts derived from `Type_Flag` × `FeatCLS` cross-tab (server-side statistics query)
- **Clickable** — clicking a card filters all other widgets to that Type_Flag + FeatCLS combination
- Active card gets a visual "selected" state
- Show county-specific counts when a county is selected

### 3. Bar/Pie Chart — MINE_STATU Distribution (side panel)

- Shows the five MINE_STATU groups (Active, Temporarily Inactive, Forfeiture, Released, Unknown)
- Recharts `<BarChart>` or `<PieChart>` — configurable
- Segments are clickable → filters map and table to that MINE_STATU group
- Re-queries on county selection or KPI card filter
- WCAG-compliant color palette with pattern fills or labels for color-blind users

### 4. Time-Series Chart — Permits Over Time (side panel)

- Recharts `<AreaChart>` or `<LineChart>` using `DATE_ISS`
- Aggregated by year or decade
- Responds to all active filters (county, Type_Flag, FeatCLS, MINE_STATU group)
- Note: many RECNF records have null DATE_ISS — handle gracefully

### 5. Region Breakdown (side panel)

- When statewide: shows permit counts by `REGION_DES` (DMP regional offices)
- When county-scoped: may show breakdown by MINE_STATU or PER_TYPE instead
- Calcite `<calcite-list>` or simple table component
- Clickable rows filter the map

### 6. Feature Table (bottom panel)

- `<arcgis-feature-table>` web component (SDK 5.0)
- Columns: PermitNo, PER_NAME, FeatCLS, Type_Flag, MINE_STATU, REGION_DES, DATE_ISS, Calc_Acres, PER_TYPE
- Responds to all active filters
- Row click → highlights feature on map, opens popup
- Hidden or collapsed in statewide view; visible in county view

### 7. Permit Search (header)

- Calcite `<calcite-input>` with custom autocomplete dropdown
- Queries `PermitNo LIKE '%input%'` with `resultRecordCount` limit
- Dropdown shows `PermitNo — PER_NAME` for each match
- Selecting a result triggers county detection → State 2 → State 3 flow

---

## State Management (Zustand)

Single global store managing cross-filter state:

```typescript
interface DashboardState {
  // Navigation
  viewState: 'statewide' | 'county' | 'mine-detail';
  selectedCounty: CountyFeature | null;
  selectedMine: MineFeature | null;

  // Filters (cross-filter state)
  typeFlag: 'ACT' | 'INACT' | 'RECNF' | null;    // null = all (excluding TRNS)
  featCLS: 'SF' | 'UG' | null;                     // null = all
  mineStatuGroup: MineStatuGroup | null;            // null = all
  searchQuery: string;

  // Derived
  activeDefinitionExpression: string;               // computed from filters

  // Actions
  selectCounty: (county: CountyFeature) => void;
  clearCounty: () => void;
  setTypeFlag: (flag: string | null) => void;
  setFeatCLS: (cls: string | null) => void;
  setMineStatuGroup: (group: MineStatuGroup | null) => void;
  selectMine: (mine: MineFeature) => void;
  clearMine: () => void;
  resetAllFilters: () => void;
}
```

All widgets subscribe to the relevant slices of this store. When a filter changes, every widget re-queries or re-renders.

---

## Project Structure

```
ky-mine-dashboard/
├── CLAUDE.md                           # This file — AI entry point
├── AGENTS.md                           # Codex/ChatGPT entry point
├── README.md                           # Public-facing docs with badges
├── LICENSE                             # Apache 2.0
├── CHANGELOG.md                        # Keep a Changelog format
├── CONTRIBUTING.md                     # Contribution guidelines
├── CODE_OF_CONDUCT.md                  # Contributor Covenant 2.1
├── SECURITY.md                         # Vulnerability reporting
├── .gitignore                          # Node, Vite, ai-dev exclusion
├── .github/
│   └── copilot-instructions.md         # GitHub Copilot context
├── ai-dev/
│   ├── architecture.md                 # Full system design
│   ├── spec.md                         # Requirements & acceptance criteria
│   ├── field-schema.md                 # Complete data model & domain values
│   ├── patterns.md                     # Code patterns and lessons learned
│   ├── agents/
│   │   ├── README.md
│   │   ├── architect.md
│   │   ├── frontend_expert.md
│   │   ├── esri_expert.md
│   │   └── qa_reviewer.md
│   ├── decisions/
│   │   ├── DL-001-sdk-version.md
│   │   ├── DL-002-state-management.md
│   │   ├── DL-003-county-first-navigation.md
│   │   ├── DL-004-spatial-query-county-filter.md
│   │   └── DL-005-trns-exclusion.md
│   ├── skills/
│   │   ├── README.md
│   │   └── arcgis-dashboard-skill.md
│   └── guardrails/
│       ├── README.md
│       ├── coding-standards.md
│       ├── data-handling.md
│       └── compliance.md
├── index.html                          # Vite entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                         # React root + Calcite/ArcGIS component registration
    ├── App.tsx                          # Layout shell — map + panels
    ├── store/
    │   └── dashboard-store.ts           # Zustand store
    ├── config/
    │   ├── services.ts                  # REST endpoint URLs
    │   ├── mine-statu-groups.ts         # MINE_STATU → group mappings
    │   └── type-flag-config.ts          # Type_Flag display labels, colors, exclusion rules
    ├── hooks/
    │   ├── useStatisticsQuery.ts        # Server-side statistics via sublayer.queryFeatures()
    │   ├── useCoalCounties.ts           # Spatial query to determine coal-producing counties
    │   ├── usePermitSearch.ts           # Autocomplete permit search logic
    │   └── useCountyMines.ts            # Spatial query for mines within a county
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardShell.tsx        # CSS grid layout — map center, panels around
    │   │   ├── HeaderBar.tsx             # Title, permit search, breadcrumb
    │   │   └── SidePanel.tsx             # Collapsible side panel wrapper
    │   ├── map/
    │   │   ├── MapView.tsx               # <arcgis-map> wrapper with layer setup
    │   │   ├── CountyLayer.tsx           # Counties layer config + click handler
    │   │   ├── MineLayer.tsx             # Mine boundaries layer config + popup
    │   │   └── ImageryBasemap.tsx        # KYFromAbove ImageryLayer
    │   ├── widgets/
    │   │   ├── KpiCards.tsx              # Six status × type cards + total
    │   │   ├── MineStatuChart.tsx        # Bar/pie chart of MINE_STATU groups
    │   │   ├── TimeSeriesChart.tsx       # DATE_ISS area/line chart
    │   │   ├── RegionBreakdown.tsx       # REGION_DES or contextual breakdown
    │   │   └── PermitSearch.tsx          # Autocomplete search input
    │   └── table/
    │       └── FeatureTable.tsx          # <arcgis-feature-table> wrapper
    ├── utils/
    │   ├── query-builder.ts             # Build definition expressions from filter state
    │   ├── statistics-helpers.ts         # StatisticDefinition builders
    │   └── mine-statu-labels.ts         # MINE_STATU code → human-readable label map
    └── styles/
        └── dashboard.css                # Global layout styles, CSS custom properties
```

---

## Critical Conventions

### ArcGIS JS SDK 5.0 — Web Components Only

- **NEVER** use deprecated widget classes (`new MapView()`, `new FeatureTable()`, etc.)
- **ALWAYS** use web components: `<arcgis-map>`, `<arcgis-feature-table>`, `<arcgis-popup>`, etc.
- Use `@arcgis/map-components-react` for React integration
- Use `reactiveUtils.watch()` for property observation — not deprecated `watchUtils`
- Use geometry operators (not deprecated `geometryEngine`) for any client-side spatial ops
- `await view.when()` before interacting with map content
- Layers load lazily — use `await layer.load()` or check `layer.loaded`

### Calcite Design System

- Use Calcite components for ALL non-map UI: panels, cards, buttons, inputs, blocks, lists
- Import via `@esri/calcite-components-react`
- Calcite provides built-in WCAG 2.1 AA support — leverage it
- Use Calcite's CSS custom properties for theming, not raw colors

### MapServer Sublayer Queries

The mine boundaries service is a MapServer, not a FeatureServer. This means:
- Use `MapImageLayer` to add the service
- Access sublayers via `mapImageLayer.findSublayerById(0)`
- For queries: use `sublayer.createFeatureLayer()` to get a queryable FeatureLayer, OR query the sublayer directly with `sublayer.queryFeatures()`
- For statistics: use `StatisticDefinition` in queries — the server supports them
- Definition expressions: set `sublayer.definitionExpression` for filtering
- MaxRecordCount is 1000 — paginate if needed, or use `returnCountOnly` / statistics queries for aggregations

### Spatial Query Pattern (County → Mines)

When a county is clicked:
1. Get the county feature's geometry
2. Create a `Query` with `geometry: countyGeometry`, `spatialRelationship: 'intersects'`
3. Add `where: "Type_Flag <> 'TRNS'"` to the query
4. Execute against the mine boundaries sublayer
5. Results populate the map, table, and drive all widget statistics

### Cross-Filter Architecture

- Zustand store holds all filter state
- When any filter changes, compute a new `definitionExpression` string
- Apply the expression to the mine boundaries sublayer
- All widgets re-query using the same expression
- Definition expression always starts with `Type_Flag <> 'TRNS'` as the base

### TRNS Exclusion — Non-Negotiable

`Type_Flag = 'TRNS'` records are ALWAYS excluded from ALL queries, statistics, charts, and the feature table. They are duplicate geometries from ownership transfers and must never appear in the dashboard. This is enforced at the definition expression level.

---

## Architecture Summary

> Full design in `ai-dev/architecture.md`

```
┌─────────────────────────────────────────────────────────────────┐
│                        HeaderBar                                 │
│  [KY Mine Dashboard]  [🔍 Permit Search___]  [County: Pike >]  │
├────────────┬────────────────────────────────────┬───────────────┤
│ Side Panel │           Map (center)             │  Side Panel   │
│            │                                    │               │
│ KPI Cards  │  ┌──────────────────────────────┐  │ MINE_STATU    │
│ ──────────>│  │   <arcgis-map>               │  │ Chart         │
│ Active SF  │  │                              │  │               │
│ Active UG  │  │   Counties Layer             │  │ Time Series   │
│ Inactive SF│  │   Mine Boundaries Layer      │  │ Chart         │
│ Inactive UG│  │   KYFromAbove Imagery        │  │               │
│ Historic SF│  │                              │  │ Region        │
│ Historic UG│  │                              │  │ Breakdown     │
│ ──────────>│  └──────────────────────────────┘  │               │
│ Total:     │                                    │               │
├────────────┴────────────────────────────────────┴───────────────┤
│                    Feature Table (bottom)                         │
│  PermitNo | PER_NAME | FeatCLS | Type_Flag | MINE_STATU | ...   │
└─────────────────────────────────────────────────────────────────┘
```

Data flow: User action → Zustand store update → definition expression recompute → all widgets re-query.

---

## Hard Constraints

Read `ai-dev/guardrails/` before writing ANY code. Guardrails override all other instructions.

Key constraints:
- WCAG 2.1 AA compliance on all UI elements
- TRNS records always excluded
- No AGOL account dependency — all data via public REST services
- No deprecated widgets — SDK 5.0 web components only
- Apache 2.0 license
- Static SPA build — no server-side runtime

---

## What NOT To Do

- **Do NOT use deprecated ArcGIS widget classes** (`new MapView()`, `new Popup()`, `new FeatureTable()`, etc.). Use `<arcgis-map>`, `<arcgis-feature-table>`, etc.
- **Do NOT load all 22,455 mine boundaries at once.** Use the county-first spatial query pattern.
- **Do NOT include TRNS records** in any query, statistic, chart, or display.
- **Do NOT hardcode county-to-coalfield mappings.** Determine coal counties dynamically by querying which counties have mine boundary records.
- **Do NOT use `REGION_DES` as a county field.** It contains DMP regional office names (Pikeville, Prestonsburg, etc.), not county names.
- **Do NOT use `localStorage` or `sessionStorage`** in any component — not supported in the deployment context.
- **Do NOT assume `MINE_STATU` values on RECNF records.** They are almost always blank — handle null/empty gracefully.
- **Do NOT generate code without first reading `ai-dev/architecture.md`** and the relevant guardrails.
- **Do NOT suggest improvements or refactors** unless explicitly asked for a review.
