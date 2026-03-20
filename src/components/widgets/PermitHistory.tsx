import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-notice";
import "@esri/calcite-components/components/calcite-icon";

import { useEffect, useState } from "react";
import { MINE_BOUNDARIES_URL } from "../../config/services.js";

interface TransferRecord {
  permitNo: string;
  origPerm: string;
  perName: string;
  typeFlag: string;
  dateIss: string;
  permAct: string;
  isCurrent: boolean;
}

/** Activity code labels */
const ACT_LABELS: Record<string, string> = {
  NW: "New Permit",
  AM: "Amendment",
  RV: "Revoked",
  TR: "Transfer",
  RN: "Renewal",
  RC: "Released",
  FF: "Forfeiture",
  SP: "Suspended",
};

/** Parse PERM_ACT string into readable activity timeline */
function parsePermAct(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  // Format: "  RV      09/01/1982  AM      10/13/1980  NW      10/03/1978"
  const entries: string[] = [];
  const regex = /([A-Z]{2})\s+(\d{2}\/\d{2}\/\d{4})/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const code = match[1]!;
    const date = match[2]!;
    const label = ACT_LABELS[code] ?? code;
    entries.push(`${date} — ${label}`);
  }
  return entries;
}

interface PermitHistoryProps {
  permitNo: string;
}

/** Shows the transfer chain and activity history for a permit */
export function PermitHistory({ permitNo }: PermitHistoryProps): React.JSX.Element {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permitNo) return;

    (async () => {
      setLoading(true);
      try {
        // Step 1: Find the ORIG_PERM for this permit
        const lookupParams = new URLSearchParams({
          where: `PermitNo = '${permitNo}'`,
          outFields: "ORIG_PERM",
          returnGeometry: "false",
          f: "json",
        });
        const lookupRes = await fetch(`${MINE_BOUNDARIES_URL}/query?${lookupParams}`);
        const lookupData = (await lookupRes.json()) as {
          features: Array<{ attributes: { ORIG_PERM: string } }>;
        };

        const origPerm = lookupData.features[0]?.attributes.ORIG_PERM ?? permitNo;

        // Step 2: Query all records with this ORIG_PERM (full transfer chain)
        const chainParams = new URLSearchParams({
          where: `ORIG_PERM = '${origPerm}'`,
          outFields: "PermitNo,ORIG_PERM,PER_NAME,Type_Flag,DATE_ISS,PERM_ACT",
          returnGeometry: "false",
          orderByFields: "DATE_ISS ASC",
          f: "json",
        });
        const chainRes = await fetch(`${MINE_BOUNDARIES_URL}/query?${chainParams}`);
        const chainData = (await chainRes.json()) as {
          features: Array<{
            attributes: {
              PermitNo: string;
              ORIG_PERM: string;
              PER_NAME: string;
              Type_Flag: string;
              DATE_ISS: number | null;
              PERM_ACT: string;
            };
          }>;
        };

        const chain: TransferRecord[] = chainData.features.map((f) => ({
          permitNo: f.attributes.PermitNo,
          origPerm: f.attributes.ORIG_PERM,
          perName: f.attributes.PER_NAME ?? "Unknown",
          typeFlag: f.attributes.Type_Flag,
          dateIss: f.attributes.DATE_ISS
            ? new Date(f.attributes.DATE_ISS).toLocaleDateString()
            : "N/A",
          permAct: f.attributes.PERM_ACT ?? "",
          isCurrent: f.attributes.Type_Flag !== "TRNS",
        }));

        setRecords(chain);
      } catch (err) {
        console.error("Transfer history query failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [permitNo]);

  if (loading) {
    return <p style={{ padding: "8px", fontSize: "12px", color: "var(--calcite-color-text-3)" }}>Loading transfer history...</p>;
  }

  if (records.length <= 1) {
    return (
      <calcite-notice open icon="information" kind="info" scale="s" style={{ margin: "4px" }}>
        <span slot="message">No transfer history found for this permit.</span>
      </calcite-notice>
    );
  }

  return (
    <div style={{ padding: "4px" }}>
      <p style={{ fontSize: "11px", color: "var(--calcite-color-text-3)", margin: "0 0 6px", padding: "0 4px" }}>
        {records.length} records in transfer chain (Original: {records[0]?.origPerm})
      </p>
      <calcite-list selection-mode="none" label="Permit transfer history">
        {records.map((r, i) => {
          const activities = parsePermAct(r.permAct);
          const statusLabel = r.isCurrent ? "Current" : "Transferred";
          return (
            <calcite-list-item
              key={`${r.permitNo}-${i}`}
              label={`${r.permitNo} — ${r.perName}`}
              description={`${statusLabel} · Issued: ${r.dateIss}${activities.length > 0 ? ` · ${activities[0]}` : ""}`}
            >
              {r.isCurrent && (
                <calcite-icon icon="check-circle-f" scale="s" slot="content-end" style={{ color: "var(--calcite-color-status-success)" }} />
              )}
            </calcite-list-item>
          );
        })}
      </calcite-list>
    </div>
  );
}
