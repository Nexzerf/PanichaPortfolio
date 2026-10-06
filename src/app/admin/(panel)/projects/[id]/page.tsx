import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { Category, ProjectImage } from "@/lib/types";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage(props: PageProps<"/admin/projects/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireOwner();
  const [{ data: project }, { data: categories }, { data: links }, { data: images }, { data: notes }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("project_categories").select("category_id").eq("project_id", id),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("project_notes").select("notes").eq("project_id", id).maybeSingle(),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader title={project.title_th || project.title_en || "Untitled project"} />
      <ProjectEditor
        key={project.updated_at}
        project={project}
        categories={(categories as Category[]) ?? []}
        initialCategoryIds={(links ?? []).map((l) => l.category_id as string)}
        initialImages={((images as ProjectImage[]) ?? []).map((i) => ({ ...i }))}
        initialNotes={notes?.notes ?? ""}
      />
    </>
  );
}
