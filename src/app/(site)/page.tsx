import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { FeaturedWork } from "@/components/site/FeaturedWork";
import { AwardList, SectionHeader, SkillGroups, Timeline } from "@/components/site/Sections";
import { ContactSection } from "@/components/site/ContactSection";
import { Media } from "@/components/site/Media";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { WorkExplorer } from "@/components/site/WorkExplorer";
import {
  getAwards,
  getCertificates,
  getCategories,
  getExperiences,
  getProfile,
  getPublishedProjects,
  getSiteSettings,
  getSkills,
  getSocialLinks,
} from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { certificateLabels, contactLabels, workLabels } from "@/lib/i18n/dictionary";
import { CertificateGallery } from "@/components/site/CertificateGallery";
import { pick } from "@/lib/i18n/pick";

export default async function HomePage() {
  const [{ lang, t }, settings, profile, projects, categories, skills, experiences, awards, certificates, socials] =
    await Promise.all([
      getTranslator(),
      getSiteSettings(),
      getProfile(),
      getPublishedProjects(),
      getCategories(),
      getSkills(),
      getExperiences(),
      getAwards(),
      getCertificates(),
      getSocialLinks(),
    ]);

  const name = pick(profile, "full_name", lang) || settings.site_name;
  const featured = projects.filter((p) => p.featured);
  const selected = featured.length ? featured : projects.slice(0, 3);
  const work = experiences.filter((e) => e.kind === "work");
  const education = experiences.filter((e) => e.kind === "education");

  return (
    <>
      <Hero
        greeting={pick(profile, "hero_title", lang) || t("hero.greeting")}
        name={name}
        title={pick(profile, "job_title", lang)}
        subtitle={pick(profile, "hero_subtitle", lang)}
        photo={profile?.photo_url ?? null}
        location={pick(profile, "location", lang)}
        labels={{ viewWork: t("hero.viewWork"), contact: t("hero.contact"), scroll: t("hero.scroll") }}
      />

      {selected.length > 0 && (
        <section id="work" aria-label={t("section.selectedWork")} className="section-y">
          <div className="container-x">
            <SectionHeader
              index="01"
              kicker={t("section.selectedWork.kicker")}
              title={t("section.selectedWork")}
              aside={
                <Link href="/work" className="kicker link-underline hover:text-ink">
                  {t("work.viewAll")} ({projects.length}) →
                </Link>
              }
            />
            <FeaturedWork projects={selected} lang={lang} viewLabel={t("work.viewProject")} />
          </div>
        </section>
      )}

      <section id="about" aria-label={t("section.about")} className="section-y">
        <div className="container-x">
          <SectionHeader index="02" kicker={t("nav.about")} title={t("section.about")} />
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ImageReveal className="aspect-[4/5] w-full max-w-md rounded-[24px] border border-line" parallax={30}>
                <Media src={profile?.photo_url} alt={name} label={name.charAt(0)} sizes="(min-width: 1024px) 40vw, 100vw" />
              </ImageReveal>
            </div>
            <div className="flex flex-col gap-14 lg:col-span-7">
              <Reveal>
                <p className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-light leading-snug">
                  {pick(profile, "short_bio", lang)}
                </p>
                <Link href="/about" className="mt-8 inline-flex items-center gap-3 font-display text-sm">
                  <span className="link-underline">{t("about.readMore")}</span>
                  <span aria-hidden>→</span>
                </Link>
              </Reveal>
              {skills.length > 0 && (
                <div>
                  <Reveal className="kicker mb-8">{t("section.skills")}</Reveal>
                  <SkillGroups items={skills} lang={lang} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {(work.length > 0 || education.length > 0) && (
        <section id="experience" aria-label={t("section.experience")} className="section-y">
          <div className="container-x">
            <SectionHeader index="03" kicker={t("nav.experience")} title={t("section.experience")} />
            <div className="grid gap-20 lg:grid-cols-2 lg:gap-16">
              {work.length > 0 && <Timeline items={work} lang={lang} />}
              {education.length > 0 && (
                <div>
                  <Reveal className="kicker mb-10">{t("section.education")}</Reveal>
                  <Timeline items={education} lang={lang} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section id="awards" aria-label={t("section.awards")} className="section-y">
          <div className="container-x">
            <SectionHeader index="04" kicker="Recognition" title={t("section.awards")} />
            <AwardList items={awards} lang={lang} />
          </div>
        </section>
      )}

      {certificates.length > 0 && (
        <section id="certificates" aria-label={t("section.certificates")} className="section-y">
          <div className="container-x">
            <SectionHeader index="05" kicker="Certificates" title={t("section.certificates")} />
            <CertificateGallery items={certificates} lang={lang} labels={certificateLabels(t)} />
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="all-work" aria-label={t("section.allWork")} className="section-y">
          <div className="container-x">
            <SectionHeader index="06" kicker="Archive" title={t("section.allWork")} />
            <WorkExplorer
              projects={projects}
              categories={categories}
              lang={lang}
              labels={workLabels(t)}
            />
          </div>
        </section>
      )}

      <ContactSection
        heading={pick(settings, "contact_heading", lang) || t("section.contact")}
        text={pick(settings, "contact_text", lang)}
        email={profile?.email ?? null}
        phone={profile?.phone ?? null}
        socials={socials}
        labels={contactLabels(t)}
      />
    </>
  );
}
