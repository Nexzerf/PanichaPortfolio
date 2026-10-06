export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export function isSvg(url: string | null | undefined) {
  return Boolean(url && /\.svg(\?|$)/i.test(url));
}

export function isVideoFile(url: string | null | undefined) {
  return Boolean(url && /\.(mp4|webm)(\?|$)/i.test(url));
}

/**
 * File id from a Google Drive share link:
 *   drive.google.com/file/d/<id>/view · drive.google.com/open?id=<id> · drive.google.com/uc?id=<id>
 * The file must be shared as "Anyone with the link".
 */
export function driveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "drive.google.com" && u.hostname !== "docs.google.com") return null;
    const id = u.pathname.match(/\/(?:file\/)?d\/([\w-]{10,})/)?.[1] ?? u.searchParams.get("id");
    return id && /^[\w-]{10,}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Turns a Google Drive image share link into a direct image URL; other URLs pass through unchanged. */
export function normalizeImageUrl(url: string): string {
  const id = driveFileId(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}

/** Hosts that Next.js may optimise (see images.remotePatterns in next.config.ts). */
export function canOptimizeImage(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    return (host === supabase && !isSvg(url)) || host === "lh3.googleusercontent.com";
  } catch {
    return false;
  }
}

export type VideoEmbed = { src: string; vertical: boolean };

/**
 * Turns a YouTube (incl. Shorts), Vimeo, TikTok or Google Drive link into an embeddable player URL.
 * Shorts and TikTok are flagged vertical so they render 9:16. Returns null for anything else.
 */
export function videoEmbed(url: string): VideoEmbed | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    const id = (v: string | null | undefined) => (v && /^[\w-]{6,}$/.test(v) ? v : null);
    if (host === "youtube.com") {
      const shorts = u.pathname.match(/^\/shorts\/([\w-]+)/)?.[1];
      if (id(shorts)) return { src: `https://www.youtube-nocookie.com/embed/${shorts}`, vertical: true };
      const v = id(u.searchParams.get("v")) ?? id(u.pathname.match(/^\/(?:embed|live)\/([\w-]+)/)?.[1]);
      if (v) return { src: `https://www.youtube-nocookie.com/embed/${v}`, vertical: false };
    }
    if (host === "youtu.be") {
      const v = id(u.pathname.slice(1));
      if (v) return { src: `https://www.youtube-nocookie.com/embed/${v}`, vertical: false };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const v = u.pathname.split("/").filter(Boolean).pop();
      if (v && /^\d+$/.test(v)) return { src: `https://player.vimeo.com/video/${v}`, vertical: false };
    }
    if (host === "drive.google.com") {
      const v = driveFileId(url);
      if (v) return { src: `https://drive.google.com/file/d/${v}/preview`, vertical: false };
    }
    if (host === "tiktok.com") {
      const v = u.pathname.match(/\/video\/(\d+)/)?.[1];
      if (v) return { src: `https://www.tiktok.com/embed/v2/${v}`, vertical: true };
    }
  } catch {
    return null;
  }
  return null;
}

/** Kept for callers that only need the URL. */
export function toEmbedUrl(url: string): string | null {
  return videoEmbed(url)?.src ?? null;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
