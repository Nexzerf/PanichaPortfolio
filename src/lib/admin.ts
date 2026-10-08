import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import { normalizeImageUrl } from "./site";

/** Returns the signed-in owner and a session client, or redirects. Used by every admin page and action. */
export const requireOwner = cache(async () => {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isOwner } = await supabase.rpc("is_owner");
  if (!isOwner) redirect("/admin/login?error=not_owner");
  return { supabase, user };
});

/**
 * Columns the admin may write, per table. Anything else in a payload is dropped,
 * so a crafted request cannot set ids, timestamps or columns that don't exist.
 */
export const WRITABLE: Record<string, readonly string[]> = {
  projects: [
    "slug", "title_th", "title_en", "short_th", "short_en", "overview_th", "overview_en",
    "problem_th", "problem_en", "solution_th", "solution_en", "my_role_th", "my_role_en",
    "process_th", "process_en", "features_th", "features_en", "result_th", "result_en",
    "awards_th", "awards_en", "role_th", "role_en", "year", "team_size", "tools", "tags",
    "thumbnail_url", "hero_url", "video_url", "video_width", "video_height", "github_url", "demo_url", "external_url",
    "status", "featured", "seo_title_th", "seo_title_en", "seo_description_th",
    "seo_description_en", "og_image_url",
  ],
  categories: ["slug", "name_th", "name_en", "hidden", "parent_id"],
  skills: ["name_th", "name_en", "group_th", "group_en"],
  experiences: [
    "kind", "title_th", "title_en", "org_th", "org_en", "location_th", "location_en",
    "period", "description_th", "description_en",
  ],
  awards: ["title_th", "title_en", "issuer_th", "issuer_en", "year", "description_th", "description_en", "project_id"],
  certificates: [
    "title_th", "title_en", "issuer_th", "issuer_en", "description_th", "description_en",
    "issued", "image_url", "file_url", "credential_url",
  ],
  social_links: ["platform", "label", "url"],
  translations: ["key", "th", "en"],
  profile: [
    "full_name_th", "full_name_en", "nickname_th", "nickname_en", "job_title_th", "job_title_en",
    "hero_title_th", "hero_title_en", "hero_subtitle_th", "hero_subtitle_en",
    "short_bio_th", "short_bio_en", "long_bio_th", "long_bio_en", "location_th", "location_en",
    "university_th", "university_en", "interests_th", "interests_en",
    "photo_url", "resume_url", "email", "phone", "website", "show_email", "show_phone",
  ],
  site_settings: [
    "site_name", "accent_color", "default_lang", "seo_title_th", "seo_title_en",
    "seo_description_th", "seo_description_en", "og_image_url", "contact_heading_th",
    "contact_heading_en", "contact_text_th", "contact_text_en", "footer_note_th", "footer_note_en",
  ],
};

export const SORTABLE_TABLES = ["projects", "categories", "skills", "experiences", "awards", "certificates", "social_links"] as const;
export type SortableTable = (typeof SORTABLE_TABLES)[number];

const IMAGE_FIELDS = new Set(["thumbnail_url", "hero_url", "og_image_url", "photo_url", "image_url"]);

const URL_FIELDS = new Set([
  "thumbnail_url", "hero_url", "video_url", "github_url", "demo_url", "external_url",
  "og_image_url", "photo_url", "resume_url", "website", "url", "image_url", "file_url", "credential_url",
]);

/** Keeps only whitelisted columns, trims strings, turns "" into null and rejects non-http(s) URLs. */
export function cleanPayload(table: string, input: Record<string, unknown>) {
  const allowed = WRITABLE[table];
  if (!allowed) throw new Error(`Table ${table} is not editable`);
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in input)) continue;
    let value = input[key];
    if (typeof value === "string") {
      value = value.trim();
      if (value === "") value = null;
    }
    if (URL_FIELDS.has(key) && typeof value === "string" && !/^(https?:\/\/|mailto:)/i.test(value)) {
      throw new Error(`Invalid URL in ${key}`);
    }
    if (IMAGE_FIELDS.has(key) && typeof value === "string") value = normalizeImageUrl(value);
    if (Array.isArray(value)) {
      value = value.map((v) => String(v).trim()).filter(Boolean).slice(0, 50);
    }
    out[key] = value;
  }
  return out;
}
