import "@esri/calcite-components/components/calcite-button";

import { useState } from "react";

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      onEnter();
      // Move focus to main map after splash dismissal
      setTimeout(() => {
        document.querySelector<HTMLElement>("#main-map")?.focus();
      }, 100);
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--calcite-color-foreground-1)",
        transition: "opacity 0.5s ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <img
        src="/eec-logo.svg"
        alt="Energy and Environment Cabinet"
        style={{ height: "80px", marginBottom: "24px" }}
      />

      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--calcite-color-text-1)",
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        Kentucky Mine Permits Dashboard
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "var(--calcite-color-text-3)",
          maxWidth: "520px",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "0 0 8px",
          padding: "0 20px",
        }}
      >
        Explore Kentucky's permitted coal mine boundaries — active, inactive,
        and historic. Analyze permit data across counties with interactive
        maps, charts, and cross-filtered analytics.
      </p>

      <p
        style={{
          fontSize: "11px",
          color: "var(--calcite-color-text-3)",
          margin: "0 0 24px",
        }}
      >
        Energy and Environment Cabinet — Division of Mine Permits
      </p>

      <calcite-button
        appearance="solid"
        scale="l"
        icon-end="arrow-right"
        onClick={handleEnter}
      >
        Explore Dashboard
      </calcite-button>

      <p style={{ marginTop: "24px", fontSize: "10px", color: "var(--calcite-color-text-3)" }}>
        v1.0.0 &middot; GPL-3.0
      </p>
    </div>
  );
}
