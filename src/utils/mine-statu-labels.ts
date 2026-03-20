/** MINE_STATU code → human-readable label */
export const MINE_STATU_LABELS: Record<string, string> = {
  A1: 'Active — Currently Mined',
  AP: 'Actively Producing',
  A2: 'Coal Removal Complete',
  ND: 'No Disturbances',
  O2: 'Temporary Cessation',
  SP: 'Suspended Permit',
  O1: 'In Forfeiture',
  D3: 'Reclamation Deferred',
  FF: 'Final Forfeiture',
  VF: 'Voluntary Forfeiture',
  SF: 'Surety Failure',
  RV: 'Revoked',
  RC: 'Released',
  P1: 'Phase 1 Release',
  P2: 'Phase 2 Release',
  SR: 'Surety Released',
  XX: 'Unknown',
  '': 'No Data',
};

/** Get a label for a MINE_STATU code, handling null/blank */
export function getMineStatuLabel(code: string | null | undefined): string {
  if (code == null || code === '') return 'No Data';
  return MINE_STATU_LABELS[code] ?? code;
}
