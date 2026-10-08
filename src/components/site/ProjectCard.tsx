"use client";
import Link from "next/link";
import { Media } from "./Media";
import { pick, pickLang } from "@/lib/i18n/pick";
import { projectCover } from "@/lib/site";
import type { Lang, ProjectWithRelations } from "@/lib/types";

export const isVerticalProject = (p: ProjectWithRelations) =>
  Boolean(p.video_width && p.video_height && p.video_height > p.video_width);

export const isLandscapeVideo = (p: ProjectWithRelations) => Boolean(p.video_url) && !isVerticalProject(p);

/**
 * Cinematic project card: the cover fills the card, title and meta sit on a gradient,
 * and hover adds a slow zoom, an accent glow and a play button for video work.
 * Its shape follows the work — portrait for vertical clips, wide for landscape video.
 */
export function ProjectCard({
  project: p,
  lang,
  labels,
  onPlay,
  index = 0,
}: {
  project: ProjectWithRelations;
  lang: Lang;
  labels: { view: string; watch: string };
  /** When set (video projects), a plain click opens the in-page player instead of navigating. */
  onPlay?: () => void;
  index?: number;
}) {
  const title = pick(p, "title", lang);
  const cats = p.categories.filter((c) => c.parent_id).length
    ? p.categories.filter((c) => c.parent_id)
    : p.categories;
  const vertical = isVerticalProject(p);
  const hasVideo = Boolean(p.video_url);
  // Portrait clips and images share 3:4 on phones so pairs line up; images widen to 4:3 from tablet up.
  const aspect = vertical ? "aspect-[3/4]" : hasVideo ? "aspect-video" : "aspect-[3/4] md:aspect-[4/3]";

  return (
    <Link
      href={`/work/${p.slug}`}
      data-cursor={hasVideo ? labels.watch : labels.view}
      onClick={(e) => {
        if (!onPlay || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onPlay();
      }}
      className={`group relative block overflow-hidden rounded-[20px] border border-line bg-surface shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_0_1px_var(--accent),0_30px_70px_-25px_var(--accent)] ${aspect}`}
    >
      <Media
        src={projectCover(p)}
        alt={title}
        label={title}
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        preload={index < 4}
        className="transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.07]"
      />

      {/* Legibility gradient */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#03050f] via-[#03050f]/35 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Top badges */}
      <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
        {p.year ? (
          <span className="rounded-full bg-black/55 px-2.5 py-1 font-display text-[11px] tracking-wider text-ink/90">{p.year}</span>
        ) : (
          <span />
        )}
        {hasVideo && (
          <span className="rounded-full bg-black/55 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-ink/90">
            ▶ {vertical ? "9:16" : "16:9"}
          </span>
        )}
      </div>

      {/* Play button */}
      {hasVideo && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-accent/90 text-xl text-white opacity-0 shadow-[0_0_40px_-4px_var(--accent)] transition-[opacity,transform] duration-500 ease-[var(--ease-out)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
          <span className="translate-x-0.5">▶</span>
        </span>
      )}

      {/* Title + categories */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
        {cats.length > 0 && (
          <p className="mb-2 flex flex-wrap gap-1.5">
            {cats.slice(0, 2).map((c, k) => (
              <span
                key={c.id}
                className={`rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] tracking-wide text-ink/80 ${k > 0 ? "hidden sm:inline" : ""}`}
              >
                {pick(c, "name", lang)}
              </span>
            ))}
          </p>
        )}
        <h3
          lang={pickLang(p, "title", lang)}
          className="line-clamp-2 font-display text-[0.95rem] font-medium leading-snug text-ink transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5 sm:text-lg"
        >
          {title}
        </h3>
      </div>
    </Link>
  );
}
