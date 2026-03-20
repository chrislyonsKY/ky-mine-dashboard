import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface FeatCLSDatum {
  category: string;
  Surface: number;
  Underground: number;
}

const TYPE_LABELS: Record<string, string> = {
  ACT: "Active",
  INACT: "Inactive",
  RECNF: "Historic",
};

async function fetchSurfaceVsUG(where: string): Promise<FeatCLSDatum[]> {
  const params = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "Type_Flag,FeatCLS",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { Type_Flag: string; FeatCLS: string; cnt: number } }>;
  };

  const grouped: Record<string, { Surface: number; Underground: number }> = {};
  for (const f of data.features) {
    const label = TYPE_LABELS[f.attributes.Type_Flag];
    if (!label) continue;
    if (!grouped[label]) grouped[label] = { Surface: 0, Underground: 0 };
    if (f.attributes.FeatCLS === "SF") grouped[label].Surface += f.attributes.cnt;
    else grouped[label].Underground += f.attributes.cnt;
  }

  return Object.entries(grouped).map(([category, vals]) => ({
    category,
    ...vals,
  }));
}

export function SurfaceVsUnderground(): React.JSX.Element {
  const [chartData, setChartData] = useState<FeatCLSDatum[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);

  useEffect(() => {
    fetchSurfaceVsUG(definitionExpression).then(setChartData).catch(console.error);
  }, [definitionExpression]);

  if (chartData.length === 0) {
    return <p style={{ padding: "8px", fontSize: "12px" }}>Loading...</p>;
  }

  return (
    <div className="chart-container" role="img" aria-label="Stacked bar chart of surface vs underground mines">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
          <XAxis dataKey="category" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="Surface" stackId="a" fill="#2563eb" />
          <Bar dataKey="Underground" stackId="a" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
