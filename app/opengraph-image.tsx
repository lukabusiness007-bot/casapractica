import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "casa practica — Dom, bez brige. Usluge za stan u Beogradu.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
const diatype = await readFile(join(process.cwd(), "public/fonts/diatype-og.ttf"));
export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#f8f8f1",
        color: "#282828",
        fontFamily: "Home Sans",
        padding: 65,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#444835"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
          <path d="M9 21V12h6v9" />
        </svg>
        casa practica
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 88, letterSpacing: -3 }}>
          Dom, bez brige.
        </div>
        <div style={{ fontSize: 27, color: "#77796e" }}>
          Manje obaveza. Više vremena za sebe.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <div
          style={{
            borderRadius: 50,
            background: "#444835",
            color: "#fff",
            padding: "15px 26px",
          }}
        >
          Usluge za stan u Beogradu
        </div>
        <div>Pranje tepiha · Montaža TV-a · Servis klime</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Home Sans", data: diatype, style: "normal", weight: 400 }],
    },
  );
}
