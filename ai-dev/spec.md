# Specification — KY Mine Dashboard

## Purpose

Provide an interactive, publicly accessible dashboard displaying Kentucky's permitted coal mine boundaries — active, inactive, released, and historic — with county-based navigation, orthoimagery context, and cross-filtered analytical widgets.

---

## Functional Requirements

### FR-01: County-First Navigation
- On load, display all 120 KY counties with coal-producing counties visually highlighted
- Coal counties determined dynamically by querying which counties intersect mine boundary features
- Clicking a coal county zooms to its extent and loads mine boundaries within it
- Non-coal county clicks show a "No mine data" message or are non-interactive

### FR-02: Mine Boundary Display
- Mine polygons rendered by `FeatCLS`: Surface (hatched blue) and Underground (solid red)
- `Type_Flag = 'TRNS'` records never displayed
- Clicking a mine polygon opens a popup with all key attributes
- Popup fields: PermitNo, PER_NAME, FeatCLS, Type_Flag, MINE_STATU (human label), DATE_ISS, Calc_Acres, PER_TYPE, REGION_DES

### FR-03: KPI Summary Cards
- Six cards: Active SF, Active UG, Inactive SF, Inactive UG, Historic SF, Historic UG
- Plus a Total card
- Counts from server-side statistics queries
- Scope: statewide in State 1, county-specific in State 2
- Clickable — acts as a cross-filter

### FR-04: MINE_STATU Distribution Chart
- Bar or pie chart showing five grouped categories
- Clickable segments filter other widgets
- Responds to county selection and KPI card filters

### FR-05: Time-Series Chart
- Permits issued over time using DATE_ISS
- Aggregated by year (or decade for large ranges)
- Null dates excluded gracefully (with note about RECNF records)

### FR-06: Region Breakdown
- Statewide: counts by REGION_DES (DMP regional offices)
- County-scoped: breakdown by MINE_STATU or PER_TYPE

### FR-07: Feature Table
- Tabular view of filtered mine records
- Columns: PermitNo, PER_NAME, FeatCLS, Type_Flag, MINE_STATU, REGION_DES, DATE_ISS, Calc_Acres, PER_TYPE
- Row click highlights feature on map and opens popup
- Hidden in statewide view; visible in county view

### FR-08: Permit Search
- Always-visible search bar in header
- Autocomplete dropdown querying PermitNo with LIKE filter
- Shows PermitNo + PER_NAME for each match
- Selecting a result navigates to the mine's county, highlights it, opens popup

### FR-09: Cross-Filtering
- All widgets interconnected via shared filter state
- Clicking a KPI card, chart segment, region row, or table row filters all other widgets
- "Clear filters" resets to default view for current scope (statewide or county)

### FR-10: Back Navigation
- "Back to state view" button/breadcrumb when in county view
- Clears county selection, returns to statewide KPIs and county map

---

## Non-Functional Requirements

### NFR-01: Performance
- Initial load < 3s on broadband
- County transition < 2s (spatial query + render)
- Statistics queries < 1s (server-side aggregation)
- Permit search debounced at 300ms

### NFR-02: Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigable
- Screen reader compatible (ARIA landmarks, live regions)
- Color not sole means of conveying information

### NFR-03: Browser Support
- Chrome 120+, Firefox 120+, Edge 120+, Safari 17+
- No Internet Explorer support

### NFR-04: Hosting
- Static SPA — GitHub Pages
- No server-side runtime
- No AGOL account dependency

### NFR-05: Data Currency
- Dashboard consumes live REST services
- Data reflects monthly updates from DMP
- No client-side caching beyond session

---

## Acceptance Criteria

1. ✅ Dashboard loads showing Kentucky counties with coal counties highlighted
2. ✅ Clicking a coal county loads mine boundaries via spatial query
3. ✅ KPI cards show correct counts matching server-side statistics
4. ✅ TRNS records never appear in any widget, chart, or table
5. ✅ All widgets cross-filter when a KPI card, chart segment, or table row is clicked
6. ✅ Permit search returns matching results with autocomplete
7. ✅ Selecting a search result navigates to the correct county and highlights the mine
8. ✅ Back navigation returns to statewide view with statewide statistics
9. ✅ KYFromAbove imagery visible at county zoom level
10. ✅ Passes WCAG 2.1 AA automated checks (axe-core or similar)
11. ✅ Builds to static files deployable to GitHub Pages
