import { requireOwner } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { Category } from "@/lib/types";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { supabase } = await requireOwner();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="New project" description="เขียนแต่ละช่องทั้งภาษาไทยและภาษาอังกฤษ ช่องที่เว้นว่างไว้ หน้าเว็บจะแสดงอีกภาษาแทน" />
      <ProjectEditor
        project={null}
        categories={(categories as Category[]) ?? []}
        initialCategoryIds={[]}
        initialImages={[]}
        initialNotes=""
      />
    </>
  );
}
