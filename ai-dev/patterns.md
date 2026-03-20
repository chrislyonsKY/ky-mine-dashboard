# Code Patterns — KY Mine Dashboard

## Cross-Filter Definition Expression Builder

The central pattern: all filters funnel into a single definition expression string that drives every query.

```typescript
function buildDefinitionExpression(state: FilterState): string {
  const clauses: string[] = ["Type_Flag <> 'TRNS'"];  // IMMUTABLE BASE

  if (state.typeFlag) {
    clauses.push(`Type_Flag = '${state.typeFlag}'`);
  }
  if (state.featCLS) {
    clauses.push(`FeatCLS = '${state.featCLS}'`);
  }
  if (state.mineStatuGroup) {
    const codes = MINE_STATU_GROUPS[state.mineStatuGroup];
    clauses.push(`MINE_STATU IN (${codes.map(c => `'${c}'`).join(',')})`);
  }
  return clauses.join(' AND ');
}
```

## MINE_STATU Group Mapping

```typescript
const MINE_STATU_GROUPS: Record<string, string[]> = {
  'Active': ['A1', 'AP', 'A2', 'ND'],
  'Temporarily Inactive': ['O2', 'SP', 'O1', 'D3'],
  'Forfeiture / Enforcement': ['FF', 'VF', 'SF', 'RV'],
  'Released': ['RC', 'P1', 'P2', 'SR'],
  'Unknown': ['XX', ''],
};
```

## Zustand Selector Pattern

```typescript
// Always use selectors — never subscribe to entire store
const typeFlag = useDashboardStore((s) => s.typeFlag);
const setTypeFlag = useDashboardStore((s) => s.setTypeFlag);

// For derived values, use shallow equality
import { shallow } from 'zustand/shallow';
const { typeFlag, featCLS } = useDashboardStore(
  (s) => ({ typeFlag: s.typeFlag, featCLS: s.featCLS }),
  shallow
);
```

## Lessons Learned

- REGION_DES is NOT county — do not attempt to use it as a county filter
- MINE_STATU code 'SF' (Surety failure) collides with FeatCLS 'SF' (Surface) — always use the correct field
- RECNF records have blank everything except PermitNo, FeatCLS, Calc_Acres, National_I — guard all displays
- Type_Flag in the actual data uses 'RECNF' not 'XREF' as mentioned in some documentation
