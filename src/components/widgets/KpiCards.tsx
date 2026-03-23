import { useEffect, useState, useCallback, useRef } from "react";
import { useDashboardStore } from "../../store/dashboard-store.js";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { BASE_WHERE } from "../../config/type-flag-config.js";

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

/** Fetch KPI stats — always uses BASE_WHERE so cards stay visible regardless of filters */
async function fetchKpiStats(signal?: AbortSignal): Promise<KpiData[]> {
  const params = new URLSearchParams({
    where: BASE_WHERE,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "Type_Flag,FeatCLS",
    f: "json",
  });

  const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const [error, setError] = useState(false);
  const typeFlag = useDashboardStore((s) => s.typeFlag);
  const featCLS = useDashboardStore((s) => s.featCLS);
  const setTypeFlagAndFeatCLS = useDashboardStore((s) => s.setTypeFlagAndFeatCLS);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(false);

    fetchKpiStats(ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) setStats(data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("KPI fetch failed:", err);
        if (!ctrl.signal.aborted) setError(true);
      });

    return () => ctrl.abort();
  }, []);

  useEffect(() => load(), [load]);

  const handleClick = useCallback(
    (tf: string, fc: string) => {
      setTypeFlagAndFeatCLS(tf, fc);
    },
    [setTypeFlagAndFeatCLS],
  );

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  if (error) {
    return (
      <div className="indicator-strip" role="group" aria-label="Mine count indicators">
        <div className="indicator" style={{ flex: "unset", width: "100%", cursor: "default" }}>
          <div className="indicator__label">
            Failed to load data.{" "}
            <span onClick={load} role="button" tabIndex={0} style={{ cursor: "pointer", textDecoration: "underline" }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") load(); }}>
              Retry
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="indicator-strip" role="group" aria-label="Mine count indicators">
        <div className="indicator" style={{ flex: "unset", width: "100%", cursor: "default" }}>
          <div className="indicator__label">Loading mine data...</div>
        </div>
      </div>
    );
  }

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
