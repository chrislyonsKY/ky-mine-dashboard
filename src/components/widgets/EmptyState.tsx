import "@esri/calcite-components/components/calcite-notice";

interface EmptyStateProps {
  message: string;
}

/** Shown when a county has zero mine results */
export function EmptyState({ message }: EmptyStateProps): React.JSX.Element {
  return (
    <calcite-notice open icon="information" kind="info" scale="s" style={{ margin: "8px" }}>
      <span slot="message">{message}</span>
    </calcite-notice>
  );
}
