import "@esri/calcite-components/components/calcite-input-text";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";

import { useCallback, useState, useRef, useEffect } from "react";
import { usePermitSearch, type PermitResult } from "../../hooks/usePermitSearch.js";

interface PermitSearchProps {
  onSelect: (result: { permitNo: string; geometry: unknown; attributes: Record<string, unknown> }) => void;
}

export function PermitSearch({ onSelect }: PermitSearchProps): React.JSX.Element {
  const { results, search, clear } = usePermitSearch();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLCalciteInputTextElement | null>(null);
  const resultsRef = useRef<PermitResult[]>([]);
  resultsRef.current = results;

  const handleSelect = useCallback(
    (r: PermitResult) => {
      onSelect({ permitNo: r.permitNo, geometry: r.geometry, attributes: r.attributes });
      setOpen(false);
      clear();
      // Clear the input text
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onSelect, clear],
  );

  // Wire custom element events via ref
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      search(val);
      setOpen(val.length >= 2);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Enter selects first result
      if (e.key === "Enter" && resultsRef.current.length > 0) {
        e.preventDefault();
        handleSelect(resultsRef.current[0]!);
      }
      // Escape closes dropdown
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onChange = () => {
      setTimeout(() => setOpen(false), 300);
    };

    el.addEventListener("calciteInputTextInput", onInput);
    el.addEventListener("calciteInputTextChange", onChange);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("calciteInputTextInput", onInput);
      el.removeEventListener("calciteInputTextChange", onChange);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [search, handleSelect]);

  return (
    <div className="search-wrapper">
      <calcite-input-text
        ref={inputRef}
        placeholder="Search permit number..."
        icon="search"
        clearable
        scale="s"
        label="Search permits by permit number"
      />
      {open && results.length > 0 && (
        <div className="search-dropdown" role="listbox" aria-label="Permit search results" aria-live="polite">
          <calcite-list selection-mode="none" label="Search results">
            {results.map((r) => (
              <calcite-list-item
                key={r.permitNo}
                label={r.permitNo}
                description={`${r.perName} — ${r.featCLS === "SF" ? "Surface" : "Underground"}`}
                oncalciteListItemSelect={() => handleSelect(r)}
              />
            ))}
          </calcite-list>
        </div>
      )}
    </div>
  );
}
