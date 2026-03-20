import { Component, type ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** React error boundary — catches render errors in child components */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "12px", fontSize: "13px", color: "var(--calcite-color-status-danger)" }}>
            <strong>Something went wrong.</strong>
            <p style={{ marginTop: "4px", opacity: 0.7 }}>{this.state.error?.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
