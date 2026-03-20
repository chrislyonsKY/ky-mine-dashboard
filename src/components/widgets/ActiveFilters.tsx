import "@esri/calcite-components/components/calcite-chip";

import { useDashboardStore } from "../../store/dashboard-store.js";

/** Displays active filter chips with clear buttons */
export function ActiveFilters(): React.JSX.Element | null {
  const typeFlag = useDashboardStore((s) => s.typeFlag);
  const featCLS = useDashboardStore((s) => s.featCLS);
  const mineStatuGroup = useDashboardStore((s) => s.mineStatuGroup);
  const selectedCounty = useDashboardStore((s) => s.selectedCounty);
  const setTypeFlag = useDashboardStore((s) => s.setTypeFlag);
  const setFeatCLS = useDashboardStore((s) => s.setFeatCLS);
  const setMineStatuGroup = useDashboardStore((s) => s.setMineStatuGroup);
  const resetAllFilters = useDashboardStore((s) => s.resetAllFilters);

  const typeLabels: Record<string, string> = { ACT: "Active", INACT: "Inactive", RECNF: "Historic" };
  const featLabels: Record<string, string> = { SF: "Surface", UG: "Underground" };

  const hasFilters = typeFlag || featCLS || mineStatuGroup;
  if (!hasFilters) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Active filters"
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 12px",
        background: "var(--calcite-color-foreground-2)",
        borderBottom: "1px solid var(--calcite-color-border-3)",
        fontSize: "11px",
      }}
    >
      <span style={{ color: "var(--calcite-color-text-3)", marginRight: "4px" }}>
        Filters{selectedCounty ? ` (${selectedCounty.name} County)` : ""}:
      </span>
      {typeFlag && (
        <calcite-chip
          scale="s"
          closable
          label="filter"
          oncalciteChipClose={() => setTypeFlag(null)}
        >
          {typeLabels[typeFlag] ?? typeFlag}
        </calcite-chip>
      )}
      {featCLS && (
        <calcite-chip
          scale="s"
          closable
          label="filter"
          oncalciteChipClose={() => setFeatCLS(null)}
        >
          {featLabels[featCLS] ?? featCLS}
        </calcite-chip>
      )}
      {mineStatuGroup && (
        <calcite-chip
          scale="s"
          closable
          label="filter"
          oncalciteChipClose={() => setMineStatuGroup(null)}
        >
          {mineStatuGroup}
        </calcite-chip>
      )}
      <calcite-chip
        scale="s"
        label="Clear all filters"
        appearance="outline-fill"
        style={{ cursor: "pointer", marginLeft: "4px" }}
        onClick={resetAllFilters}
      >
        Clear All
      </calcite-chip>
    </div>
  );
}
