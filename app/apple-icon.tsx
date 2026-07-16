import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a5c44",
          color: "#f4faf6",
          fontSize: 96,
          fontWeight: 700,
          borderRadius: 36,
        }}
      >
        {APP_NAME.slice(0, 1)}
      </div>
    ),
    { ...size }
  );
}
