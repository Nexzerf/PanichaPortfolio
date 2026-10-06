import "server-only";
import { cache } from "react";
import { createPublicClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  Award,
  Category,
  Experience,
  Profile,
  Project,
  ProjectImage,
  ProjectWithRelations,
  SiteSettings,
  Skill,
  SocialLink,
} from "./types";

/*
 * Public read layer. Everything here goes through the cookieless anon client,
 * so only rows RLS exposes to visitors can ever be returned.
 */

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Panicha Portfolio",
  accent_color: "#3b6bff",
  default_lang: "th",
  seo_title_th: null, seo_title_en: null,
  seo_description_th: null, seo_description_en: null,
  og_image_url: null,
  contact_heading_th: null, contact_heading_en: null,
  contact_text_th: null, contact_text_en: null,
  footer_note_th: null, footer_note_en: null,
};

const PUBLIC_PROJECT_COLUMNS =
  "id, slug, title_th, title_en, short_th, short_en, overview_th, overview_en, problem_th, problem_en, solution_th, solution_en, my_role_th, my_role_en, process_th, process_en, features_th, features_en, result_th, result_en, awards_th, awards_en, role_th, role_en, year, team_size, tools, tags, thumbnail_url, hero_url, video_url, github_url, demo_url, external_url, status, featured, sort_order, seo_title_th, seo_title_en, seo_description_th, seo_description_en, og_image_url, created_at, updated_at, published_at";

const db = () => createPublicClient();

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data } = await db().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
});

export const getUiOverrides = cache(async () => {
  const map: Record<string, { th?: string; en?: string }> = {};
  if (!isSupabaseConfigured) return map;
  const { data } = await db().from("translations").select("key, th, en");
  for (const row of data ?? []) map[row.key] = { th: row.th ?? undefined, en: row.en ?? undefined };
  return map;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  if (!isSupabaseConfigured) return null;
  const { data } = await db().from("public_profile").select("*").eq("id", 1).maybeSingle();
  return (data as Profile) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await db()
    .from("categories")
    .select("id, slug, name_th, name_en, sort_order, hidden, parent_id")
    .eq("hidden", false)
    .order("sort_order");
  const visible = (data as Category[]) ?? [];
  // A subcategory disappears with its hidden parent.
  const ids = new Set(visible.map((c) => c.id));
  return visible.filter((c) => !c.parent_id || ids.has(c.parent_id));
});

type ProjectRow = Project & {
  project_categories: { category_id: string }[];
  project_images: ProjectImage[];
};

function withRelations(rows: ProjectRow[], categories: Category[]): ProjectWithRelations[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return rows.map(({ project_categories, project_images, ...p }) => ({
    ...p,
    categories: project_categories
      .map((pc) => byId.get(pc.category_id))
      .filter((c): c is Category => Boolean(c))
      .sort((a, b) => a.sort_order - b.sort_order),
    images: [...(project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export const getPublishedProjects = cache(async (): Promise<ProjectWithRelations[]> => {
  if (!isSupabaseConfigured) return [];
  const [{ data }, categories] = await Promise.all([
    db()
      .from("projects")
      .select(`${PUBLIC_PROJECT_COLUMNS}, project_categories(category_id), project_images(*)`)
      .eq("status", "published")
      .order("sort_order")
      .order("created_at", { ascending: false }),
    getCategories(),
  ]);
  return withRelations((data as ProjectRow[]) ?? [], categories);
});

export const getProjectBySlug = cache(async (slug: string) => {
  const projects = await getPublishedProjects();
  return projects.find((p) => p.slug === slug) ?? null;
});

export const getSkills = cache(async (): Promise<Skill[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await db().from("skills").select("*").order("sort_order");
  return (data as Skill[]) ?? [];
});

export const getExperiences = cache(async (): Promise<Experience[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await db().from("experiences").select("*").order("sort_order");
  return (data as Experience[]) ?? [];
});

export const getAwards = cache(async (): Promise<Award[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await db().from("awards").select("*").order("sort_order");
  return (data as Award[]) ?? [];
});

export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await db().from("social_links").select("*").order("sort_order");
  return (data as SocialLink[]) ?? [];
});
