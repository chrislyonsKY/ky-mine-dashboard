import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";

import { useEffect, useState } from "react";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface RegionData {
  region: string;
  count: number;
}

async function fetchRegionStats(where: string): Promise<RegionData[]> {
  const params = new URLSearchParams({
    where: `${where} AND REGION_DES IS NOT NULL AND REGION_DES <> ''`,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "REGION_DES",
    orderByFields: "cnt DESC",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { REGION_DES: string; cnt: number } }>;
  };

  return data.features.map((f) => ({
    region: f.attributes.REGION_DES,
    count: f.attributes.cnt,
  }));
}

export function RegionBreakdown(): React.JSX.Element {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);

  useEffect(() => {
    fetchRegionStats(definitionExpression).then(setRegions).catch(console.error);
  }, [definitionExpression]);

  return (
    <calcite-list selection-mode="none" label="Regional breakdown">
      {regions.map((r) => (
        <calcite-list-item
          key={r.region}
          label={r.region.charAt(0) + r.region.slice(1).toLowerCase()}
          description={`${r.count.toLocaleString()} permits`}
        />
      ))}
      {regions.length === 0 && (
        <calcite-list-item label="Loading..." />
      )}
    </calcite-list>
  );
}
