import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboard-store.js";

/** Sync dashboard filter state to/from URL hash parameters */
export function useUrlState() {
  const typeFlag = useDashboardStore((s) => s.typeFlag);
  const featCLS = useDashboardStore((s) => s.featCLS);
  const mineStatuGroup = useDashboardStore((s) => s.mineStatuGroup);
  const selectedCounty = useDashboardStore((s) => s.selectedCounty);
  const setTypeFlag = useDashboardStore((s) => s.setTypeFlag);
  const setFeatCLS = useDashboardStore((s) => s.setFeatCLS);
  const setMineStatuGroup = useDashboardStore((s) => s.setMineStatuGroup);

  // Write state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFlag) params.set("type", typeFlag);
    if (featCLS) params.set("feat", featCLS);
    if (mineStatuGroup) params.set("status", mineStatuGroup);
    if (selectedCounty) params.set("county", selectedCounty.name);
    const hash = params.toString();
    window.history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname);
  }, [typeFlag, featCLS, mineStatuGroup, selectedCounty]);

  // Read state from URL on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const feat = params.get("feat");
    const status = params.get("status");
    if (type) setTypeFlag(type);
    if (feat) setFeatCLS(feat);
    if (status) setMineStatuGroup(status as Parameters<typeof setMineStatuGroup>[0]);
  }, [setTypeFlag, setFeatCLS, setMineStatuGroup]);
}
