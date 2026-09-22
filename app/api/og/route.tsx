import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawTitle = searchParams.get("title");
    const title = rawTitle ? rawTitle.trim().slice(0, 90) : "Professional Portfolio";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#080708",
            backgroundImage: "radial-gradient(circle at 85% 15%, rgba(204, 41, 54, 0.25), transparent 45%)",
            padding: "60px 80px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header Brand Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#CC2936",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#EBF5EE",
              }}
            >
              PROVIA
            </span>
          </div>

          {/* Main Title Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#CC2936",
              }}
            >
              Professional Portfolio
            </div>
            <div
              style={{
                fontSize: "58px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: "1.1",
                color: "#FFFFFF",
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Metadata */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(235, 245, 238, 0.15)",
              paddingTop: "24px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#A0A0A0",
                fontWeight: 500,
              }}
            >
              provia-developer.vercel.app
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#A0A0A0",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Portfolio Generation Platform
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
