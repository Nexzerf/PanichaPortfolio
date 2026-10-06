"use client";
import Image from "next/image";
import { useState } from "react";
import { canOptimizeImage, normalizeImageUrl } from "@/lib/site";

/**
 * Responsive, lazy-loaded image (Next Image picks the right size + AVIF/WebP).
 * Without an image — or when the link fails to load (e.g. a private or oversized Google Drive file) —
 * it renders a typographic placeholder so layouts never collapse.
 */
export function Media({
  src,
  alt,
  sizes,
  preload = false,
  label,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  preload?: boolean;
  label?: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) {
    return (
      <div
        className={`absolute inset-0 grid place-items-center overflow-hidden bg-surface ${className}`}
        role="img"
        aria-label={alt}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(80% 60% at 70% 110%, var(--accent-soft), transparent 70%), linear-gradient(160deg, var(--surface-2), var(--bg-black))",
          }}
        />
        <span aria-hidden className="stars opacity-60" />
        <span
          aria-hidden
          className="relative px-6 text-center font-serif text-[clamp(2.5rem,7vw,6rem)] italic leading-none text-ink/85"
        >
          {label ?? alt}
        </span>
      </div>
    );
  }
  const url = normalizeImageUrl(src);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      unoptimized={!canOptimizeImage(url)}
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
}
