import { BASE_WHERE } from '../config/type-flag-config.js';
import { MINE_STATU_GROUPS, type MineStatuGroup } from '../config/mine-statu-groups.js';

/** Build a definition expression from the current filter state */
export function buildDefinitionExpression(filters: {
  typeFlag: string | null;
  featCLS: string | null;
  mineStatuGroup: MineStatuGroup | null;
}): string {
  const clauses: string[] = [BASE_WHERE];

  if (filters.typeFlag) {
    clauses.push(`Type_Flag = '${filters.typeFlag}'`);
  }

  if (filters.featCLS) {
    clauses.push(`FeatCLS = '${filters.featCLS}'`);
  }

  if (filters.mineStatuGroup) {
    const group = MINE_STATU_GROUPS.find((g) => g.label === filters.mineStatuGroup);
    if (group) {
      const codes = group.codes.map((c) => (c === '' ? "''" : `'${c}'`)).join(', ');
      if (group.codes.includes('')) {
        clauses.push(`(MINE_STATU IN (${codes}) OR MINE_STATU IS NULL)`);
      } else {
        clauses.push(`MINE_STATU IN (${codes})`);
      }
    }
  }

  return clauses.join(' AND ');
}
