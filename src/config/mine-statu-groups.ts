/** MINE_STATU code → dashboard group mappings */

export type MineStatuGroup =
  | 'Active'
  | 'Temporarily Inactive'
  | 'Forfeiture / Enforcement'
  | 'Released'
  | 'Unknown';

export interface MineStatuGroupEntry {
  label: MineStatuGroup;
  codes: string[];
  color: string;
}

export const MINE_STATU_GROUPS: MineStatuGroupEntry[] = [
  {
    label: 'Active',
    codes: ['A1', 'AP', 'A2', 'ND'],
    color: '#34d399',
  },
  {
    label: 'Temporarily Inactive',
    codes: ['O2', 'SP', 'O1', 'D3'],
    color: '#f59e0b',
  },
  {
    label: 'Forfeiture / Enforcement',
    codes: ['FF', 'VF', 'SF', 'RV'],
    color: '#ef4444',
  },
  {
    label: 'Released',
    codes: ['RC', 'P1', 'P2', 'SR'],
    color: '#3b82f6',
  },
  {
    label: 'Unknown',
    codes: ['XX', ''],
    color: '#6b7280',
  },
];

/** Lookup: MINE_STATU code → group label */
export const STATU_TO_GROUP: Record<string, MineStatuGroup> = {};
for (const group of MINE_STATU_GROUPS) {
  for (const code of group.codes) {
    STATU_TO_GROUP[code] = group.label;
  }
}
