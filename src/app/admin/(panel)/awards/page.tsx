import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const metadata = { title: "Awards" };

export default async function AwardsPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("awards").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="Awards & Achievements" description="Competitions, hackathons, scholarships and recognitions." />
      <Card>
        <CollectionEditor
          table="awards"
          rows={data ?? []}
          titleKey="title"
          subtitleKeys={["issuer", "year"]}
          statusField="title"
          addLabel="Add award"
          fields={[
            { kind: "bilingual", name: "title", label: "Award" },
            { kind: "bilingual", name: "issuer", label: "Issuer / competition" },
            { kind: "text", name: "year", label: "Year", type: "number" },
            { kind: "bilingual", name: "description", label: "Description", multiline: true, rows: 2 },
          ]}
        />
      </Card>
    </>
  );
}
