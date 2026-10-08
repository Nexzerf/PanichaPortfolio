import type { Metadata } from "next";
import { WorkExplorer } from "@/components/site/WorkExplorer";
import { Reveal, RevealText } from "@/components/motion/Reveal";
import { getCategories, getPublishedProjects } from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { workLabels } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("section.allWork"), alternates: { canonical: "/work" } };
}

export default async function WorkPage(props: PageProps<"/work">) {
  const { category } = await props.searchParams;
  const [{ lang, t }, projects, categories] = await Promise.all([
    getTranslator(),
    getPublishedProjects(),
    getCategories(),
  ]);

  return (
    <div className="relative pb-32 pt-40 md:pt-48">
      <span aria-hidden className="stars opacity-60" />
      <div className="container-x relative">
        <header className="mb-16 border-b border-line pb-10 md:mb-24">
          <Reveal className="kicker mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-accent" aria-hidden />
            {projects.length} {t("work.count")}
          </Reveal>
          <RevealText as="h1" immediate text={t("section.allWork")} className="font-display text-display font-light tracking-tight" />
        </header>
        <WorkExplorer
          projects={projects}
          categories={categories}
          lang={lang}
          syncUrl
          initialCategory={typeof category === "string" ? category : "all"}
          labels={workLabels(t)}
        />
      </div>
    </div>
  );
}
