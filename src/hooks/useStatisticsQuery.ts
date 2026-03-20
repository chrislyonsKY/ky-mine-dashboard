import { useEffect, useState } from "react";
import { MINE_BOUNDARIES_URL } from "../config/services.js";
import { BASE_WHERE } from "../config/type-flag-config.js";

interface StatQueryOptions {
  groupByFields: string[];
  where?: string;
}

interface StatResult {
  attributes: Record<string, unknown>;
}

/** Query server-side statistics from the mine boundaries service */
export function useStatisticsQuery({ groupByFields, where }: StatQueryOptions) {
  const [data, setData] = useState<StatResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      where: where ?? BASE_WHERE,
      outStatistics: JSON.stringify([
        {
          statisticType: "count",
          onStatisticField: "OBJECTID",
          outStatisticFieldName: "cnt",
        },
      ]),
      groupByFieldsForStatistics: groupByFields.join(","),
      f: "json",
    });

    setLoading(true);
    fetch(`${MINE_BOUNDARIES_URL}/query?${params}`)
      .then((res) => res.json())
      .then((json: { features: StatResult[] }) => {
        setData(json.features);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [groupByFields.join(","), where]);

  return { data, loading };
}
