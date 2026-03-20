import { useEffect, useState, useCallback } from "react";
import { useDashboardStore } from "../../store/dashboard-store.js";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";

interface KpiData {
  label: string;
  typeFlag: string;
  featCLS: string;
  count: number;
  category: "active" | "inactive" | "historic";
}

const TYPE_LABELS: Record<string, { label: string; category: "active" | "inactive" | "historic" }> = {
  ACT: { label: "Active", category: "active" },
  INACT: { label: "Inactive", category: "inactive" },
  RECNF: { label: "Historic", category: "historic" },
};

async function fetchKpiStats(where: string): Promise<KpiData[]> {
  const params = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "Type_Flag,FeatCLS",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
  const data = await res.json() as {
    features: Array<{ attributes: { Type_Flag: string; FeatCLS: string; cnt: number } }>;
  };

  return data.features
    .filter((f) => TYPE_LABELS[f.attributes.Type_Flag])
    .map((f) => {
      const cfg = TYPE_LABELS[f.attributes.Type_Flag]!;
      return {
        label: `${cfg.label} ${f.attributes.FeatCLS === "SF" ? "Surface" : "UG"}`,
        typeFlag: f.attributes.Type_Flag,
        featCLS: f.attributes.FeatCLS,
        count: f.attributes.cnt,
        category: cfg.category,
      };
    })
    .sort((a, b) => {
      const order = { active: 0, inactive: 1, historic: 2 };
      return order[a.category] - order[b.category] || b.count - a.count;
    });
}

export function KpiCards(): React.JSX.Element {
  const [stats, setStats] = useState<KpiData[]>([]);
  const typeFlag = useDashboardStore((s) => s.typeFlag);
  const featCLS = useDashboardStore((s) => s.featCLS);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);
  const setTypeFlag = useDashboardStore((s) => s.setTypeFlag);
  const setFeatCLS = useDashboardStore((s) => s.setFeatCLS);

  useEffect(() => {
    fetchKpiStats(definitionExpression).then(setStats).catch(console.error);
  }, [definitionExpression]);

  const handleClick = useCallback(
    (tf: string, fc: string) => {
      setTypeFlag(tf);
      setFeatCLS(fc);
    },
    [setTypeFlag, setFeatCLS],
  );

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="indicator-strip" role="group" aria-label="Mine count indicators">
      {stats.map((s) => {
        const selected = typeFlag === s.typeFlag && featCLS === s.featCLS;
        return (
          <div
            key={`${s.typeFlag}-${s.featCLS}`}
            className={`indicator indicator--${s.category} ${selected ? "indicator--selected" : ""}`}
            onClick={() => handleClick(s.typeFlag, s.featCLS)}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(s.typeFlag, s.featCLS); }}
          >
            <div className="indicator__value">{s.count.toLocaleString()}</div>
            <div className="indicator__label">{s.label}</div>
          </div>
        );
      })}
      {stats.length > 0 && (
        <div className="indicator indicator--total">
          <div className="indicator__value">{total.toLocaleString()}</div>
          <div className="indicator__label">Total</div>
        </div>
      )}
    </div>
  );
}
