export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** All portfolio tables live in their own Postgres schema (shared Supabase project). */
export const DB_SCHEMA = "portfolio";
export const MEDIA_BUCKET = "portfolio-media";
