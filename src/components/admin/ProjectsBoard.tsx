"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProject, reorder, updateProjectFlags } from "@/app/admin/actions";
import { SortableList } from "./Sortable";
import { useToast } from "./toast";
import { Badge, Button, TranslationStatus } from "./ui";
import type { ProjectStatus } from "@/lib/types";

export type ProjectRow = {
  id: string;
  slug: string;
  title_th: string | null;
  title_en: string | null;
  short_th: string | null;
  short_en: string | null;
  status: ProjectStatus;
  featured: boolean;
  year: number | null;
  thumbnail_url: string | null;
  updated_at: string;
  project_categories: { categories: { name_th: string | null; name_en: string | null } | null }[];
};

const STATUS_TONE = { published: "ok", draft: "warn", archived: "neutral" } as const;

export function ProjectsBoard({ initial, initialFilter }: { initial: ProjectRow[]; initialFilter: string }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState(initialFilter);
  const [, start] = useTransition();
  const toast = useToast();

  const persistOrder = (next: ProjectRow[]) => {
    setItems(next);
    start(async () => {
      const res = await reorder("projects", next.map((p) => p.id));
      toast(res.ok ? "Order saved" : res.error, res.ok ? "ok" : "error");
    });
  };

  const patch = (id: string, change: Partial<Pick<ProjectRow, "featured" | "status">>) => {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, ...change } : p)));
    start(async () => {
      const res = await updateProjectFlags(id, change);
      if (!res.ok) toast(res.error, "error");
    });
  };

  const remove = (p: ProjectRow) => {
    if (!confirm(`Delete “${p.title_th || p.title_en}”? This cannot be undone.`)) return;
    setItems((list) => list.filter((x) => x.id !== p.id));
    start(async () => {
      const res = await deleteProject(p.id);
      toast(res.ok ? "Project deleted" : res.error, res.ok ? "ok" : "error");
    });
  };

  const visible = filter === "all" ? items : items.filter((p) => p.status === filter);
  const canDrag = filter === "all";

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong p-12 text-center">
        <p className="text-ink-2">No projects yet.</p>
        <Link href="/admin/projects/new" className="mt-4 inline-block text-accent hover:underline">Create your first project →</Link>
      </div>
    );
  }

  return (
    <>
      <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1">
        {["all", "published", "draft", "archived"].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize ${filter === s ? "bg-white/10 text-ink" : "text-ink-3 hover:text-ink"}`}
          >
            {s} ({s === "all" ? items.length : items.filter((p) => p.status === s).length})
          </button>
        ))}
        {!canDrag && <span className="self-center pl-2 text-xs text-ink-3">Switch to “all” to reorder.</span>}
      </div>
      <SortableList
        items={visible}
        onReorder={canDrag ? persistOrder : () => {}}
        className="flex flex-col gap-2"
        renderItem={(p, handle) => (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-[#070b1f] p-2 pr-3">
            {canDrag ? handle : <span className="w-6" />}
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {p.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/projects/${p.id}`} className="block truncate font-display hover:text-accent">
                {p.title_th || p.title_en || p.slug}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                {p.year && <span>{p.year}</span>}
                <span className="truncate">
                  {p.project_categories.map((pc) => pc.categories?.name_en || pc.categories?.name_th).filter(Boolean).join(", ")}
                </span>
                <span className="hidden md:inline"><TranslationStatus th={p.title_th} en={p.title_en} /></span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-pressed={p.featured}
                title={p.featured ? "Featured on home" : "Not featured"}
                onClick={() => patch(p.id, { featured: !p.featured })}
                className={`rounded-full px-2 py-1 text-lg leading-none ${p.featured ? "text-warn" : "text-ink-3 hover:text-ink"}`}
              >
                {p.featured ? "★" : "☆"}
                <span className="sr-only">Toggle featured</span>
              </button>
              <select
                aria-label="Status"
                value={p.status}
                onChange={(e) => patch(p.id, { status: e.target.value as ProjectStatus })}
                className="hidden rounded-lg border border-line bg-transparent px-2 py-1 text-xs sm:block"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <Link href={`/admin/projects/${p.id}`} className="rounded-full px-3 py-1.5 text-xs text-ink-2 hover:bg-white/5 hover:text-ink">Edit</Link>
              <Button size="sm" variant="subtle" onClick={() => remove(p)} className="hover:!text-danger">Delete</Button>
            </div>
          </div>
        )}
      />
    </>
  );
}
