"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cleanPayload, requireOwner, SORTABLE_TABLES, WRITABLE, type SortableTable } from "@/lib/admin";
import { normalizeImageUrl, slugify } from "@/lib/site";
import { detectVideoSize } from "@/lib/video-size";
import type { ProjectStatus } from "@/lib/types";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Every successful write refreshes the whole public site so changes show immediately. */
function refreshSite() {
  revalidatePath("/", "layout");
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    refreshSite();
    return { ok: true, data };
  } catch (e) {
    // redirect() throws a special error that must propagate.
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw e;
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// ─── Auth ────────────────────────────────────────────────────
export async function signOut() {
  const { supabase } = await requireOwner();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ─── Projects ────────────────────────────────────────────────
export type ProjectImageInput = {
  id?: string;
  kind?: "image" | "video";
  url: string;
  alt_th?: string | null;
  alt_en?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProjectInput = Record<string, unknown> & {
  category_ids: string[];
  images: ProjectImageInput[];
  notes?: string | null;
};

export async function saveProject(id: string | null, input: ProjectInput) {
  return run(async () => {
    const { supabase } = await requireOwner();
    const row = cleanPayload("projects", input);
    // Main video orientation: detect when the link is new or the size is unknown.
    if (!row.video_url) {
      row.video_width = null;
      row.video_height = null;
    } else if (!row.video_width || !row.video_height) {
      const size = await detectVideoSize(String(row.video_url));
      row.video_width = size?.width ?? null;
      row.video_height = size?.height ?? null;
    }
    const status = row.status as ProjectStatus | undefined;
    if (status && !["draft", "published", "archived"].includes(status)) throw new Error("Invalid status");
    if (!row.slug) {
      row.slug = slugify(String(row.title_en ?? "")) || `project-${Date.now().toString(36)}`;
    } else {
      row.slug = slugify(String(row.slug));
    }
    if (status === "published" && !row.title_th && !row.title_en) throw new Error("A title is required to publish");

    let projectId = id;
    if (projectId) {
      check(await supabase.from("projects").update(row).eq("id", projectId));
    } else {
      const { data: last } = await supabase
        .from("projects")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const created = check(
        await supabase
          .from("projects")
          .insert({ ...row, sort_order: (last?.sort_order ?? -1) + 1 })
          .select("id")
          .single(),
      );
      projectId = (created as { id: string }).id;
    }

    // Categories: replace the set
    check(await supabase.from("project_categories").delete().eq("project_id", projectId));
    const cats = [...new Set(input.category_ids ?? [])];
    if (cats.length) {
      check(
        await supabase
          .from("project_categories")
          .insert(cats.map((category_id) => ({ project_id: projectId, category_id }))),
      );
    }

    // Gallery: keep given images in the given order, drop the rest
    const images = await Promise.all(
      (input.images ?? [])
        .filter((img) => /^https?:\/\//.test(img.url))
        .slice(0, 60)
        .map(async (img) => {
          if (img.kind !== "video" || (img.width && img.height)) return img;
          const size = await detectVideoSize(img.url);
          return { ...img, width: size?.width ?? null, height: size?.height ?? null };
        }),
    );
    const keepIds = images.map((i) => i.id).filter(Boolean) as string[];
    const del = supabase.from("project_images").delete().eq("project_id", projectId);
    check(await (keepIds.length ? del.not("id", "in", `(${keepIds.join(",")})`) : del));
    if (images.length) {
      check(
        await supabase.from("project_images").upsert(
          images.map((img, i) => ({
            ...(img.id ? { id: img.id } : {}),
            project_id: projectId,
            kind: img.kind === "video" ? "video" : "image",
            url: img.kind === "video" ? img.url : normalizeImageUrl(img.url),
            alt_th: img.alt_th?.trim() || null,
            alt_en: img.alt_en?.trim() || null,
            width: img.width ?? null,
            height: img.height ?? null,
            sort_order: i,
          })),
        ),
      );
    }

    // Private notes (owner-only table)
    if (input.notes !== undefined) {
      check(
        await supabase
          .from("project_notes")
          .upsert({ project_id: projectId, notes: input.notes?.toString().trim() || null }),
      );
    }

    return { id: projectId, slug: row.slug as string };
  });
}

export async function updateProjectFlags(id: string, patch: { featured?: boolean; status?: ProjectStatus }) {
  return run(async () => {
    const { supabase } = await requireOwner();
    const row: Record<string, unknown> = {};
    if (typeof patch.featured === "boolean") row.featured = patch.featured;
    if (patch.status && ["draft", "published", "archived"].includes(patch.status)) row.status = patch.status;
    check(await supabase.from("projects").update(row).eq("id", id));
  });
}

export async function deleteProject(id: string) {
  return run(async () => {
    const { supabase } = await requireOwner();
    check(await supabase.from("projects").delete().eq("id", id));
  });
}

// ─── Generic rows (categories, skills, experiences, awards, social links, UI labels) ──
export async function saveRow(table: string, id: string | null, input: Record<string, unknown>) {
  return run(async () => {
    const { supabase } = await requireOwner();
    if (!WRITABLE[table] || table === "projects" || table === "profile" || table === "site_settings") {
      throw new Error("Not allowed");
    }
    const row = cleanPayload(table, input);
    if (table === "categories") {
      row.slug = slugify(String(row.slug ?? row.name_en ?? "")) || `category-${Date.now().toString(36)}`;
      // Subcategories are one level deep: the parent must be a top-level category,
      // and a category that already has subcategories cannot itself become one.
      if (row.parent_id) {
        if (row.parent_id === id) throw new Error("A category cannot be its own parent");
        const { data: parent } = await supabase.from("categories").select("parent_id").eq("id", row.parent_id).maybeSingle();
        if (!parent) throw new Error("Parent category not found");
        if (parent.parent_id) throw new Error("Choose a main category as the parent (only one level of subcategories)");
        if (id) {
          const { count } = await supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id);
          if (count) throw new Error("This category has subcategories, so it cannot be placed under another one");
        }
      }
    }
    if (table === "translations") {
      const key = String(row.key ?? "");
      if (!key) throw new Error("Key required");
      check(await supabase.from("translations").upsert(row));
      return { id: key };
    }
    if (id) {
      check(await supabase.from(table).update(row).eq("id", id));
      return { id };
    }
    let sort: Record<string, number> = {};
    if ((SORTABLE_TABLES as readonly string[]).includes(table)) {
      const { data: last } = await supabase
        .from(table)
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      sort = { sort_order: ((last as { sort_order?: number } | null)?.sort_order ?? -1) + 1 };
    }
    const created = check(await supabase.from(table).insert({ ...row, ...sort }).select("id").single());
    return { id: (created as { id: string }).id };
  });
}

export async function deleteRow(table: string, id: string) {
  return run(async () => {
    const { supabase } = await requireOwner();
    if (!WRITABLE[table] || table === "profile" || table === "site_settings") throw new Error("Not allowed");
    const key = table === "translations" ? "key" : "id";
    check(await supabase.from(table).delete().eq(key, id));
  });
}

/** Persists a drag-and-drop order: position in `ids` becomes sort_order. */
export async function reorder(table: SortableTable, ids: string[]) {
  return run(async () => {
    const { supabase } = await requireOwner();
    if (!SORTABLE_TABLES.includes(table)) throw new Error("Not sortable");
    await Promise.all(
      ids.slice(0, 500).map(async (id, i) => check(await supabase.from(table).update({ sort_order: i }).eq("id", id))),
    );
  });
}

// ─── Singletons ──────────────────────────────────────────────
export async function saveSingleton(table: "profile" | "site_settings", input: Record<string, unknown>) {
  return run(async () => {
    const { supabase } = await requireOwner();
    if (table !== "profile" && table !== "site_settings") throw new Error("Not allowed");
    const row = cleanPayload(table, input);
    if (table === "site_settings") {
      if (row.accent_color && !/^#[0-9a-f]{6}$/i.test(String(row.accent_color))) throw new Error("Accent must be #RRGGBB");
      if (row.default_lang && !["th", "en"].includes(String(row.default_lang))) throw new Error("Invalid language");
    }
    check(await supabase.from(table).update(row).eq("id", 1));
  });
}

// ─── Contact messages ───────────────────────────────────────
export async function setMessageRead(id: string, read: boolean) {
  return run(async () => {
    const { supabase } = await requireOwner();
    check(await supabase.from("contact_messages").update({ read }).eq("id", id));
  });
}

export async function deleteMessage(id: string) {
  return run(async () => {
    const { supabase } = await requireOwner();
    check(await supabase.from("contact_messages").delete().eq("id", id));
  });
}
