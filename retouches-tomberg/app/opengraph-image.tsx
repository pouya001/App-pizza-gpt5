import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Retouches Tomberg — Atelier de couture à Woluwe-Saint-Lambert";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1B2A41",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Decorative accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#C44536",
          }}
        />

        {/* Scissors icon area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            background: "#C44536",
            borderRadius: 20,
            marginBottom: 32,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          Retouches Tomberg
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Atelier de couture & retouches — Woluwe-Saint-Lambert
        </div>

        {/* Services chips */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["Ourlets", "Ajustements", "Cuir & Daim", "Rideaux"].map((chip) => (
            <div
              key={chip}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.9)",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 18,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {chip}
            </div>
          ))}
        </div>

        {/* Phone */}
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#C44536",
            fontWeight: 600,
          }}
        >
          📞 02 772 63 40 · Tomberg 93, 1200 Woluwe-Saint-Lambert
        </div>
      </div>
    ),
    { ...size }
  );
}
