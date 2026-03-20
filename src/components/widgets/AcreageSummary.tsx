import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";

import { useEffect, useState } from "react";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface AcreageData {
  label: string;
  acres: number;
  count: number;
}

const TYPE_LABELS: Record<string, string> = {
  ACT: "Active",
  INACT: "Inactive",
  RECNF: "Historic",
};

/** Query total acreage by Type_Flag */
async function fetchAcreage(where: string): Promise<AcreageData[]> {
  const params = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "sum", onStatisticField: "Calc_Acres", outStatisticFieldName: "total_acres" },
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "Type_Flag",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { Type_Flag: string; total_acres: number; cnt: number } }>;
  };

  return data.features
    .filter((f) => TYPE_LABELS[f.attributes.Type_Flag])
    .map((f) => ({
      label: TYPE_LABELS[f.attributes.Type_Flag] ?? f.attributes.Type_Flag,
      acres: Math.round(f.attributes.total_acres),
      count: f.attributes.cnt,
    }));
}

export function AcreageSummary(): React.JSX.Element {
  const [data, setData] = useState<AcreageData[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);

  useEffect(() => {
    fetchAcreage(definitionExpression).then(setData).catch(console.error);
  }, [definitionExpression]);

  const totalAcres = data.reduce((s, d) => s + d.acres, 0);

  return (
    <calcite-list selection-mode="none" label="Acreage summary">
      {data.map((d) => (
        <calcite-list-item
          key={d.label}
          label={`${d.label}: ${d.acres.toLocaleString()} acres`}
          description={`${d.count.toLocaleString()} permits`}
        />
      ))}
      {data.length > 0 && (
        <calcite-list-item
          label={`Total: ${totalAcres.toLocaleString()} acres`}
          description="All categories"
        />
      )}
    </calcite-list>
  );
}
