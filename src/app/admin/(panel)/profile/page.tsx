import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { SingletonForm } from "@/components/admin/SingletonForm";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { supabase } = await requireOwner();
  const [{ data: profile }, { data: skills }] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("skills").select("*").order("sort_order"),
  ]);

  return (
    <>
      <PageHeader title="Profile" description="Your name, bio and hero text across the site." />
      <SingletonForm
        table="profile"
        initial={profile ?? {}}
        groups={[
          {
            title: "Identity",
            columns: 2,
            fields: [
              { kind: "media", name: "photo_url", label: "Profile photo", media: "image", aspect: "aspect-[4/5]" },
              { kind: "media", name: "resume_url", label: "Resume / CV (PDF)", media: "pdf" },
              { kind: "bilingual", name: "full_name", label: "Full name" },
              { kind: "bilingual", name: "nickname", label: "Nickname / brand", hint: "Shown in the navigation." },
              { kind: "bilingual", name: "job_title", label: "Job title", hint: "e.g. Designer, Developer & Creative Technologist" },
              { kind: "bilingual", name: "location", label: "Location" },
            ],
          },
          {
            title: "Home hero",
            fields: [
              { kind: "bilingual", name: "hero_title", label: "Greeting line", hint: "Defaults to “Hi, I’m”." },
              { kind: "bilingual", name: "hero_subtitle", label: "Hero subtitle", multiline: true, rows: 2 },
            ],
          },
          {
            title: "About",
            fields: [
              { kind: "bilingual", name: "short_bio", label: "Short bio", multiline: true, rows: 3 },
              { kind: "bilingual", name: "long_bio", label: "Long bio", multiline: true, rows: 8, hint: "Blank line = new paragraph." },
              { kind: "bilingual", name: "university", label: "Education / university" },
              { kind: "bilingual", name: "interests", label: "Interests", multiline: true, rows: 2 },
            ],
          },
          {
            title: "Contact details",
            columns: 2,
            fields: [
              { kind: "text", name: "email", label: "Email", type: "email" },
              { kind: "text", name: "phone", label: "Phone", type: "tel" },
              { kind: "text", name: "website", label: "Website", type: "url", placeholder: "https://" },
              { kind: "toggle", name: "show_email", label: "Show email publicly" },
              { kind: "toggle", name: "show_phone", label: "Show phone publicly" },
            ],
          },
        ]}
      />
      <Card title="Skills" description="Grouped on the site by their group label (e.g. Development, Design).">
        <CollectionEditor
          table="skills"
          rows={skills ?? []}
          titleKey="name"
          subtitleKeys={["group"]}
          statusField="name"
          addLabel="Add skill"
          fields={[
            { kind: "bilingual", name: "name", label: "Skill" },
            { kind: "bilingual", name: "group", label: "Group" },
          ]}
        />
      </Card>
    </>
  );
}
