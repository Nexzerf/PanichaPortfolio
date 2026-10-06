import type { Metadata } from "next";
import { Media } from "@/components/site/Media";
import { ImageReveal, Reveal, RevealText } from "@/components/motion/Reveal";
import { AwardList, SectionHeader, SkillGroups, Timeline } from "@/components/site/Sections";
import { getAwards, getExperiences, getProfile, getSiteSettings, getSkills } from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { paragraphs, pick, pickLang } from "@/lib/i18n/pick";

export async function generateMetadata(): Promise<Metadata> {
  const [{ lang, t }, profile] = await Promise.all([getTranslator(), getProfile()]);
  return {
    title: t("section.about"),
    description: pick(profile, "short_bio", lang) || undefined,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [{ lang, t }, settings, profile, skills, experiences, awards] = await Promise.all([
    getTranslator(),
    getSiteSettings(),
    getProfile(),
    getSkills(),
    getExperiences(),
    getAwards(),
  ]);
  const name = pick(profile, "full_name", lang) || settings.site_name;
  const longBio = pick(profile, "long_bio", lang) || pick(profile, "short_bio", lang);
  const work = experiences.filter((e) => e.kind === "work");
  const education = experiences.filter((e) => e.kind === "education");
  const facts = [
    { label: t("about.location"), value: pick(profile, "location", lang) },
    { label: t("section.education"), value: pick(profile, "university", lang) },
    { label: t("section.interests"), value: pick(profile, "interests", lang) },
  ].filter((f) => f.value);

  return (
    <div className="relative">
      <section className="relative overflow-hidden pb-20 pt-40 md:pt-52">
        <span aria-hidden className="stars opacity-70" />
        <div className="container-x relative grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="kicker mb-6 flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-accent" aria-hidden />
              {pick(profile, "job_title", lang)}
            </Reveal>
            <RevealText as="h1" immediate text={name} className="font-display text-display font-light tracking-tight" />
            {longBio && (
              <Reveal delay={0.3} className="mt-12 flex max-w-2xl flex-col gap-6 text-lead text-ink-2">
                {paragraphs(longBio).map((para, i) => (
                  <p key={i} lang={pickLang(profile, "long_bio", lang)} className="whitespace-pre-line">{para}</p>
                ))}
              </Reveal>
            )}
            {facts.length > 0 && (
              <Reveal delay={0.4}>
                <dl className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="kicker mb-2">{f.label}</dt>
                      <dd className="text-ink-2">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
            {profile?.resume_url && (
              <Reveal delay={0.5} className="mt-12">
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-display text-sm font-medium text-white shadow-[0_0_40px_-8px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {t("about.resume")}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                </a>
              </Reveal>
            )}
          </div>
          <div className="lg:col-span-5">
            <ImageReveal className="aspect-[4/5] w-full rounded-[24px] border border-line" parallax={30}>
              <Media src={profile?.photo_url} alt={name} label={name.charAt(0)} sizes="(min-width: 1024px) 40vw, 100vw" preload />
            </ImageReveal>
          </div>
        </div>
      </section>

      {skills.length > 0 && (
        <section className="section-y" aria-label={t("section.skills")}>
          <div className="container-x">
            <SectionHeader index="01" title={t("section.skills")} />
            <SkillGroups items={skills} lang={lang} />
          </div>
        </section>
      )}

      {work.length > 0 && (
        <section id="experience" className="section-y" aria-label={t("section.experience")}>
          <div className="container-x">
            <SectionHeader index="02" title={t("section.experience")} />
            <Timeline items={work} lang={lang} />
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="section-y" aria-label={t("section.education")}>
          <div className="container-x">
            <SectionHeader index="03" title={t("section.education")} />
            <Timeline items={education} lang={lang} />
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section className="section-y" aria-label={t("section.awards")}>
          <div className="container-x">
            <SectionHeader index="04" title={t("section.awards")} />
            <AwardList items={awards} lang={lang} />
          </div>
        </section>
      )}
    </div>
  );
}
