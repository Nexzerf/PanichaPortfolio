import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { SingletonForm } from "@/components/admin/SingletonForm";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { dictionary } from "@/lib/i18n/dictionary";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireOwner();
  const [{ data: settings }, { data: labels }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("translations").select("*").order("key"),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Site-wide appearance, language, SEO and wording." />
      <SingletonForm
        table="site_settings"
        initial={settings ?? {}}
        groups={[
          {
            title: "General",
            columns: 2,
            fields: [
              { kind: "text", name: "site_name", label: "Site name" },
              { kind: "color", name: "accent_color", label: "Accent colour", hint: "The single highlight colour used for buttons, links and glows." },
              {
                kind: "select",
                name: "default_lang",
                label: "Default language",
                options: [
                  { value: "th", label: "ไทย (Thai)" },
                  { value: "en", label: "English" },
                ],
              },
            ],
          },
          {
            title: "SEO & sharing",
            fields: [
              { kind: "bilingual", name: "seo_title", label: "Default page title" },
              { kind: "bilingual", name: "seo_description", label: "Default description", multiline: true, rows: 2 },
              { kind: "media", name: "og_image_url", label: "Default share image (1200×630)", media: "image", aspect: "aspect-[1200/630]" },
            ],
          },
          {
            title: "Contact section",
            fields: [
              { kind: "bilingual", name: "contact_heading", label: "Heading", hint: "Defaults to “Let’s work together.”" },
              { kind: "bilingual", name: "contact_text", label: "Intro text", multiline: true, rows: 2 },
              { kind: "bilingual", name: "footer_note", label: "Footer note" },
            ],
          },
        ]}
      />
      <Card title="Interface wording" description="Override any built-in label (buttons, section titles). Leave a language empty to keep the default.">
        <CollectionEditor
          table="translations"
          sortable={false}
          rows={(labels ?? []).map((l) => ({ ...l, id: l.key }))}
          titleKey="key"
          subtitleKeys={["th", "en"]}
          addLabel="Override a label"
          defaults={{ key: Object.keys(dictionary)[0] }}
          fields={[
            {
              kind: "select",
              name: "key",
              label: "Label",
              options: Object.entries(dictionary).map(([k, v]) => ({ value: k, label: `${k} — ${v.en}` })),
            },
            { kind: "text", name: "th", label: "ไทย" },
            { kind: "text", name: "en", label: "English" },
          ]}
        />
      </Card>
    </>
  );
}
