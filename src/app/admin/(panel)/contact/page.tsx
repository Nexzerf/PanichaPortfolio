import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { Inbox } from "@/components/admin/Inbox";
import type { ContactMessage } from "@/lib/types";

export const metadata = { title: "Contact" };

export default async function ContactAdminPage() {
  const { supabase } = await requireOwner();
  const [{ data: messages }, { data: socials }] = await Promise.all([
    supabase.from("contact_messages").select("id, name, email, message, read, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("social_links").select("*").order("sort_order"),
  ]);
  return (
    <>
      <PageHeader title="Contact" description="Messages from the contact form, and the social links shown on the site. Email and phone live in Profile." />
      <div className="flex flex-col gap-6">
        <Card title="Messages">
          <Inbox initial={(messages as ContactMessage[]) ?? []} />
        </Card>
        <Card title="Social links" description="Drag to reorder.">
          <CollectionEditor
            table="social_links"
            rows={socials ?? []}
            titleKey="label"
            subtitleKeys={["platform", "url"]}
            addLabel="Add link"
            fields={[
              {
                kind: "select",
                name: "platform",
                label: "Platform",
                options: ["LinkedIn", "GitHub", "Instagram", "Facebook", "X", "Behance", "Dribbble", "YouTube", "TikTok", "LINE", "Email", "Other"].map((p) => ({ value: p, label: p })),
              },
              { kind: "text", name: "label", label: "Label", placeholder: "LinkedIn" },
              { kind: "text", name: "url", label: "URL", type: "url", placeholder: "https://" },
            ]}
            defaults={{ platform: "LinkedIn" }}
          />
        </Card>
      </div>
    </>
  );
}
