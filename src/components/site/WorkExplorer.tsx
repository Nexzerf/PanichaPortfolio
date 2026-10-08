"use client";
import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectLightbox } from "./ProjectLightbox";
import { isVideoFile, videoEmbed } from "@/lib/site";
import type { WorkLabels } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/pick";
import type { Category, Lang, ProjectWithRelations } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Category filter + masonry grid of cinematic project cards; video work plays in an in-page lightbox.
 * Filtering is client-side (no reload); the choice is mirrored to ?category= so it can be shared.
 * Only categories that actually contain published work appear as filters.
 */
export function WorkExplorer({
  projects,
  categories,
  lang,
  labels,
  syncUrl = false,
  initialCategory = "all",
}: {
  projects: ProjectWithRelations[];
  categories: Category[];
  lang: Lang;
  labels: WorkLabels;
  syncUrl?: boolean;
  initialCategory?: string;
}) {
  const [active, setActive] = useState<string>(initialCategory);

  const choose = (slug: string) => {
    setActive(slug);
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (slug === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", slug);
      window.history.replaceState(null, "", url);
    }
  };

  // Each project counts toward its own categories and their parents,
  // so "Video Editor" includes everything filed under "Short Film", "AI Clips", …
  const { slugsByProject, counts, mains, childrenOf, parentOf } = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    const slugsByProject = new Map<string, Set<string>>();
    const counts: Record<string, number> = { all: projects.length };
    for (const p of projects) {
      const slugs = new Set<string>();
      for (const c of p.categories) {
        slugs.add(c.slug);
        const parent = c.parent_id ? byId.get(c.parent_id) : undefined;
        if (parent) slugs.add(parent.slug);
      }
      slugsByProject.set(p.id, slugs);
      for (const s of slugs) counts[s] = (counts[s] ?? 0) + 1;
    }
    const used = categories.filter((c) => counts[c.slug]);
    const usedIds = new Set(used.map((c) => c.id));
    const mains = used.filter((c) => !c.parent_id || !usedIds.has(c.parent_id));
    const childrenOf = (id: string) => used.filter((c) => c.parent_id === id);
    const parentOf = (slug: string) => {
      const c = used.find((x) => x.slug === slug);
      return c?.parent_id ? used.find((x) => x.id === c.parent_id) ?? null : null;
    };
    return { slugsByProject, counts, mains, childrenOf, parentOf };
  }, [projects, categories]);

  const activeMain = active === "all" ? null : parentOf(active) ?? mains.find((c) => c.slug === active) ?? null;
  const subs = activeMain ? childrenOf(activeMain.id) : [];
  const visible = active === "all" ? projects : projects.filter((p) => slugsByProject.get(p.id)?.has(active));
  // Projects the in-page player can show, in the same order as the grid.
  const playable = visible.filter((p) => p.video_url && (videoEmbed(p.video_url) || isVideoFile(p.video_url)));
  const [playing, setPlaying] = useState<number | null>(null);

  const pill = (slug: string, label: string, on: boolean, layoutId: string, small = false) => (
    <button
      key={slug}
      type="button"
      aria-pressed={on}
      onClick={() => choose(slug)}
      className={`relative rounded-full font-display transition-colors duration-300 ${small ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"} ${
        on ? "text-white" : "text-ink-2 hover:text-ink"
      }`}
    >
      {on && (
        <m.span
          layoutId={layoutId}
          className={`absolute inset-0 rounded-full ${small ? "bg-white/15" : "bg-accent shadow-[0_0_30px_-8px_var(--accent)]"}`}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      {!on && <span className="absolute inset-0 rounded-full border border-line" aria-hidden />}
      <span className="relative">
        {label}
        <sup className="ml-1 text-[0.65em] opacity-60">{counts[slug] ?? 0}</sup>
      </span>
    </button>
  );

  return (
    <div>
      <div className="mb-14 flex flex-col gap-3">
        <div role="group" aria-label={labels.filter} className="-mx-1 flex flex-wrap gap-2">
          {pill("all", labels.all, active === "all", "filter-pill")}
          {mains.map((c) => pill(c.slug, pick(c, "name", lang), activeMain?.id === c.id, "filter-pill"))}
        </div>
        <AnimatePresence initial={false}>
          {activeMain && subs.length > 0 && (
            <m.div
              key={activeMain.id}
              role="group"
              aria-label={pick(activeMain, "name", lang)}
              className="-mx-1 flex flex-wrap items-center gap-2 border-l border-accent/60 pl-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {pill(activeMain.slug, labels.all, active === activeMain.slug, "sub-pill", true)}
              {subs.map((c) => pill(c.slug, pick(c, "name", lang), active === c.slug, "sub-pill", true))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} / {projects.length}
      </p>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-ink-3">{labels.empty}</p>
      ) : (
        // Masonry: each card keeps its own shape (portrait clip, wide video, image), so many fit on screen.
        <ul key={active} className="columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
          {visible.map((p, i) => {
            const videoIndex = playable.findIndex((x) => x.id === p.id);
            return (
              <m.li
                key={p.id}
                className="mb-3 break-inside-avoid sm:mb-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.035, 0.4) }}
              >
                <ProjectCard
                  project={p}
                  lang={lang}
                  index={i}
                  labels={{ view: labels.view, watch: labels.watch }}
                  onPlay={videoIndex >= 0 ? () => setPlaying(videoIndex) : undefined}
                />
              </m.li>
            );
          })}
        </ul>
      )}

      <ProjectLightbox
        projects={playable}
        index={playing}
        onChange={setPlaying}
        onClose={() => setPlaying(null)}
        lang={lang}
        labels={labels}
      />
    </div>
  );
}
