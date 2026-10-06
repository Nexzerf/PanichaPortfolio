"use client";
import { getBrowserClient } from "./supabase/browser";
import { MEDIA_BUCKET } from "./supabase/env";

export const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/svg+xml",
  video: "video/mp4",
  pdf: "application/pdf",
  any: "image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,application/pdf",
} as const;

const LIMITS: Record<string, number> = {
  "image/jpeg": 15 * 1024 * 1024,
  "image/png": 15 * 1024 * 1024,
  "image/webp": 15 * 1024 * 1024,
  "image/svg+xml": 2 * 1024 * 1024,
  "video/mp4": 50 * 1024 * 1024,
  "application/pdf": 20 * 1024 * 1024,
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
};

export type Uploaded = { url: string; width: number | null; height: number | null };

/**
 * Validates type and size, downsizes raster images to at most 2400px and re-encodes
 * them as WebP before upload, then stores the file in the public media bucket.
 * The bucket enforces the same type/size rules server-side and RLS limits writes to owners.
 */
export async function uploadMedia(file: File, folder: string): Promise<Uploaded> {
  const limit = LIMITS[file.type];
  if (!limit) throw new Error(`Unsupported file type: ${file.type || file.name}`);
  if (file.size > limit) throw new Error(`File is too large (max ${Math.round(limit / 1024 / 1024)} MB)`);

  let body: Blob = file;
  let type = file.type;
  let width: number | null = null;
  let height: number | null = null;

  if (file.type === "video/mp4") {
    const size = await videoSize(file);
    width = size?.width ?? null;
    height = size?.height ?? null;
  }

  if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    const optimized = await optimizeImage(file);
    body = optimized.blob;
    type = optimized.type;
    width = optimized.width;
    height = optimized.height;
  }

  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").slice(0, 60) || "misc";
  const path = `${safeFolder}/${crypto.randomUUID()}.${EXT[type]}`;
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, width, height };
}

async function optimizeImage(file: File) {
  const MAX = 2400;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  // Fall back to the original if the browser cannot encode WebP or it got bigger.
  if (!blob || blob.type !== "image/webp" || (blob.size > file.size && scale === 1)) {
    return { blob: file as Blob, type: file.type, width, height };
  }
  return { blob, type: "image/webp", width, height };
}

/** Reads an MP4's pixel size from its metadata so vertical clips can be shown 9:16. */
function videoSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(video.videoWidth ? { width: video.videoWidth, height: video.videoHeight } : null);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}
