import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-button";

import { useDashboardStore } from "../../store/dashboard-store.js";

export function HeaderBar(): React.JSX.Element {
  const viewState = useDashboardStore((s) => s.viewState);
  const selectedCounty = useDashboardStore((s) => s.selectedCounty);
  const clearCounty = useDashboardStore((s) => s.clearCounty);

  return (
    <>
      <calcite-navigation-logo
        heading="KY Mine Dashboard"
        description={
          selectedCounty
            ? `${selectedCounty.name} County`
            : "Kentucky Permitted Coal Mine Boundaries"
        }
        heading-level="1"
        slot="logo"
      />
      {viewState !== "statewide" && (
        <calcite-button
          slot="content-end"
          appearance="outline-fill"
          icon-start="arrow-left"
          scale="s"
          onClick={clearCounty}
        >
          Back to State View
        </calcite-button>
      )}
    </>
  );
}
