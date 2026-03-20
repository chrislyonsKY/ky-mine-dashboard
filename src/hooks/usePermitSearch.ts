import { useState, useCallback, useRef } from "react";
import { MINE_BOUNDARIES_URL } from "../config/services.js";
import { BASE_WHERE } from "../config/type-flag-config.js";

export interface PermitResult {
  permitNo: string;
  perName: string;
  featCLS: string;
  geometry: unknown;
  attributes: Record<string, unknown>;
}

/** Autocomplete permit search with 300ms debounce */
export function usePermitSearch() {
  const [results, setResults] = useState<PermitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback((input: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!input || input.length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          where: `${BASE_WHERE} AND PermitNo LIKE '%${input}%'`,
          outFields: "PermitNo,PER_NAME,FeatCLS",
          returnGeometry: "true",
          resultRecordCount: "10",
          f: "json",
        });

        const res = await fetch(`${MINE_BOUNDARIES_URL}/query?${params}`);
        const data = (await res.json()) as {
          features: Array<{
            attributes: Record<string, string>;
            geometry: unknown;
          }>;
        };

        setResults(
          data.features.map((f) => ({
            permitNo: f.attributes["PermitNo"] ?? "",
            perName: f.attributes["PER_NAME"] ?? "",
            featCLS: f.attributes["FeatCLS"] ?? "",
            geometry: f.geometry,
            attributes: f.attributes,
          })),
        );
      } catch (err) {
        console.error("Permit search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { results, loading, search, clear };
}
