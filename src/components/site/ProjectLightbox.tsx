"use client";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { pick, pickLang } from "@/lib/i18n/pick";
import type { Lang, ProjectWithRelations } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Watch a project's video without leaving the grid. ← / → move through the current
 * (filtered) list, Esc closes, and focus returns to where it was.
 */
export function ProjectLightbox({
  projects,
  index,
  onChange,
  onClose,
  lang,
  labels,
}: {
  projects: ProjectWithRelations[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
  lang: Lang;
  labels: { details: string; close: string; prev: string; next: string };
}) {
  const open = index !== null && projects[index] !== undefined;
  const p = open ? projects[index] : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      (returnFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % projects.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, projects.length, onChange, onClose]);

  const title = p ? pick(p, "title", lang) : "";
  const vertical = Boolean(p?.video_width && p?.video_height && p.video_height > p.video_width);

  return (
    <AnimatePresence>
      {p && index !== null && (
        <m.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#02040c]/95 p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        >
          <span aria-hidden className="stars opacity-40" />

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-black/60 text-lg text-ink transition-colors hover:border-ink sm:right-6 sm:top-6"
          >
            ✕
          </button>

          {projects.length > 1 && (
            <>
              <button
                type="button"
                aria-label={labels.prev}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((index - 1 + projects.length) % projects.length);
                }}
                className="absolute left-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-black/60 text-ink transition-colors hover:border-accent hover:text-accent md:grid lg:left-6"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={labels.next}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange((index + 1) % projects.length);
                }}
                className="absolute right-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-black/60 text-ink transition-colors hover:border-accent hover:text-accent md:grid lg:right-6"
              >
                →
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <m.div
              key={p.id}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex max-h-full w-full items-center gap-6 lg:gap-10 ${
                vertical ? "max-w-5xl flex-col md:flex-row md:justify-center" : "max-w-6xl flex-col"
              }`}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className={vertical ? "w-full md:w-auto md:shrink-0" : "w-full"}>
                <div className={vertical ? "md:w-[min(420px,calc((100svh-6rem)*9/16))]" : ""}>
                  <VideoPlayer
                    url={p.video_url ?? ""}
                    title={title}
                    width={p.video_width}
                    height={p.video_height}
                    className="shadow-[0_0_0_1px_var(--line),0_40px_120px_-40px_var(--accent)]"
                  />
                </div>
              </div>

              <div className={`flex w-full flex-col gap-4 ${vertical ? "md:max-w-sm" : "md:flex-row md:items-end md:justify-between"}`}>
                <div>
                  <p className="kicker mb-3 flex flex-wrap gap-x-3 gap-y-1">
                    {p.year && <span className="text-accent">{p.year}</span>}
                    {p.categories.map((c) => (
                      <span key={c.id}>{pick(c, "name", lang)}</span>
                    ))}
                  </p>
                  <h2 lang={pickLang(p, "title", lang)} className="font-display text-[clamp(1.4rem,3vw,2.2rem)] font-light leading-tight">
                    {title}
                  </h2>
                  {pick(p, "short", lang) && (
                    <p lang={pickLang(p, "short", lang)} className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base">
                      {pick(p, "short", lang)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/work/${p.slug}`}
                    className="group inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 font-display text-sm font-medium leading-none text-white shadow-[0_0_30px_-8px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {labels.details}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                  <span className="font-display text-xs tabular-nums text-ink-3">
                    {index + 1} / {projects.length}
                  </span>
                </div>
              </div>
            </m.div>
          </AnimatePresence>
        </m.div>
      )}
    </AnimatePresence>
  );
}
