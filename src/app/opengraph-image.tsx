import { ImageResponse } from "next/og";
import { getProfile, getSiteSettings } from "@/lib/data";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

/** Fallback share image (used when Settings has no OG image): name on the blue→black gradient. */
export default async function OpengraphImage() {
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);
  const name = profile?.full_name_en || settings.site_name;
  const title = profile?.job_title_en || "";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          color: "#eef1fb",
          background: `radial-gradient(90% 70% at 50% -10%, ${settings.accent_color}55, transparent 60%), linear-gradient(180deg, #0c1a4f 0%, #050816 60%, #020308 100%)`,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#7880a0" }}>
          {settings.site_name}
        </div>
        <div style={{ fontSize: 96, fontWeight: 300, lineHeight: 1, marginTop: 24 }}>{name}</div>
        {title && <div style={{ fontSize: 36, color: "#b4bbd6", marginTop: 24 }}>{title}</div>}
        <div style={{ width: 120, height: 3, background: settings.accent_color, marginTop: 48 }} />
      </div>
    ),
    size,
  );
}
