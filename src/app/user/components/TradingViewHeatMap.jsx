"use client";

import { useEffect, useRef } from "react";

export default function TradingViewHeatMap() {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";

    script.async = true;

    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "change",
      locale: "en",
      colorTheme: "light",
      hasTopBar: false,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: "100%",
      height: "900"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      style={{
        background: "#F8F6FF",
        borderRadius: "20px",
        padding: "6px",
        overflow: "hidden",
        border: "1px solid #E7E0FF",
      }}
    >
      <div
        ref={container}
        className="tradingview-widget-container"
        style={{
          width: "100%",
          height: "900px",
          background: "#F8F6FF",
        }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{
            background: "#F8F6FF",
          }}
        />
      </div>
    </div>
  );
}