import "@esri/calcite-components/components/calcite-notice";
import "@esri/calcite-components/components/calcite-icon";

import { useEffect, useState, useCallback, useRef } from "react";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";
import { useDashboardStore } from "../../store/dashboard-store.js";

interface Insight {
  icon: string;
  kind: "brand" | "info" | "success" | "warning";
  text: string;
}

async function generateInsights(where: string, signal?: AbortSignal): Promise<Insight[]> {
  const insights: Insight[] = [];
  const fetchOpts = { signal };

  // Total count
  const countRes = await fetch(
    `${MINE_BOUNDARIES_URL}/query?where=${encodeURIComponent(where)}&returnCountOnly=true&f=json`,
    fetchOpts,
  );
  if (!countRes.ok) throw new Error(`HTTP ${countRes.status}`);
  const countData = (await countRes.json()) as { count: number };
  const total = countData.count;

  // Stats by Type_Flag
  const statsParams = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
      { statisticType: "sum", onStatisticField: "Calc_Acres", outStatisticFieldName: "acres" },
    ]),
    groupByFieldsForStatistics: "Type_Flag",
    f: "json",
  });
  const statsRes = await fetch(`${MINE_BOUNDARIES_URL}/query?${statsParams}`, fetchOpts);
  if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
  const statsData = (await statsRes.json()) as {
    features: Array<{ attributes: { Type_Flag: string; cnt: number; acres: number } }>;
  };

  const byType: Record<string, { cnt: number; acres: number }> = {};
  for (const f of statsData.features) {
    byType[f.attributes.Type_Flag] = { cnt: f.attributes.cnt, acres: f.attributes.acres };
  }

  const active = byType["ACT"];
  const inactive = byType["INACT"];
  const totalAcres = Object.values(byType).reduce((s, v) => s + (v.acres || 0), 0);

  if (active && inactive) {
    const releasedPct = ((inactive.cnt / total) * 100).toFixed(0);
    insights.push({
      icon: "check-circle",
      kind: "success",
      text: `${releasedPct}% of all permits have been released or closed`,
    });
  }

  if (active) {
    const activePct = ((active.cnt / total) * 100).toFixed(1);
    insights.push({
      icon: "exclamation-mark-triangle",
      kind: "warning",
      text: `Only ${activePct}% of permits (${active.cnt.toLocaleString()}) are currently active`,
    });
  }

  if (totalAcres > 0) {
    const sqMiles = Math.round(totalAcres / 640);
    insights.push({
      icon: "measure-area",
      kind: "info",
      text: `${totalAcres.toLocaleString()} total permitted acres (~${sqMiles.toLocaleString()} sq miles)`,
    });
  }

  // Surface vs Underground ratio
  const featParams = new URLSearchParams({
    where,
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "cnt" },
    ]),
    groupByFieldsForStatistics: "FeatCLS",
    f: "json",
  });
  const featRes = await fetch(`${MINE_BOUNDARIES_URL}/query?${featParams}`, fetchOpts);
  if (!featRes.ok) throw new Error(`HTTP ${featRes.status}`);
  const featData = (await featRes.json()) as {
    features: Array<{ attributes: { FeatCLS: string; cnt: number } }>;
  };

  const sf = featData.features.find((f) => f.attributes.FeatCLS === "SF")?.attributes.cnt ?? 0;
  const ug = featData.features.find((f) => f.attributes.FeatCLS === "UG")?.attributes.cnt ?? 0;
  if (sf > 0 && ug > 0) {
    const ratio = (sf / ug).toFixed(1);
    insights.push({
      icon: "layers",
      kind: "brand",
      text: `Surface mines outnumber underground ${ratio}:1 (${sf.toLocaleString()} vs ${ug.toLocaleString()})`,
    });
  }

  return insights;
}

export function KeyInsights(): React.JSX.Element {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError(false);
    setLoading(true);

    generateInsights(definitionExpression, ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) {
          setInsights(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Insights fetch failed:", err);
        if (!ctrl.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [definitionExpression]);

  useEffect(() => load(), [load]);

  if (error) {
    return (
      <p style={{ padding: "8px", fontSize: "12px", color: "var(--calcite-color-status-danger)" }}>
        Failed to load insights.{" "}
        <span onClick={load} role="button" tabIndex={0} style={{ cursor: "pointer", textDecoration: "underline" }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") load(); }}>
          Retry
        </span>
      </p>
    );
  }

  if (loading) {
    return <p style={{ padding: "8px", fontSize: "12px", color: "var(--calcite-color-text-3)" }}>Analyzing data...</p>;
  }

  if (insights.length === 0) {
    return <p style={{ padding: "8px", fontSize: "12px", color: "var(--calcite-color-text-3)" }}>No insights for current filters.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "4px" }}>
      {insights.map((insight, i) => (
        <calcite-notice key={i} open icon={insight.icon as never} kind={insight.kind} scale="s" style={{ width: "100%" }}>
          <span slot="message" style={{ fontSize: "12px" }}>{insight.text}</span>
        </calcite-notice>
      ))}
    </div>
  );
}
