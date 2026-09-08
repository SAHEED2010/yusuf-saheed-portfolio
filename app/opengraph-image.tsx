import { ImageResponse } from "next/og";

export const alt = "Yusuf Saheed — Engineering, Science & AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1315",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#46b8b0",
              color: "#0f1315",
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            Y
          </div>
          <div style={{ color: "#46b8b0", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            ENGINEERING, SCIENCE &amp; AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#f3f6f4", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Yusuf Saheed</div>
          <div style={{ color: "#bdc6c3", fontSize: 34, marginTop: 20, lineHeight: 1.3 }}>
            Software that works where the infrastructure doesn&apos;t.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: "#8f9b98", fontSize: 24 }}>Cofounder &amp; CTO, Codedevs · Lagos, Nigeria</div>
          <div style={{ color: "#46b8b0", fontSize: 24, fontWeight: 700 }}>github.com/SAHEED2010</div>
        </div>
      </div>
    ),
    size,
  );
}
