import Link from "next/link";
import { requireOwner } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { ProjectsBoard, type ProjectRow } from "@/components/admin/ProjectsBoard";

export const metadata = { title: "Projects" };

export default async function ProjectsPage(props: PageProps<"/admin/projects">) {
  const { status } = await props.searchParams;
  const { supabase } = await requireOwner();
  const { data } = await supabase
    .from("projects")
    .select("id, slug, title_th, title_en, short_th, short_en, status, featured, year, thumbnail_url, updated_at, project_categories(categories(name_th, name_en))")
    .order("sort_order");
  return (
    <>
      <PageHeader
        title="Projects"
        description="Drag to set the order shown on the website. Drafts and archived projects stay private."
        actions={
          <Link href="/admin/projects/new" className="rounded-full bg-accent px-4 py-2 font-display text-sm text-white">
            + New project
          </Link>
        }
      />
      <ProjectsBoard initial={(data as unknown as ProjectRow[]) ?? []} initialFilter={typeof status === "string" ? status : "all"} />
    </>
  );
}
