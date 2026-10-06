import Link from "next/link";
import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { supabase } = await requireOwner();
  const [{ data: projects }, { count: categories }, { count: unread }] = await Promise.all([
    supabase.from("projects").select("id, slug, title_th, title_en, status, featured, updated_at").order("updated_at", { ascending: false }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
  ]);
  const all = projects ?? [];
  const stats = [
    { label: "Total Projects", value: all.length, href: "/admin/projects" },
    { label: "Published", value: all.filter((p) => p.status === "published").length, href: "/admin/projects?status=published" },
    { label: "Drafts", value: all.filter((p) => p.status === "draft").length, href: "/admin/projects?status=draft" },
    { label: "Featured", value: all.filter((p) => p.featured).length, href: "/admin/projects" },
    { label: "Categories", value: categories ?? 0, href: "/admin/categories" },
    { label: "Unread messages", value: unread ?? 0, href: "/admin/contact" },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Everything here updates the public portfolio as soon as you save."
        actions={
          <Link href="/admin/projects/new" className="rounded-full bg-accent px-4 py-2 font-display text-sm text-white">
            + New project
          </Link>
        }
      />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-[#070b1f] p-4 transition-colors hover:border-line-strong">
            <p className="font-display text-3xl font-light">{s.value}</p>
            <p className="mt-1 text-xs text-ink-3">{s.label}</p>
          </Link>
        ))}
      </div>
      <Card title="Recent updates">
        {all.length === 0 ? (
          <p className="text-sm text-ink-3">No projects yet. Create your first one.</p>
        ) : (
          <ul className="divide-y divide-line">
            {all.slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <Link href={`/admin/projects/${p.id}`} className="truncate hover:text-accent">
                  {p.title_th || p.title_en || p.slug}
                </Link>
                <span className="flex shrink-0 items-center gap-3 text-xs text-ink-3">
                  <span className="capitalize">{p.status}</span>
                  <time dateTime={p.updated_at}>{new Date(p.updated_at).toLocaleDateString("en-GB", { timeZone: "Asia/Bangkok" })}</time>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
