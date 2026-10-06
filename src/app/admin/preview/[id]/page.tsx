import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/admin";
import { CaseStudy } from "@/components/site/CaseStudy";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getTranslator } from "@/lib/i18n/server";
import { LangSwitch } from "@/components/site/LangSwitch";
import type { Category, Project, ProjectImage } from "@/lib/types";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Renders a project (any status) exactly as the public case study would look. Owner only. */
export default async function PreviewPage(props: PageProps<"/admin/preview/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireOwner();
  const [{ data: project }, { data: links }, { data: images }, { lang, t }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_categories").select("categories(*)").eq("project_id", id),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    getTranslator(),
  ]);
  if (!project) notFound();
  const categories = ((links ?? []) as unknown as { categories: Category | null }[])
    .map((l) => l.categories)
    .filter((c): c is Category => Boolean(c));

  return (
    <MotionProvider>
      <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-accent/40 bg-[#0a1240] px-4 py-2.5 text-sm">
        <span>
          <strong className="font-display">Preview</strong>
          <span className="ml-2 text-ink-2">Status: {project.status} — visitors {project.status === "published" ? "can" : "cannot"} see this.</span>
        </span>
        <span className="flex items-center gap-4">
          <LangSwitch lang={lang} label="Language" />
          <Link href={`/admin/projects/${id}`} className="rounded-full bg-accent px-4 py-1.5 font-display text-white">Edit</Link>
        </span>
      </div>
      <CaseStudy
        project={{ ...(project as Project), categories, images: (images as ProjectImage[]) ?? [] }}
        related={[]}
        lang={lang}
        t={t}
      />
    </MotionProvider>
  );
}
