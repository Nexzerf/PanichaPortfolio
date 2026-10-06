import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy, relatedProjects } from "@/components/site/CaseStudy";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [project, { lang }] = await Promise.all([getProjectBySlug(slug), getTranslator()]);
  if (!project) return {};
  const title = pick(project, "seo_title", lang) || pick(project, "title", lang);
  const description = pick(project, "seo_description", lang) || pick(project, "short", lang);
  const image = project.og_image_url ?? project.thumbnail_url ?? project.hero_url;
  return {
    title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/work/${project.slug}`,
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
      publishedTime: project.published_at ?? undefined,
      modifiedTime: project.updated_at,
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const [project, all, { lang, t }] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
    getTranslator(),
  ]);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pick(project, "title", lang),
    description: pick(project, "short", lang),
    dateCreated: project.year ? String(project.year) : undefined,
    image: project.thumbnail_url ?? undefined,
    keywords: project.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <CaseStudy project={project} related={relatedProjects(project, all)} lang={lang} t={t} />
    </>
  );
}
