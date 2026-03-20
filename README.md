# KY Mine Dashboard

Interactive dashboard for Kentucky's permitted coal mine boundaries. Displays active, inactive, released, and historic (pre-SMCRA) mines with cross-filtered analytics.

**Data source:** [KY Division of Mine Permits](https://eec.ky.gov/Natural-Resources/Mining/Mine-Permits/Pages/default.aspx) via KyGeoNet REST services.

## Tech Stack

- **ArcGIS Maps SDK for JS 5.0** — map, layers, spatial queries
- **Calcite Design System** — UI components (WCAG 2.1 AA)
- **React 19** + **TypeScript 5.9** — component architecture
- **Recharts** — charts (bar, pie, area)
- **Zustand** — cross-filter state management
- **Vite 7** — build tooling

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | TypeScript type checking |

## Deployment

**GitHub Pages** (temporary): Push to `main` triggers the CI/CD pipeline in `.github/workflows/deploy.yml`.

**ArcGIS Online** (target): Production build output (`dist/`) can be uploaded as a web app item.

## Data Sources

| Layer | URL | Type |
|-------|-----|------|
| Mine Boundaries | `kygisserver.ky.gov/.../Ky_Permitted_Mine_Boundaries_WGS84WM/MapServer/0` | MapServer |
| Counties | `kygisserver.ky.gov/.../Ky_Census_County_2020_WGS84WM/MapServer/0` | MapServer |
| Orthoimagery | `kyraster.ky.gov/.../Ky_KYAPED_Imagery_WGS84WM/ImageServer` | ImageServer |

All services are public — no API keys or authentication required.

## License

GPL-3.0 — applies to the dashboard code, not the data.

**Data credit:** Energy and Environment Cabinet — Division of Mine Permits
**Imagery credit:** KYFromAbove / DGI
