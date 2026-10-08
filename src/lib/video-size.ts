import "server-only";
import { driveFileId, videoEmbed } from "./site";

export type Size = { width: number; height: number };

/**
 * Best-effort size of a video link, used to pick a portrait (9:16) or landscape (16:9) player.
 * - Google Drive: the size of Drive's own thumbnail, which keeps the clip's aspect ratio.
 * - YouTube Shorts / TikTok: 9:16. Other YouTube / Vimeo links: 16:9.
 * Returns null when it can't tell (the editor lets the owner flip it by hand).
 */
export async function detectVideoSize(url: string | null | undefined): Promise<Size | null> {
  if (!url) return null;
  const drive = driveFileId(url);
  if (drive) return driveThumbnailSize(drive);
  const embed = videoEmbed(url);
  if (embed) return embed.vertical ? { width: 9, height: 16 } : { width: 16, height: 9 };
  return null;
}

async function driveThumbnailSize(id: string): Promise<Size | null> {
  try {
    const res = await fetch(`https://drive.google.com/thumbnail?id=${id}&sz=w400`, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return null;
    return imageSize(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

/** Reads width/height from JPEG (SOF marker) or PNG (IHDR) bytes. */
function imageSize(b: Uint8Array): Size | null {
  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const v = new DataView(b.buffer, b.byteOffset);
    return { width: v.getUint32(16), height: v.getUint32(20) };
  }
  // JPEG
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    const len = (b[i + 2] << 8) | b[i + 3];
    // SOF0–SOF15, excluding DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (b[i + 5] << 8) | b[i + 6];
      const width = (b[i + 7] << 8) | b[i + 8];
      return width && height ? { width, height } : null;
    }
    i += 2 + len;
  }
  return null;
}
