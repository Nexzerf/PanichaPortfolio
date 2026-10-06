"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { saveProject, type ProjectImageInput } from "@/app/admin/actions";
import { BilingualField } from "./BilingualField";
import { MediaInput } from "./MediaInput";
import { SortableList } from "./Sortable";
import { useToast } from "./toast";
import { Badge, Button, Card, Field, inputCls, TextInput, Toggle } from "./ui";
import { uploadMedia } from "@/lib/upload";
import { isVideoFile, normalizeImageUrl, videoEmbed } from "@/lib/site";

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "video";
  }
};
import type { Category, ProjectStatus } from "@/lib/types";

type Values = Record<string, unknown>;
type GalleryItem = ProjectImageInput & { id: string; isNew?: boolean };

const SECTIONS = [
  ["basic", "Basic information"],
  ["media", "Media"],
  ["description", "Description"],
  ["categories", "Categories"],
  ["technology", "Technology"],
  ["links", "Links"],
  ["seo", "SEO"],
  ["publishing", "Publishing"],
] as const;

export function ProjectEditor({
  project,
  categories,
  initialCategoryIds,
  initialImages,
  initialNotes,
}: {
  project: Values | null;
  categories: Category[];
  initialCategoryIds: string[];
  initialImages: GalleryItem[];
  initialNotes: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [id, setId] = useState<string | null>((project?.id as string) ?? null);
  const [v, setV] = useState<Values>(
    project ?? { status: "draft", featured: false, tools: [], tags: [], year: new Date().getFullYear() },
  );
  const [catIds, setCatIds] = useState<string[]>(initialCategoryIds);
  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [notes, setNotes] = useState(initialNotes);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);

  const set = (key: string, value: unknown) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = (status: ProjectStatus | undefined, then?: "preview") =>
    start(async () => {
      // Open the preview tab inside the click gesture so popup blockers allow it.
      const previewTab = then === "preview" ? window.open("about:blank", "_blank") : null;
      if (previewTab) previewTab.opener = null;
      const payload = {
        ...v,
        ...(status ? { status } : {}),
        year: v.year ? Number(v.year) : null,
        team_size: v.team_size ? Number(v.team_size) : null,
        category_ids: catIds,
        images: images.map(({ isNew, id: imgId, ...img }) => ({ ...img, ...(isNew ? {} : { id: imgId }) })),
        notes,
      };
      const res = await saveProject(id, payload);
      if (!res.ok || !res.data) {
        previewTab?.close();
        return toast(res.ok ? "Save failed" : res.error, "error");
      }
      setDirty(false);
      if (status) setV((prev) => ({ ...prev, status }));
      setV((prev) => ({ ...prev, slug: res.data!.slug }));
      toast(status === "published" ? "Published — live on the site" : "Saved");
      if (!id) {
        setId(res.data.id);
        router.replace(`/admin/projects/${res.data.id}`);
      } else {
        router.refresh();
      }
      if (previewTab) previewTab.location.href = `/admin/preview/${res.data.id}`;
    });

  const addGalleryFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const up = await uploadMedia(file, `projects/${(v.slug as string) || "new"}/gallery`);
        const kind = file.type.startsWith("video/") ? "video" : "image";
        setImages((prev) => [...prev, { id: crypto.randomUUID(), isNew: true, kind, url: up.url, width: up.width, height: up.height }]);
        setDirty(true);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Upload failed", "error");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const addImageLink = () => {
    const url = window.prompt("วางลิงก์รูปภาพ หรือลิงก์ Google Drive (ต้องแชร์แบบ Anyone with the link)")?.trim();
    if (!url) return;
    if (!/^https:\/\//.test(url)) return toast("ลิงก์ต้องขึ้นต้นด้วย https://", "error");
    if (/drive\.google\.com\/drive\/folders/.test(url)) return toast("ใช้ลิงก์ของไฟล์ ไม่ใช่ลิงก์โฟลเดอร์", "error");
    setImages((prev) => [...prev, { id: crypto.randomUUID(), isNew: true, kind: "image", url: normalizeImageUrl(url) }]);
    setDirty(true);
  };

  const toggleOrientation = (id: string) => {
    setImages((l) =>
      l.map((x) => {
        if (x.id !== id) return x;
        const vertical = Boolean(x.height && x.width && x.height > x.width);
        return { ...x, width: vertical ? 16 : 9, height: vertical ? 9 : 16 };
      }),
    );
    setDirty(true);
  };

  const addVideoLink = () => {
    const url = window.prompt("วางลิงก์วิดีโอ YouTube / Shorts / Vimeo / TikTok / Google Drive");
    if (!url) return;
    if (/drive\.google\.com\/drive\/folders/.test(url)) return toast("ใช้ลิงก์ของไฟล์ ไม่ใช่ลิงก์โฟลเดอร์", "error");
    const embed = videoEmbed(url.trim());
    if (!embed) return toast("ลิงก์นี้ยังไม่รองรับ — ใช้ YouTube, Vimeo, TikTok หรือ Google Drive", "error");
    setImages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), isNew: true, kind: "video", url: url.trim(), width: embed.vertical ? 9 : 16, height: embed.vertical ? 16 : 9 },
    ]);
    setDirty(true);
  };

  // Main categories with their subcategories; picking a subcategory also picks its main category.
  const categoryGroups = categories
    .filter((c) => !c.parent_id || !categories.some((p) => p.id === c.parent_id))
    .map((main) => ({ main, subs: categories.filter((c) => c.parent_id === main.id) }));
  const toggleCategory = (c: Category, parentId?: string) => {
    setCatIds((ids) => {
      if (ids.includes(c.id)) {
        // Removing a main category also removes its subcategories.
        const childIds = categories.filter((x) => x.parent_id === c.id).map((x) => x.id);
        return ids.filter((x) => x !== c.id && !childIds.includes(x));
      }
      return [...new Set([...ids, c.id, ...(parentId ? [parentId] : [])])];
    });
    setDirty(true);
  };
  const categoryChip = (c: Category, parentId?: string) => {
    const on = catIds.includes(c.id);
    return (
      <button
        key={c.id}
        type="button"
        aria-pressed={on}
        onClick={() => toggleCategory(c, parentId)}
        className={`rounded-full border transition ${parentId ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${on ? "border-accent bg-accent/15 text-ink" : "border-line text-ink-2 hover:border-line-strong"}`}
      >
        {on ? "✓ " : ""}{c.name_en || c.name_th}{c.name_th && c.name_en && c.name_th !== c.name_en ? ` · ${c.name_th}` : ""}{c.hidden ? " (hidden)" : ""}
      </button>
    );
  };

  const status = (v.status as ProjectStatus) ?? "draft";
  const folder = `projects/${(v.slug as string) || "new"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
      {/* Section nav */}
      <nav aria-label="Editor sections" className="hidden lg:block">
        <ul className="sticky top-8 flex flex-col gap-1 text-sm">
          {SECTIONS.map(([key, label]) => (
            <li key={key}>
              <a href={`#${key}`} className="block rounded-lg px-3 py-1.5 text-ink-2 hover:bg-white/5 hover:text-ink">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-6 pb-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/projects" className="text-sm text-ink-3 hover:text-ink">← Projects</Link>
            <Badge tone={status === "published" ? "ok" : status === "draft" ? "warn" : "neutral"}>{status}</Badge>
            {dirty && <span className="text-xs text-ink-3">Unsaved changes</span>}
          </div>
        </div>

        <Card id="basic" title="Basic information">
          <div className="flex flex-col gap-5">
            <BilingualField label="Project title" name="title" values={v} onChange={set} />
            <BilingualField label="Short description" name="short" values={v} onChange={set} multiline rows={2} hint="One line shown on cards and the home page." />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextInput label="Year" type="number" min={1990} max={2100} value={v.year as number} onChange={(x) => set("year", x)} />
              <TextInput label="Team size" type="number" min={1} max={500} value={v.team_size as number} onChange={(x) => set("team_size", x)} />
              <TextInput label="Slug (URL)" value={v.slug as string} onChange={(x) => set("slug", x)} hint="/work/your-slug — generated from the English title if empty." />
            </div>
            <BilingualField label="Role" name="role" values={v} onChange={set} hint="e.g. Lead Developer & Designer" />
          </div>
        </Card>

        <Card id="media" title="Media" description="Images are resized and converted to WebP before upload. Videos: upload an MP4 (max 50 MB) or add a YouTube / Vimeo / TikTok / Google Drive link. Google Drive files must be shared as “Anyone with the link”. Click the VIDEO badge to switch a clip between 16:9 and 9:16.">
          <div className="grid gap-5 md:grid-cols-2">
            <MediaInput label="Thumbnail" value={v.thumbnail_url as string} onChange={(u) => set("thumbnail_url", u)} folder={folder} aspect="aspect-[4/3]" hint="Recommended 1600 × 1200 px (4:3). Keep the subject centred — the home page also crops it to 2:1 and 4:5." />
            <MediaInput label="Hero image" value={v.hero_url as string} onChange={(u) => set("hero_url", u)} folder={folder} aspect="aspect-[2/1]" hint="Recommended 2400 × 1200 px (2:1), shown at the top of the case study (cropped to 16:10 on phones). Falls back to the thumbnail." />
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-ink-3">Gallery (images & videos) — drag to reorder</h3>
              <div className="flex flex-wrap justify-end gap-2">
                <label className="cursor-pointer rounded-full border border-line-strong px-3 py-1.5 text-xs hover:bg-white/5">
                  {uploading ? `Uploading ${uploading}…` : "+ Images / MP4"}
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4" className="sr-only" onChange={(e) => { addGalleryFiles(e.target.files); e.target.value = ""; }} />
                </label>
                <button type="button" onClick={addImageLink} className="rounded-full border border-line-strong px-3 py-1.5 text-xs hover:bg-white/5">
                  + Image link
                </button>
                <button type="button" onClick={addVideoLink} className="rounded-full border border-line-strong px-3 py-1.5 text-xs hover:bg-white/5">
                  + Video link
                </button>
              </div>
            </div>
            {images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-3">No gallery items yet.</p>
            ) : (
              <SortableList
                items={images}
                grid
                onReorder={(next) => { setImages(next); setDirty(true); }}
                className="grid grid-cols-2 gap-3 md:grid-cols-3"
                renderItem={(img, handle) => (
                  <div className="overflow-hidden rounded-xl border border-line bg-surface">
                    <div className="relative aspect-[4/3] bg-black">
                      {img.kind === "video" ? (
                        isVideoFile(img.url) ? (
                          <video src={img.url} muted playsInline preload="metadata" className="h-full w-full object-contain" />
                        ) : (
                          <div className="grid h-full place-items-center p-3 text-center text-[11px] text-ink-2">
                            <span>
                              <span className="block text-2xl">▶</span>
                              {hostOf(img.url)}
                            </span>
                          </div>
                        )
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview
                        <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      )}
                      {img.kind === "video" && (
                        <button
                          type="button"
                          onClick={() => toggleOrientation(img.id)}
                          title="สลับแนวตั้ง / แนวนอน"
                          className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white hover:bg-black"
                        >
                          VIDEO · {img.height && img.width && img.height > img.width ? "9:16 แนวตั้ง" : "16:9 แนวนอน"} ⇄
                        </button>
                      )}
                      <div className="absolute left-1 top-1 rounded-md bg-black/70">{handle}</div>
                      <button
                        type="button"
                        onClick={() => { setImages((l) => l.filter((x) => x.id !== img.id)); setDirty(true); }}
                        className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-0.5 text-xs text-danger"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <input aria-label="Alt text (Thai)" placeholder={img.kind === "video" ? "คำบรรยาย (TH)" : "Alt (TH)"} value={img.alt_th ?? ""} onChange={(e) => { setImages((l) => l.map((x) => x.id === img.id ? { ...x, alt_th: e.target.value } : x)); setDirty(true); }} className={`${inputCls} !py-1 text-xs`} />
                      <input aria-label="Alt text (English)" placeholder={img.kind === "video" ? "Caption (EN)" : "Alt (EN)"} value={img.alt_en ?? ""} onChange={(e) => { setImages((l) => l.map((x) => x.id === img.id ? { ...x, alt_en: e.target.value } : x)); setDirty(true); }} className={`${inputCls} !py-1 text-xs`} />
                    </div>
                  </div>
                )}
              />
            )}
          </div>
          <div className="mt-6">
            <MediaInput label="Main video (MP4 upload, or YouTube / Vimeo / TikTok / Google Drive link)" kind="video" value={v.video_url as string} onChange={(u) => set("video_url", u)} folder={folder} />
          </div>
        </Card>

        <Card id="description" title="Description" description="Fill only the sections this project needs — empty ones are hidden. Start lines with “- ” to make a list.">
          <div className="flex flex-col gap-6">
            <BilingualField label="Overview" name="overview" values={v} onChange={set} multiline rows={5} />
            <BilingualField label="Problem" name="problem" values={v} onChange={set} multiline />
            <BilingualField label="Solution" name="solution" values={v} onChange={set} multiline />
            <BilingualField label="My role" name="my_role" values={v} onChange={set} multiline />
            <BilingualField label="Process" name="process" values={v} onChange={set} multiline />
            <BilingualField label="Features" name="features" values={v} onChange={set} multiline />
            <BilingualField label="Result" name="result" values={v} onChange={set} multiline />
            <BilingualField label="Awards for this project" name="awards" values={v} onChange={set} multiline rows={2} />
          </div>
        </Card>

        <Card id="categories" title="Categories" description="A project can belong to several categories. Choosing a subcategory (e.g. Short Film) also ticks its main category.">
          {categories.length === 0 ? (
            <p className="text-sm text-ink-3">
              No categories yet. <Link href="/admin/categories" className="text-accent hover:underline">Create some →</Link>
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {categoryGroups.map(({ main, subs }) => (
                <div key={main.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">{categoryChip(main)}</div>
                  {subs.length > 0 && (
                    <div className="ml-4 flex flex-wrap gap-2 border-l border-line pl-3">{subs.map((c) => categoryChip(c, main.id))}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card id="technology" title="Technology & tags">
          <div className="grid gap-4 md:grid-cols-2">
            <ListInput label="Tools / technologies" values={(v.tools as string[]) ?? []} onChange={(x) => set("tools", x)} placeholder="Next.js, Supabase, Figma" />
            <ListInput label="Tags" values={(v.tags as string[]) ?? []} onChange={(x) => set("tags", x)} placeholder="accessibility, ai" />
          </div>
        </Card>

        <Card id="links" title="Links">
          <div className="grid gap-4 md:grid-cols-3">
            <TextInput label="Live demo URL" type="url" value={v.demo_url as string} onChange={(x) => set("demo_url", x)} placeholder="https://" />
            <TextInput label="GitHub URL" type="url" value={v.github_url as string} onChange={(x) => set("github_url", x)} placeholder="https://github.com/…" />
            <TextInput label="External URL" type="url" value={v.external_url as string} onChange={(x) => set("external_url", x)} placeholder="https://" />
          </div>
        </Card>

        <Card id="seo" title="SEO & sharing" description="Defaults to the title, short description and thumbnail when empty.">
          <div className="flex flex-col gap-5">
            <BilingualField label="SEO title" name="seo_title" values={v} onChange={set} />
            <BilingualField label="SEO description" name="seo_description" values={v} onChange={set} multiline rows={2} />
            <div className="max-w-md">
              <MediaInput label="Share image (1200×630)" value={v.og_image_url as string} onChange={(u) => set("og_image_url", u)} folder={folder} aspect="aspect-[1200/630]" />
            </div>
          </div>
        </Card>

        <Card id="publishing" title="Publishing">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Status">
              {(fid) => (
                <select id={fid} value={status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                  <option value="draft">Draft — hidden from the website</option>
                  <option value="published">Published — visible on the website</option>
                  <option value="archived">Archived — kept, but hidden</option>
                </select>
              )}
            </Field>
            <Toggle label="Featured" hint="Show in Selected Work on the home page" checked={Boolean(v.featured)} onChange={(x) => set("featured", x)} />
            <Field label="Private notes (never shown publicly)" className="md:col-span-2">
              {(fid) => <textarea id={fid} rows={3} value={notes} onChange={(e) => { setNotes(e.target.value); setDirty(true); }} className={inputCls} />}
            </Field>
          </div>
        </Card>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[#040612] lg:left-[240px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-8">
          {id && status === "published" && (
            <a href={`/work/${v.slug}`} target="_blank" rel="noreferrer" className="mr-auto text-sm text-ink-3 hover:text-ink">View live ↗</a>
          )}
          <Button disabled={pending || uploading > 0} onClick={() => save(undefined)}>
            {status === "draft" ? "Save draft" : "Save"}
          </Button>
          <Button disabled={pending || uploading > 0} onClick={() => save(undefined, "preview")}>Preview</Button>
          {status !== "published" && (
            <Button variant="primary" disabled={pending || uploading > 0} onClick={() => save("published")}>
              {pending ? "Saving…" : "Publish"}
            </Button>
          )}
          {status === "published" && (
            <Button variant="subtle" disabled={pending} onClick={() => save("draft")}>Unpublish</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ListInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState(values.join(", "));
  return (
    <Field label={label} hint="Separate with commas">
      {(id) => (
        <input
          id={id}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
          }}
          className={inputCls}
        />
      )}
    </Field>
  );
}
