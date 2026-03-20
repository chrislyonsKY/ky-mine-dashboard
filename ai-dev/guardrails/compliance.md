# Compliance Guardrails

## WCAG 2.1 Level AA — Mandatory
- All generated HTML/JSX must meet WCAG 2.1 Level AA
- Calcite components provide built-in accessibility — use them for all non-map UI
- Color must NEVER be the sole means of conveying information
  - Charts: use patterns, labels, or textures alongside color
  - KPI cards: include text labels, not just colored indicators
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- All interactive elements must have visible focus indicators
- All images and icons must have alt text or aria-label
- Use semantic HTML (landmarks, headings hierarchy)
- `aria-live` regions for dynamic content updates (KPI count changes, filter state)
- Keyboard navigation must work for all interactive elements
- Skip-to-content link at top of page

## Section 508
- Federal Section 508 compliance aligns with WCAG 2.1 AA
- As a Kentucky state government product, this dashboard should meet Section 508

## Data Attribution
- Credit line: "Data: Energy and Environment Cabinet — Division of Mine Permits"
- KYFromAbove imagery credit: "Imagery: KYFromAbove / DGI"
- Include credits in footer or about panel

## Open Data
- This dashboard consumes public open data from KyGeoNet
- No data use restrictions beyond the DGI limitation of liability disclaimer
- Apache 2.0 license applies to the dashboard code, not the data
