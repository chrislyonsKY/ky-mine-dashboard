# Data Handling Guardrails

## TRNS Exclusion — Non-Negotiable
- `Type_Flag = 'TRNS'` records are ALWAYS excluded from every query, statistic, chart, table, and map display
- The base definition expression `Type_Flag <> 'TRNS'` must be present in every query WHERE clause
- No exception, no override, no configuration toggle — TRNS is dead code in duplicated geometries

## Service URLs
- All REST service URLs centralized in `src/config/services.ts`
- Never hardcode URLs in components or hooks
- URLs are public — no API keys or tokens required
- Both `kygisserver.ky.gov` and `kyraster.ky.gov` serve public data over HTTPS

## Null / Blank Data
- RECNF records (4,345) have blank MINE_STATU, ACT_INAC, REGION_DES, PER_TYPE, DATE_ISS
- All display components must handle null/empty values gracefully (show "N/A" or "—")
- Time-series chart must exclude null DATE_ISS records from aggregation
- Statistics queries must account for nulls in group-by results

## MaxRecordCount
- Mine boundaries service MaxRecordCount is 1000
- For feature queries: check `exceededTransferLimit` and paginate if needed
- For statistics: use `outStatistics` — not subject to MaxRecordCount
- For coal county detection: use count queries or extent queries, not full feature fetch

## No Client-Side Data Storage
- No localStorage, sessionStorage, or IndexedDB
- All data fetched fresh from REST services on each load/interaction
- In-memory caching of coal county list within a session is acceptable

## No Credentials
- No API keys, tokens, or authentication required for these public services
- Do not add `esriConfig.apiKey` unless a future requirement demands it
- No proxy needed — services support CORS
