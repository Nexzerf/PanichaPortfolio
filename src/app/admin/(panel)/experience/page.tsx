import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("experiences").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="Experience & Education" description="Shown as a timeline. Drag to reorder (most recent first is usual)." />
      <Card>
        <CollectionEditor
          table="experiences"
          rows={data ?? []}
          titleKey="title"
          subtitleKeys={["org", "period", "kind"]}
          statusField="title"
          addLabel="Add entry"
          defaults={{ kind: "work" }}
          fields={[
            { kind: "select", name: "kind", label: "Type", options: [{ value: "work", label: "Experience" }, { value: "education", label: "Education" }] },
            { kind: "bilingual", name: "title", label: "Title / position" },
            { kind: "bilingual", name: "org", label: "Organisation / school" },
            { kind: "bilingual", name: "location", label: "Location" },
            { kind: "text", name: "period", label: "Period", placeholder: "2024 — Present" },
            { kind: "bilingual", name: "description", label: "Description", multiline: true },
          ]}
        />
      </Card>
    </>
  );
}
