/** Type_Flag display configuration */

export interface TypeFlagEntry {
  code: string;
  label: string;
  color: string;
}

export const TYPE_FLAG_CONFIG: Record<string, TypeFlagEntry> = {
  ACT: { code: 'ACT', label: 'Active', color: '#2ecc71' },
  INACT: { code: 'INACT', label: 'Inactive', color: '#e67e22' },
  RECNF: { code: 'RECNF', label: 'Historic (Pre-SMCRA)', color: '#95a5a6' },
};

/** TRNS is always excluded — never add it here */
export const EXCLUDED_TYPE_FLAGS = ['TRNS'] as const;

/** Base WHERE clause applied to every query */
export const BASE_WHERE = "Type_Flag <> 'TRNS'";
