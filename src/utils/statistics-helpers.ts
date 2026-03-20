/** Helpers for building ArcGIS StatisticDefinition objects */

export interface StatDefInput {
  statisticType: 'count' | 'sum' | 'min' | 'max' | 'avg';
  onStatisticField: string;
  outStatisticFieldName: string;
}

/** Build a count statistic on OBJECTID */
export function countStat(outName: string): StatDefInput {
  return {
    statisticType: 'count',
    onStatisticField: 'OBJECTID',
    outStatisticFieldName: outName,
  };
}
