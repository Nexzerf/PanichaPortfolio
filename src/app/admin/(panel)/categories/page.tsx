import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  const all = (data as Category[]) ?? [];
  // Show each main category followed by its subcategories.
  const mains = all.filter((c) => !c.parent_id || !all.some((p) => p.id === c.parent_id));
  const rows = mains.flatMap((m) => [m, ...all.filter((c) => c.parent_id === m.id)]);
  return (
    <>
      <PageHeader
        title="Categories"
        description="Filters on the Work page are built from these automatically. Pick a main category to make a subcategory (e.g. Short Film under Video Editor). Drag to reorder; hidden categories disappear from the site."
      />
      <Card>
        <CollectionEditor
          table="categories"
          rows={rows}
          indentKey="parent_id"
          titleKey="name"
          subtitleKeys={["slug"]}
          statusField="name"
          addLabel="New category"
          defaults={{ hidden: false }}
          fields={[
            { kind: "bilingual", name: "name", label: "Name" },
            {
              kind: "select",
              name: "parent_id",
              label: "Main category",
              options: [
                { value: "", label: "— None (this is a main category) —" },
                ...mains.map((m) => ({ value: m.id, label: `${m.name_en || m.name_th}${m.name_th && m.name_en ? ` / ${m.name_th}` : ""}` })),
              ],
            },
            { kind: "text", name: "slug", label: "Slug", placeholder: "web-development", hint: "Used in ?category= links. Generated from the English name if empty." },
            { kind: "toggle", name: "hidden", label: "Hidden", hint: "Keep the category but don’t show it publicly" },
          ]}
        />
      </Card>
    </>
  );
}
