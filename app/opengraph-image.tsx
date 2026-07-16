import { ImageResponse } from "next/og";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #0f3d2e 0%, #1a5c44 42%, #0d2f24 100%)",
          color: "#f4faf6",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Міський довідник
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {APP_NAME}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              maxWidth: 820,
              color: "rgba(244, 250, 246, 0.88)",
            }}
          >
            {APP_TAGLINE}: кафе, аптеки, школи, памʼятки та інше
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            opacity: 0.75,
          }}
        >
          Дубно · Рівненська область
        </div>
      </div>
    ),
    { ...size }
  );
}
