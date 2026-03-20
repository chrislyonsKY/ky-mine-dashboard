import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { MINE_STATU_GROUPS, STATU_TO_GROUP } from "../../config/mine-statu-groups.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface ChartDatum {
  group: string;
  count: number;
  color: string;
}

async function fetchStatuStats(where: string): Promise<ChartDatum[]> {
  const params = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "MINE_STATU",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { MINE_STATU: string | null; cnt: number } }>;
  };

  const groupCounts: Record<string, number> = {};
  for (const g of MINE_STATU_GROUPS) groupCounts[g.label] = 0;

  for (const f of data.features) {
    const code = f.attributes.MINE_STATU ?? "";
    const group = STATU_TO_GROUP[code] ?? "Unknown";
    groupCounts[group] = (groupCounts[group] ?? 0) + f.attributes.cnt;
  }

  return MINE_STATU_GROUPS.map((g) => ({
    group: g.label,
    count: groupCounts[g.label] ?? 0,
    color: g.color,
  }));
}

export function MineStatuChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);
  const setMineStatuGroup = useDashboardStore((s) => s.setMineStatuGroup);

  useEffect(() => {
    fetchStatuStats(definitionExpression).then(setChartData).catch(console.error);
  }, [definitionExpression]);

  return (
    <div className="chart-container" role="img" aria-label="Bar chart of mine status distribution">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="group" width={110} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Bar
            dataKey="count"
            onClick={(_data, index) => {
              const item = chartData[index];
              if (item) setMineStatuGroup(item.group as Parameters<typeof setMineStatuGroup>[0]);
            }}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((d) => (
              <Cell key={d.group} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
