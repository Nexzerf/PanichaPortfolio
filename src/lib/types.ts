export type Lang = "th" | "en";
export type ProjectStatus = "draft" | "published" | "archived";

export type SiteSettings = {
  site_name: string;
  accent_color: string;
  default_lang: Lang;
  seo_title_th: string | null; seo_title_en: string | null;
  seo_description_th: string | null; seo_description_en: string | null;
  og_image_url: string | null;
  contact_heading_th: string | null; contact_heading_en: string | null;
  contact_text_th: string | null; contact_text_en: string | null;
  footer_note_th: string | null; footer_note_en: string | null;
};

export type Profile = {
  full_name_th: string | null; full_name_en: string | null;
  nickname_th: string | null; nickname_en: string | null;
  job_title_th: string | null; job_title_en: string | null;
  hero_title_th: string | null; hero_title_en: string | null;
  hero_subtitle_th: string | null; hero_subtitle_en: string | null;
  short_bio_th: string | null; short_bio_en: string | null;
  long_bio_th: string | null; long_bio_en: string | null;
  location_th: string | null; location_en: string | null;
  university_th: string | null; university_en: string | null;
  interests_th: string | null; interests_en: string | null;
  photo_url: string | null;
  resume_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
};

export type OwnerProfile = Profile & { show_email: boolean; show_phone: boolean };

export type Category = {
  id: string;
  slug: string;
  name_th: string | null;
  name_en: string | null;
  sort_order: number;
  hidden: boolean;
  /** Set for subcategories (one level deep), e.g. "Short Film" under "Video Editor". */
  parent_id: string | null;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  /** "video" items are an uploaded MP4 or a YouTube / Vimeo / TikTok link. */
  kind: "image" | "video";
  url: string;
  alt_th: string | null;
  alt_en: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

/** Bilingual long-form sections a case study may include. */
export const CASE_SECTIONS = [
  "overview",
  "problem",
  "solution",
  "my_role",
  "process",
  "features",
  "result",
] as const;
export type CaseSection = (typeof CASE_SECTIONS)[number];

export type Project = {
  id: string;
  slug: string;
  title_th: string | null; title_en: string | null;
  short_th: string | null; short_en: string | null;
  overview_th: string | null; overview_en: string | null;
  problem_th: string | null; problem_en: string | null;
  solution_th: string | null; solution_en: string | null;
  my_role_th: string | null; my_role_en: string | null;
  process_th: string | null; process_en: string | null;
  features_th: string | null; features_en: string | null;
  result_th: string | null; result_en: string | null;
  awards_th: string | null; awards_en: string | null;
  role_th: string | null; role_en: string | null;
  year: number | null;
  team_size: number | null;
  tools: string[];
  tags: string[];
  thumbnail_url: string | null;
  hero_url: string | null;
  video_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  external_url: string | null;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
  seo_title_th: string | null; seo_title_en: string | null;
  seo_description_th: string | null; seo_description_en: string | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ProjectWithRelations = Project & {
  categories: Category[];
  images: ProjectImage[];
};

export type Skill = {
  id: string;
  name_th: string | null; name_en: string | null;
  group_th: string | null; group_en: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  kind: "work" | "education";
  title_th: string | null; title_en: string | null;
  org_th: string | null; org_en: string | null;
  location_th: string | null; location_en: string | null;
  period: string | null;
  description_th: string | null; description_en: string | null;
  sort_order: number;
};

export type Award = {
  id: string;
  title_th: string | null; title_en: string | null;
  issuer_th: string | null; issuer_en: string | null;
  year: number | null;
  description_th: string | null; description_en: string | null;
  project_id: string | null;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  sort_order: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};
