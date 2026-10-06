import Link from "next/link";
import { ImageReveal, Reveal, RevealText } from "../motion/Reveal";
import { Media } from "./Media";
import { asList, paragraphs, pick, pickLang } from "@/lib/i18n/pick";
import type { Translator } from "@/lib/i18n/dictionary";
import { isVideoFile, videoEmbed } from "@/lib/site";
import { isVerticalVideo, VideoPlayer } from "./VideoPlayer";
import { CASE_SECTIONS, type Lang, type ProjectWithRelations } from "@/lib/types";

/** Case-study layout used by /work/[slug] and the admin preview. Empty sections are skipped. */
export function CaseStudy({
  project: p,
  related,
  lang,
  t,
}: {
  project: ProjectWithRelations;
  related: ProjectWithRelations[];
  lang: Lang;
  t: Translator;
}) {
  const title = pick(p, "title", lang);
  const short = pick(p, "short", lang);
  const role = pick(p, "role", lang);
  const awards = pick(p, "awards", lang);
  const sections = CASE_SECTIONS.map((key) => ({ key, text: pick(p, key, lang), lang: pickLang(p, key, lang) })).filter(
    (s) => s.text.trim(),
  );
  const hero = p.hero_url ?? p.thumbnail_url;
  const images = p.images.filter((m) => m.kind !== "video");
  const videos = [
    ...(p.video_url && (videoEmbed(p.video_url) || isVideoFile(p.video_url))
      ? [{ key: "main", url: p.video_url, title, caption: "", width: null, height: null }]
      : []),
    ...p.images
      .filter((m) => m.kind === "video" && (videoEmbed(m.url) || isVideoFile(m.url)))
      .map((m, i) => ({
        key: m.id,
        url: m.url,
        title: pick(m, "alt", lang) || `${title} — video ${i + 1}`,
        caption: pick(m, "alt", lang),
        width: m.width,
        height: m.height,
      })),
  ].map((v) => ({ ...v, vertical: isVerticalVideo(v.url, v.width, v.height) }));
  const links = [
    p.demo_url && { href: p.demo_url, label: t("project.demo") },
    p.github_url && { href: p.github_url, label: t("project.github") },
    p.external_url && { href: p.external_url, label: t("project.external") },
  ].filter(Boolean) as { href: string; label: string }[];

  const facts = [
    { label: t("project.year"), value: p.year ? String(p.year) : "" },
    { label: t("project.role"), value: role },
    { label: t("project.team"), value: p.team_size ? `${p.team_size} ${t("project.people")}` : "" },
    { label: t("project.category"), value: p.categories.map((c) => pick(c, "name", lang)).join(", ") },
  ].filter((f) => f.value);

  return (
    <article className="relative">
      {/* Title block */}
      <header className="relative overflow-hidden pb-16 pt-40 md:pt-52">
        <span aria-hidden className="stars opacity-70" />
        <div className="container-x relative">
          <Reveal className="mb-10">
            <Link href="/work" className="kicker link-underline hover:text-ink">
              ← {t("project.back")}
            </Link>
          </Reveal>
          <RevealText
            as="h1"
            immediate
            text={title}
            className="max-w-5xl font-display text-display font-light tracking-tight"
          />
          {short && (
            <Reveal delay={0.3}>
              <p lang={pickLang(p, "short", lang)} className="mt-8 max-w-2xl font-serif text-[clamp(1.4rem,2.6vw,2.2rem)] italic leading-snug text-ink-2">
                {short}
              </p>
            </Reveal>
          )}
          {facts.length > 0 && (
            <Reveal delay={0.4}>
              <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-line pt-8 md:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="kicker mb-2">{f.label}</dt>
                    <dd className="text-ink-2">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </header>

      {/* Hero image */}
      <div className="container-x">
        <ImageReveal className="aspect-[16/10] w-full rounded-[24px] border border-line bg-surface md:aspect-[16/8]" parallax={60}>
          <Media src={hero} alt={title} label={title} sizes="(min-width: 1280px) 1200px, 100vw" preload />
        </ImageReveal>
      </div>

      {/* Story */}
      {sections.length > 0 && (
        <div className="container-x section-y flex flex-col gap-20 md:gap-28">
          {sections.map((s, i) => {
            const list = asList(s.text);
            return (
              <section key={s.key} className="grid gap-6 md:grid-cols-12" aria-labelledby={`cs-${s.key}`}>
                <Reveal className="md:col-span-4">
                  <p className="kicker mb-3 text-accent">{String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`cs-${s.key}`} className="font-display text-h3 font-light">
                    {t(`project.${s.key}` as Parameters<Translator>[0])}
                  </h2>
                </Reveal>
                <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
                  {list ? (
                    <ul lang={s.lang} className="flex flex-col divide-y divide-line border-y border-line">
                      {list.map((item, k) => (
                        <li key={k} className="flex gap-5 py-4 text-lead text-ink-2">
                          <span aria-hidden className="pt-1 font-display text-xs text-ink-3">{String(k + 1).padStart(2, "0")}</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div lang={s.lang} className="flex flex-col gap-5 text-lead text-ink-2">
                      {paragraphs(s.text).map((para, k) => (
                        <p key={k} className="whitespace-pre-line">{para}</p>
                      ))}
                    </div>
                  )}
                </Reveal>
              </section>
            );
          })}

          {p.tools.length > 0 && (
            <section className="grid gap-6 md:grid-cols-12" aria-labelledby="cs-tech">
              <Reveal className="md:col-span-4">
                <h2 id="cs-tech" className="font-display text-h3 font-light">{t("project.technology")}</h2>
              </Reveal>
              <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
                <ul className="flex flex-wrap gap-2">
                  {p.tools.map((tool) => (
                    <li key={tool} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-2">{tool}</li>
                  ))}
                </ul>
              </Reveal>
            </section>
          )}

          {awards && (
            <section className="grid gap-6 md:grid-cols-12" aria-labelledby="cs-awards">
              <Reveal className="md:col-span-4">
                <h2 id="cs-awards" className="font-display text-h3 font-light">{t("project.awards")}</h2>
              </Reveal>
              <Reveal className="md:col-span-7 md:col-start-6 whitespace-pre-line text-lead text-ink-2" delay={0.08}>
                <p lang={pickLang(p, "awards", lang)}>{awards}</p>
              </Reveal>
            </section>
          )}
        </div>
      )}

      {/* Videos: the main video plus any video items in the gallery */}
      {videos.length > 0 && (
        <section aria-labelledby="cs-video" className="container-x pb-24">
          <Reveal>
            <h2 id="cs-video" className="kicker mb-6">{t("project.video")}</h2>
          </Reveal>
          <div className={`grid gap-6 ${videos.length > 1 && videos.every((v) => v.vertical) ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
            {videos.map((v, i) => (
              <Reveal key={v.key} delay={Math.min(i * 0.06, 0.3)}>
                <VideoPlayer url={v.url} title={v.title} width={v.width} height={v.height} />
                {v.caption && <p className="mt-3 text-sm text-ink-3">{v.caption}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Image gallery: alternating full / paired rhythm */}
      {images.length > 0 && (
        <section aria-label={t("project.gallery")} className="container-x pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            {images.map((img, i) => {
              const wide = i % 3 === 0;
              const alt = pick(img, "alt", lang) || `${title} — ${i + 1}`;
              return (
                <ImageReveal
                  key={img.id}
                  parallax={20}
                  className={`${wide ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/5]"} w-full rounded-[20px] border border-line bg-surface`}
                >
                  <Media src={img.url} alt={alt} sizes={wide ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"} />
                </ImageReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Links */}
      {links.length > 0 && (
        <section aria-labelledby="cs-links" className="container-x pb-24">
          <Reveal className="border-t border-line pt-10">
            <h2 id="cs-links" className="kicker mb-6">{t("project.links")}</h2>
            <ul className="flex flex-wrap gap-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full border border-line-strong px-6 py-3 font-display text-sm transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white"
                  >
                    {l.label}
                    <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="cs-related" className="border-t border-line">
          <div className="container-x section-y">
            <h2 id="cs-related" className="kicker mb-12">{t("project.related")}</h2>
            <ul className="grid gap-10 md:grid-cols-3">
              {related.map((r, i) => {
                const rt = pick(r, "title", lang);
                return (
                  <Reveal as="li" key={r.id} delay={i * 0.08}>
                    <Link href={`/work/${r.slug}`} data-cursor={t("work.viewProject")} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-line bg-surface">
                        <Media
                          src={r.thumbnail_url ?? r.hero_url}
                          alt={rt}
                          label={rt}
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.05]"
                        />
                      </div>
                      <p className="mt-4 font-display text-xl font-light transition-transform duration-500 group-hover:translate-x-1">{rt}</p>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

/** Related = most shared categories, then the next projects in order. */
export function relatedProjects(project: ProjectWithRelations, all: ProjectWithRelations[], n = 3) {
  const mine = new Set(project.categories.map((c) => c.id));
  return all
    .filter((p) => p.id !== project.id)
    .map((p, i) => ({ p, score: p.categories.filter((c) => mine.has(c.id)).length * 100 - i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}
