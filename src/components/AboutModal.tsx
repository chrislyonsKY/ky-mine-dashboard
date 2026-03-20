import "@esri/calcite-components/components/calcite-dialog";
import "@esri/calcite-components/components/calcite-button";

import { RESOURCE_LINKS } from "../config/services.js";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps): React.JSX.Element {
  return (
    <calcite-dialog
      open={open || undefined}
      oncalciteDialogClose={onClose}
      heading="About Kentucky Mine Permits Dashboard"
      width-scale="s"
    >
      <div style={{ padding: "12px 16px", fontSize: "13px", lineHeight: 1.6 }}>
        <p>
          This dashboard displays Kentucky's permitted coal mine boundaries — active,
          inactive, and historic (pre-SMCRA). Data is sourced from the Surface Mining
          Information System (SMIS) maintained by the Division of Mine Permits.
        </p>
        <p style={{ marginTop: "12px" }}>
          <strong>Data updates:</strong> Monthly (nightly refresh 1:00–2:30 AM)
        </p>
        <p style={{ marginTop: "8px" }}>
          <strong>Total records:</strong> ~22,500 mine boundaries (excluding transfers)
        </p>
        <p style={{ marginTop: "12px" }}>
          <strong>Resources:</strong>
        </p>
        <ul style={{ paddingLeft: "20px", margin: "4px 0" }}>
          <li><a href={RESOURCE_LINKS.dmpHome} target="_blank" rel="noopener noreferrer">Division of Mine Permits</a></li>
          <li><a href={RESOURCE_LINKS.smisWeb} target="_blank" rel="noopener noreferrer">SMIS Web Portal</a></li>
          <li><a href={RESOURCE_LINKS.docTree} target="_blank" rel="noopener noreferrer">DocTree</a></li>
        </ul>
        <p style={{ marginTop: "12px" }}>
          <strong>Contact the Developer:</strong>
        </p>
        <p style={{ margin: "4px 0" }}>
          <a href="mailto:chris.lyons@ky.gov">chris.lyons@ky.gov</a><br />
          EEC Division of Information Services — GIS Branch
        </p>
        <p style={{ marginTop: "12px" }}>
          <strong>Glossary:</strong>
        </p>
        <table style={{ fontSize: "12px", margin: "4px 0", borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>SMIS</td><td>Surface Mining Information System</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>DMP</td><td>Division of Mine Permits</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>EEC</td><td>Energy and Environment Cabinet</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>SMCRA</td><td>Surface Mining Control and Reclamation Act (1977)</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>SF</td><td>Surface Mine</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>UG</td><td>Underground Mine (includes Auger)</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>ACT</td><td>Active permit status</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>INACT</td><td>Inactive permit status</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>RECNF</td><td>Record Not Found — Historic (pre-SMCRA) permits</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0", fontWeight: 600 }}>TRNS</td><td>Transferred — ownership change (excluded from counts)</td></tr>
          </tbody>
        </table>

        <p style={{ marginTop: "16px" }}>
          <strong>Keyboard Shortcuts:</strong>
        </p>
        <table style={{ fontSize: "12px", margin: "4px 0", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ padding: "2px 12px 2px 0" }}><kbd style={{ background: "var(--calcite-color-foreground-3)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>/</kbd></td><td>Focus permit search</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0" }}><kbd style={{ background: "var(--calcite-color-foreground-3)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>D</kbd></td><td>Toggle dark / light mode</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0" }}><kbd style={{ background: "var(--calcite-color-foreground-3)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>?</kbd></td><td>Open this dialog</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0" }}><kbd style={{ background: "var(--calcite-color-foreground-3)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>F</kbd></td><td>Toggle feature table (county view)</td></tr>
            <tr><td style={{ padding: "2px 12px 2px 0" }}><kbd style={{ background: "var(--calcite-color-foreground-3)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>Esc</kbd></td><td>Back to state view</td></tr>
          </tbody>
        </table>
        <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--calcite-color-text-3)" }}>
          Energy and Environment Cabinet — Division of Mine Permits<br />
          v1.0.0 · GPL-3.0
        </p>
      </div>
      <calcite-button slot="footer-end" onClick={onClose}>
        Close
      </calcite-button>
    </calcite-dialog>
  );
}
