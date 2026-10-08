import { isVideoFile, videoEmbed } from "@/lib/site";

/** Whether a video should be laid out portrait (Shorts, TikTok, or an MP4 taller than wide). */
export function isVerticalVideo(url: string, width?: number | null, height?: number | null) {
  if (width && height) return height > width;
  return videoEmbed(url)?.vertical ?? false;
}

/**
 * Plays an uploaded MP4 or embeds a YouTube / Vimeo / TikTok link.
 * Returns null for URLs it can't play, so callers can skip them.
 */
export function VideoPlayer({
  url,
  title,
  width,
  height,
  className = "",
}: {
  url: string;
  title: string;
  width?: number | null;
  height?: number | null;
  className?: string;
}) {
  const embed = videoEmbed(url);
  const file = !embed && isVideoFile(url);
  if (!embed && !file) return null;
  const vertical = isVerticalVideo(url, width, height);

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border border-line bg-black ${
        vertical ? "mx-auto aspect-[9/16] w-full max-w-[min(420px,calc((100svh-8rem)*9/16))]" : "aspect-video w-full"
      } ${className}`}
    >
      {embed ? (
        <iframe
          src={embed.src}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <video src={url} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
      )}
    </div>
  );
}
