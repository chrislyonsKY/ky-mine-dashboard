// ArcGIS map components
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-locate";
import "@arcgis/map-components/components/arcgis-compass";

// Calcite components
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-notice";
import "@esri/calcite-components/components/calcite-dropdown";
import "@esri/calcite-components/components/calcite-dropdown-group";
import "@esri/calcite-components/components/calcite-dropdown-item";
import "@esri/calcite-components/components/calcite-switch";
import "@esri/calcite-components/components/calcite-tooltip";

// ArcGIS core modules
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import ImageryLayer from "@arcgis/core/layers/ImageryLayer.js";
import Extent from "@arcgis/core/geometry/Extent.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import Color from "@arcgis/core/Color.js";
import LabelClass from "@arcgis/core/layers/support/LabelClass.js";
import TextSymbol from "@arcgis/core/symbols/TextSymbol.js";
import type MapView from "@arcgis/core/views/MapView.js";

// React + app
import { useCallback, useRef, useEffect, useState } from "react";
import { KpiCards } from "./components/widgets/KpiCards.js";
import { MineStatuChart } from "./components/widgets/MineStatuChart.js";
import { KeyInsights } from "./components/widgets/KeyInsights.js";
import { SurfaceVsUnderground } from "./components/widgets/SurfaceVsUnderground.js";
import { PermitSearch } from "./components/widgets/PermitSearch.js";
import { ActiveFilters } from "./components/widgets/ActiveFilters.js";
import { useDashboardStore } from "./store/dashboard-store.js";
import { MINE_BOUNDARIES_URL, COUNTIES_URL, IMAGERY_URL } from "./config/services.js";
import { BASE_WHERE } from "./config/type-flag-config.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { SplashScreen } from "./components/SplashScreen.js";
import { AboutModal } from "./components/AboutModal.js";
import { useUrlState } from "./hooks/useUrlState.js";

/** Kentucky statewide extent (Web Mercator) */
const KY_EXTENT = new Extent({
  xmin: -10000000,
  ymin: 4430000,
  xmax: -9310000,
  ymax: 4740000,
  spatialReference: { wkid: 3857 },
});

export function App(): React.JSX.Element {
  const [darkMode, setDarkMode] = useState(true);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const mapRef = useRef<HTMLArcgisMapElement | null>(null);
  const viewRef = useRef<MapView | null>(null);
  const countiesLayerRef = useRef<FeatureLayer | null>(null);
  const minesMapLayerRef = useRef<MapImageLayer | null>(null);
  const imageryLayerRef = useRef<ImageryLayer | null>(null);
  const minesFeatureLayerRef = useRef<FeatureLayer | null>(null);
  const highlightLayerRef = useRef<GraphicsLayer | null>(null);
  const [tableLayer, setTableLayer] = useState<FeatureLayer | null>(null);

  const viewState = useDashboardStore((s) => s.viewState);
  const selectedCounty = useDashboardStore((s) => s.selectedCounty);
  const definitionExpression = useDashboardStore((s) => s.definitionExpression);
  const selectCounty = useDashboardStore((s) => s.selectCounty);
  const clearCounty = useDashboardStore((s) => s.clearCounty);
  const resetAllFilters = useDashboardStore((s) => s.resetAllFilters);

  // Sync filters to URL
  useUrlState();

  // Apply cross-filter to mines MapImageLayer sublayer + announce to screen readers
  useEffect(() => {
    if (minesMapLayerRef.current) {
      const sublayer = minesMapLayerRef.current.findSublayerById(0);
      if (sublayer) {
        sublayer.definitionExpression = definitionExpression;
      }
    }
    setLiveAnnouncement("Dashboard data updated with current filters");
  }, [definitionExpression]);

  // Theme toggle
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("calcite-mode-dark");
      root.classList.remove("calcite-mode-light");
    } else {
      root.classList.add("calcite-mode-light");
      root.classList.remove("calcite-mode-dark");
    }
  }, [darkMode]);

  const switchRef = useRef<HTMLCalciteSwitchElement | null>(null);
  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;
    const handler = () => setDarkMode((d) => !d);
    el.addEventListener("calciteSwitchChange", handler);
    return () => el.removeEventListener("calciteSwitchChange", handler);
  }, []);

  /** Detect coal counties */
  const detectCoalCounties = useCallback(async (_view: MapView, countiesLayer: FeatureLayer) => {
    try {
      await countiesLayer.load();
      const extentParams = new URLSearchParams({
        where: BASE_WHERE,
        returnExtentOnly: "true",
        f: "json",
      });
      const extentRes = await fetch(`${MINE_BOUNDARIES_URL}/query?${extentParams}`);
      const extentData = (await extentRes.json()) as {
        extent: { xmin: number; ymin: number; xmax: number; ymax: number; spatialReference: { wkid: number } };
      };
      if (!extentData.extent) return;

      const mineExtent = new Extent({
        ...extentData.extent,
        spatialReference: { wkid: extentData.extent.spatialReference.wkid },
      });

      const countyQuery = countiesLayer.createQuery();
      countyQuery.geometry = mineExtent;
      countyQuery.spatialRelationship = "intersects";
      countyQuery.outFields = ["County_Name"];
      countyQuery.returnGeometry = false;
      const result = await countiesLayer.queryFeatures(countyQuery);

      const names = result.features.map((f) => f.attributes["County_Name"] as string);
      if (names.length > 0) {
        const expr = names.map((n) => `'${n.replace(/'/g, "''")}'`).join(",");
        countiesLayer.definitionExpression = `County_Name IN (${expr})`;
      }
      console.info(`Coal counties: ${names.length} / 120`);
    } catch (err) {
      console.error("Coal county detection failed:", err);
    }
  }, []);

  /** Identify a mine boundary at click point and show popup */
  const handleMineIdentify = useCallback(
    async (view: MapView, screenPoint: { x: number; y: number }) => {
      try {
        const mapPoint = view.toMap(screenPoint);
        const params = new URLSearchParams({
          where: definitionExpression,
          geometry: JSON.stringify({ x: mapPoint.x, y: mapPoint.y, spatialReference: { wkid: 3857 } }),
          geometryType: "esriGeometryPoint",
          spatialRel: "esriSpatialRelIntersects",
          outFields: "*",
          returnGeometry: "true",
          f: "json",
        });
        const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
        const data = (await res.json()) as {
          features: Array<{ attributes: Record<string, unknown>; geometry: unknown }>;
        };

        if (data.features.length === 0) return;

        const attrs = data.features[0]!.attributes;
        const mineType = attrs["FeatCLS"] === "SF" ? "Surface" : "Underground";
        const dateIss = attrs["DATE_ISS"]
          ? new Date(attrs["DATE_ISS"] as number).toLocaleDateString()
          : "N/A";

        view.popup?.open({
          title: `Permit: ${attrs["PermitNo"]}`,
          content: `
            <table style="font-size:13px;line-height:1.8;border-collapse:collapse">
              <tr><td style="font-weight:600;padding-right:12px">Permittee</td><td>${attrs["PER_NAME"] ?? "N/A"}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Mine Type</td><td>${mineType}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Status</td><td>${attrs["Type_Flag"] ?? "N/A"}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Detailed Status</td><td>${attrs["MINE_STATU"] ?? "N/A"}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Date Issued</td><td>${dateIss}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Acres</td><td>${attrs["Calc_Acres"] ? Number(attrs["Calc_Acres"]).toFixed(1) : "N/A"}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">Permit Type</td><td>${attrs["PER_TYPE"] ?? "N/A"}</td></tr>
              <tr><td style="font-weight:600;padding-right:12px">DMP Region</td><td>${attrs["REGION_DES"] ?? "N/A"}</td></tr>
            </table>`,
          location: mapPoint,
        });
      } catch (err) {
        console.error("Mine identify failed:", err);
      }
    },
    [definitionExpression],
  );

  /** County click handler */
  const handleCountyClick = useCallback(
    async (view: MapView, screenPoint: { x: number; y: number }) => {
      const countiesLayer = countiesLayerRef.current;
      if (!countiesLayer) return;

      const currentState = useDashboardStore.getState().viewState;
      if (currentState === "county" || currentState === "mine-detail") {
        // In county view — identify mine instead
        handleMineIdentify(view, screenPoint);
        return;
      }

      try {
        const query = countiesLayer.createQuery();
        query.geometry = view.toMap(screenPoint);
        query.spatialRelationship = "intersects";
        query.outFields = ["*"];
        query.returnGeometry = true;
        const result = await countiesLayer.queryFeatures(query);

        if (result.features.length === 0) return;

        const feature = result.features[0]!;
        const countyName = feature.attributes["County_Name"] ?? "Unknown";
        const geo = feature.geometry;
        if (!geo) return;

        selectCounty({ name: countyName, geometry: geo, attributes: feature.attributes });

        if (geo.extent) {
          await view.goTo(geo.extent.expand(1.2), { duration: 800 });
        }

        // Show mine boundaries via MapImageLayer + update definition expression
        if (minesMapLayerRef.current) {
          const sublayer = minesMapLayerRef.current.findSublayerById(0);
          if (sublayer) {
            sublayer.definitionExpression = definitionExpression;
          }
          minesMapLayerRef.current.visible = true;
        }

        setShowTable(true);
        if (imageryLayerRef.current) imageryLayerRef.current.visible = true;
      } catch (err) {
        console.error("County click failed:", err);
      }
    },
    [selectCounty, definitionExpression],
  );

  /** Map ready */
  const handleViewReady = useCallback(
    (event: CustomEvent) => {
      const el = event.target as HTMLArcgisMapElement;
      mapRef.current = el;
      const view = el.view as MapView;
      viewRef.current = view;

      void view.goTo(KY_EXTENT, { duration: 1500 });

      const map = el.map!;

      // Counties layer
      const countiesLayer = new FeatureLayer({
        url: COUNTIES_URL,
        title: "Kentucky Counties",
        outFields: ["*"],
        renderer: new SimpleRenderer({
          symbol: new SimpleFillSymbol({
            color: new Color([200, 200, 200, 0.35]),
            outline: new SimpleLineSymbol({
              color: new Color([0, 0, 0, 1]),
              width: 1.2,
              style: "dash",
            }),
          }),
        }),
        opacity: 0.5,
        labelingInfo: [
          new LabelClass({
            labelExpression: "[County_Name]",
            symbol: new TextSymbol({
              color: new Color([50, 50, 50, 0.9]),
              haloColor: new Color([255, 255, 255, 0.8]),
              haloSize: 1.5,
              font: { size: 9, weight: "bold" },
            }),
            minScale: 2000000,
          }),
        ],
      });
      countiesLayerRef.current = countiesLayer;

      // Mine boundaries MapImageLayer (statewide, hidden)
      const minesMapLayer = new MapImageLayer({
        url: MINE_BOUNDARIES_URL.replace("/0", ""),
        title: "Mine Boundaries",
        visible: false,
        sublayers: [{ id: 0, definitionExpression: definitionExpression }],
      });
      minesMapLayerRef.current = minesMapLayer;

      // KYFromAbove imagery
      const imageryLayer = new ImageryLayer({
        url: IMAGERY_URL,
        title: "KYFromAbove Orthoimagery",
        visible: false,
      });
      imageryLayerRef.current = imageryLayer;

      // Highlight layer for search results and selections
      const highlightLayer = new GraphicsLayer({ title: "Highlights" });
      highlightLayerRef.current = highlightLayer;

      map.addMany([imageryLayer, countiesLayer, minesMapLayer, highlightLayer]);

      countiesLayer.when(() => detectCoalCounties(view, countiesLayer));

      view.on("click", (evt: { x: number; y: number }) => {
        handleCountyClick(view, { x: evt.x, y: evt.y });
      });
    },
    [definitionExpression, handleCountyClick, detectCoalCounties],
  );

  /** Back to state view */
  const handleBackToState = useCallback(() => {
    clearCounty();
    resetAllFilters();
    setTableLayer(null);
    setShowTable(false);

    if (viewRef.current && minesFeatureLayerRef.current) {
      viewRef.current.map!.remove(minesFeatureLayerRef.current);
      minesFeatureLayerRef.current = null;
    }
    if (minesMapLayerRef.current) minesMapLayerRef.current.visible = false;
    if (imageryLayerRef.current) imageryLayerRef.current.visible = false;
    if (highlightLayerRef.current) highlightLayerRef.current.removeAll();
    if (viewRef.current) {
      viewRef.current.popup?.close();
      void viewRef.current.goTo(KY_EXTENT, { duration: 800 });
    }
  }, [clearCounty, resetAllFilters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "calcite-input-text") return;

      switch (e.key) {
        case "Escape":
          if (useDashboardStore.getState().viewState !== "statewide") {
            handleBackToState();
          }
          break;
        case "?":
          setAboutOpen((o) => !o);
          break;
        case "d":
        case "D":
          setDarkMode((d) => !d);
          break;
        case "/":
          e.preventDefault();
          document.querySelector<HTMLElement>("calcite-input-text")?.focus();
          break;
        case "f":
        case "F":
          if (useDashboardStore.getState().viewState !== "statewide") {
            setShowTable((t) => !t);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBackToState]);

  /** Build popup HTML for a mine feature */
  const buildPopupContent = (attrs: Record<string, unknown>): string => {
    const mineType = attrs["FeatCLS"] === "SF" ? "Surface" : "Underground";
    const dateIss = attrs["DATE_ISS"]
      ? new Date(attrs["DATE_ISS"] as number).toLocaleDateString()
      : "N/A";
    return `
      <table style="font-size:13px;line-height:1.8;border-collapse:collapse">
        <tr><td style="font-weight:600;padding-right:12px">Permittee</td><td>${attrs["PER_NAME"] ?? "N/A"}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Mine Type</td><td>${mineType}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Status</td><td>${attrs["Type_Flag"] ?? "N/A"}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Detailed Status</td><td>${attrs["MINE_STATU"] ?? "N/A"}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Date Issued</td><td>${dateIss}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Acres</td><td>${attrs["Calc_Acres"] ? Number(attrs["Calc_Acres"]).toFixed(1) : "N/A"}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">Permit Type</td><td>${attrs["PER_TYPE"] ?? "N/A"}</td></tr>
        <tr><td style="font-weight:600;padding-right:12px">DMP Region</td><td>${attrs["REGION_DES"] ?? "N/A"}</td></tr>
      </table>`;
  };

  /** Permit search selection — draw boundary, zoom, show popup */
  const handlePermitSelect = useCallback(
    async (result: { permitNo: string; geometry: unknown; attributes: Record<string, unknown> }) => {
      const view = viewRef.current;
      if (!view) return;

      // Show mine boundaries layer
      if (minesMapLayerRef.current) {
        const sublayer = minesMapLayerRef.current.findSublayerById(0);
        if (sublayer) sublayer.definitionExpression = definitionExpression;
        minesMapLayerRef.current.visible = true;
      }
      if (imageryLayerRef.current) imageryLayerRef.current.visible = true;

      // Query the full feature with geometry
      try {
        const params = new URLSearchParams({
          where: `PermitNo = '${result.permitNo}'`,
          outFields: "*",
          returnGeometry: "true",
          f: "json",
        });
        const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
        const data = (await res.json()) as {
          features: Array<{ attributes: Record<string, unknown>; geometry: { rings: number[][][] } }>;
        };

        if (data.features.length > 0) {
          const feat = data.features[0]!;
          const attrs = feat.attributes;

          // Draw the boundary as a highlighted graphic
          const polygon = new Polygon({
            rings: feat.geometry.rings,
            spatialReference: { wkid: 3857 },
          });

          if (highlightLayerRef.current) {
            highlightLayerRef.current.removeAll();
            const graphic = new Graphic({
              geometry: polygon,
              symbol: new SimpleFillSymbol({
                color: new Color([255, 255, 0, 0.3]),
                outline: new SimpleLineSymbol({
                  color: new Color([255, 200, 0, 1]),
                  width: 3,
                }),
              }),
            });
            highlightLayerRef.current.add(graphic);
          }

          // Zoom to the boundary
          if (polygon.extent) {
            await view.goTo(polygon.extent.expand(2), { duration: 800 });

            // Open popup
            view.popup?.open({
              title: `Permit: ${attrs["PermitNo"]}`,
              content: buildPopupContent(attrs),
              location: polygon.extent.center,
            });
          }
        }
      } catch (err) {
        console.error("Permit search failed:", err);
      }

      setLiveAnnouncement(`Showing permit ${result.permitNo}`);
    },
    [definitionExpression],
  );

  return (
    <calcite-shell content-behind>
      {!splashDismissed && <SplashScreen onEnter={() => setSplashDismissed(true)} />}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <a className="skip-link" href="#main-map">Skip to map</a>

      {/* Screen reader live announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveAnnouncement}</div>

      {/* ---- Header ---- */}
      <calcite-navigation slot="header" role="banner">
        <div slot="logo" className="header-logo-group">
          <img src="/eec-logo.svg" alt="Energy and Environment Cabinet logo" />
          <div className="header-title">
            <h1>Kentucky Mine Permits Dashboard</h1>
            <span aria-live="polite" aria-atomic="true">
              {selectedCounty
                ? `${selectedCounty.name} County`
                : "Kentucky Permitted Coal Mine Boundaries"}
            </span>
          </div>
        </div>
        <div slot="content-end" className="header-actions">
          <label htmlFor="dark-mode-switch" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", color: "var(--calcite-color-text-2)" }}>
              {darkMode ? "Dark" : "Light"}
            </span>
            <calcite-switch
              id="dark-mode-switch"
              ref={switchRef}
              checked={darkMode || undefined}
              scale="s"
              aria-label="Toggle dark and light mode"
            />
          </label>
          <PermitSearch onSelect={handlePermitSelect} />
          <calcite-button
            appearance="transparent"
            icon-start="information"
            scale="s"
            onClick={() => setAboutOpen(true)}
            id="about-btn"
            aria-label="Open About and Resources"
          />
          <calcite-tooltip reference-element="about-btn">About &amp; Resources</calcite-tooltip>
          {viewState !== "statewide" && (
            <calcite-button appearance="outline-fill" icon-start="arrow-left" scale="s" onClick={handleBackToState}>
              State View
            </calcite-button>
          )}
        </div>
      </calcite-navigation>

      {/* ---- KPI Indicator Strip ---- */}
      <div slot="header" role="region" aria-label="Mine count summary">
        <ErrorBoundary><KpiCards /></ErrorBoundary>
        <ActiveFilters />
      </div>

      {/* ---- Map ---- */}
      <arcgis-map
        id="main-map"
        tabIndex={-1}
        aria-label="Interactive map of Kentucky mine boundaries. Click a county to explore permits."
        onarcgisViewReadyChange={handleViewReady}
        item-id="4fa1adcf59b9487a8973e793b5c304e4"
      >
        <arcgis-zoom slot="top-left" />
        <arcgis-home slot="top-left" />
        <arcgis-compass slot="top-left" />
        <arcgis-locate slot="top-left" />
        <arcgis-search slot="top-right" />
        <arcgis-expand slot="top-right" expanded-tooltip="Basemaps" collapsed-tooltip="Basemaps">
          <arcgis-basemap-gallery />
        </arcgis-expand>
        <arcgis-expand slot="bottom-left" expanded-tooltip="Legend" collapsed-tooltip="Legend">
          <arcgis-legend />
        </arcgis-expand>
      </arcgis-map>

      {/* ---- Right Sidebar ---- */}
      <calcite-shell-panel slot="panel-end" position="end" width-scale="m" role="region" aria-label="Analytics panel">
        <calcite-panel heading="Analytics">
          <calcite-block heading="Key Insights" expanded>
            <ErrorBoundary><KeyInsights /></ErrorBoundary>
          </calcite-block>
          <calcite-block heading="Status Breakdown" expanded>
            <ErrorBoundary><MineStatuChart /></ErrorBoundary>
          </calcite-block>
          <calcite-block heading="Surface vs Underground" expanded>
            <ErrorBoundary><SurfaceVsUnderground /></ErrorBoundary>
          </calcite-block>
        </calcite-panel>
      </calcite-shell-panel>

      {/* ---- Feature Table (county view) ---- */}
      {showTable && tableLayer && (
        <calcite-shell-panel slot="panel-bottom" position="end" height-scale="s">
          <calcite-panel heading={`${selectedCounty?.name ?? ""} County — Permits`} closable oncalcitePanelClose={() => setShowTable(false)}>
            <calcite-button slot="header-actions-end" appearance="transparent" icon-start="x" scale="s" onClick={() => setShowTable(false)} aria-label="Close permits table" />
          </calcite-panel>
        </calcite-shell-panel>
      )}

      {/* ---- Attribution ---- */}
      <div slot="footer" className="attribution-bar" role="contentinfo">
        <span>Data: Energy &amp; Environment Cabinet — Division of Mine Permits</span>
        <span>Permitted boundaries updated monthly</span>
        <span>Imagery: KYFromAbove / DGI</span>
      </div>
    </calcite-shell>
  );
}
