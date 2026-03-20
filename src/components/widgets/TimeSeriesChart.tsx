import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface DecadeDatum {
  decade: string;
  Active: number;
  Inactive: number;
  Historic: number;
}

const TYPE_LABELS: Record<string, keyof Omit<DecadeDatum, "decade">> = {
  ACT: "Active",
  INACT: "Inactive",
  RECNF: "Historic",
};

async function fetchTimeSeries(where: string): Promise<DecadeDatum[]> {
  const params = new URLSearchParams({
    where: `${where} AND DATE_ISS IS NOT NULL`,
    outFields: "DATE_ISS,Type_Flag",
    returnGeometry: "false",
    resultRecordCount: "2000",
    orderByFields: "DATE_ISS ASC",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = (await res.json()) as {
    features: Array<{ attributes: { DATE_ISS: number | null; Type_Flag: string } }>;
  };

  const decades: Record<string, DecadeDatum> = {};

  for (const f of data.features) {
    const ts = f.attributes.DATE_ISS;
    if (!ts) continue;
    const year = new Date(ts).getFullYear();
    const decadeNum = Math.floor(year / 10) * 10;
    const decadeKey = `${decadeNum}s`;

    if (!decades[decadeKey]) {
      decades[decadeKey] = { decade: decadeKey, Active: 0, Inactive: 0, Historic: 0 };
    }

    const category = TYPE_LABELS[f.attributes.Type_Flag];
    if (category) {
      decades[decadeKey][category]++;
    }
  }

  return Object.values(decades).sort((a, b) => a.decade.localeCompare(b.decade));
}

export function TimeSeriesChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<DecadeDatum[]>([]);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);

  useEffect(() => {
    fetchTimeSeries(definitionExpression).then(setChartData).catch(console.error);
  }, [definitionExpression]);

  if (chartData.length === 0) {
    return <p style={{ padding: "8px", fontSize: "12px" }}>Loading...</p>;
  }

  return (
    <div className="chart-container" role="img" aria-label="Stacked area chart of permits issued over time by status and decade">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <XAxis dataKey="decade" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Area type="monotone" dataKey="Active" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
          <Area type="monotone" dataKey="Inactive" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.6} />
          <Area type="monotone" dataKey="Historic" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
