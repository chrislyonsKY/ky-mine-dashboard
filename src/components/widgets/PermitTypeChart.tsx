import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface PermitTypeDatum {
  type: string;
  count: number;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  PERMANENT: "#2563eb",
  INTERIM: "#d97706",
  "PRE LAW": "#7c3aed",
};

async function fetchPermitTypes(where: string): Promise<PermitTypeDatum[]> {
  const params = new URLSearchParams({
    where: `${where} AND PER_TYPE IS NOT NULL AND PER_TYPE <> ''`,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "PER_TYPE",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { PER_TYPE: string; cnt: number } }>;
  };

  return data.features.map((f) => ({
    type: f.attributes.PER_TYPE,
    count: f.attributes.cnt,
    color: TYPE_COLORS[f.attributes.PER_TYPE] ?? "#6b7280",
  }));
}

export function PermitTypeChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<PermitTypeDatum[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);

  useEffect(() => {
    fetchPermitTypes(definitionExpression).then(setChartData).catch(console.error);
  }, [definitionExpression]);

  if (chartData.length === 0) {
    return <p style={{ padding: "8px", fontSize: "12px" }}>Loading...</p>;
  }

  return (
    <div className="chart-container" role="img" aria-label="Pie chart of permit types">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label={({ type, percent }) =>
              `${type} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
            fontSize={10}
          >
            {chartData.map((d) => (
              <Cell key={d.type} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
