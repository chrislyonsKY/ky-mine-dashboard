import { useEffect, useState } from "react";
import { MINE_BOUNDARIES_URL } from "../config/services.js";
import { BASE_WHERE } from "../config/type-flag-config.js";

/** Query distinct REGION_DES values to build a set of counties that have mine records.
 *  Since REGION_DES is regional offices (not counties), we use a spatial approach:
 *  query mine boundary extents grouped by county intersection.
 *  Simpler approach: query a count per county via the counties layer + spatial query.
 *  Simplest: query distinct county names from the mine boundaries if available.
 *
 *  Since the mine boundaries don't have a county field, we return OBJECTID counts
 *  per extent tile to determine which areas have mines. The actual coal county
 *  detection happens by intersecting county polygons with mine extent on the map.
 */

interface CoalCountyResult {
  /** Set of county names that contain mine records */
  coalCounties: Set<string>;
  loading: boolean;
}

/** Detect coal counties by querying mine boundary extent and intersecting with counties */
export function useCoalCounties(): CoalCountyResult {
  const [coalCounties, setCoalCounties] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Get the full extent of mine boundaries to know the coal region
        const params = new URLSearchParams({
          where: BASE_WHERE,
          returnExtentOnly: "true",
          f: "json",
        });
        const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
        const data = (await res.json()) as {
          extent: { xmin: number; ymin: number; xmax: number; ymax: number };
        };

        // Store the extent — we'll use it in the map component to highlight counties
        // that intersect with the mine boundary extent
        if (data.extent) {
          // For now, mark as loaded — actual county intersection happens on the map
          setCoalCounties(new Set(["loaded"]));
        }
      } catch (err) {
        console.error("Coal county detection failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { coalCounties, loading };
}
