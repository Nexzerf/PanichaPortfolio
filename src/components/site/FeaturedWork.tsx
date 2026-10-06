import Link from "next/link";
import { ImageReveal, Reveal } from "../motion/Reveal";
import { Media } from "./Media";
import { pick, pickLang } from "@/lib/i18n/pick";
import type { Lang, ProjectWithRelations } from "@/lib/types";

/**
 * Editorial list of featured projects. The layout cycles through three
 * compositions — full-bleed, image-left, image-right — to give the page rhythm.
 */
export function FeaturedWork({
  projects,
  lang,
  viewLabel,
}: {
  projects: ProjectWithRelations[];
  lang: Lang;
  viewLabel: string;
}) {
  return (
    <ol className="flex flex-col gap-[clamp(6rem,14vw,12rem)]">
      {projects.map((p, i) => {
        const title = pick(p, "title", lang);
        const short = pick(p, "short", lang);
        const cats = p.categories.map((c) => pick(c, "name", lang)).join(" · ");
        const variant = i % 3;
        const number = String(i + 1).padStart(2, "0");

        const meta = (
          <div className="flex flex-col gap-5">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-sm text-accent">{number}</span>
              <span className="kicker">{[cats, p.year].filter(Boolean).join(" — ")}</span>
            </div>
            <h3
              lang={pickLang(p, "title", lang)}
              className="font-display text-h2 font-light tracking-tight transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-2"
            >
              {title}
            </h3>
            {short && (
              <p lang={pickLang(p, "short", lang)} className="max-w-md text-lead text-ink-2">
                {short}
              </p>
            )}
            <span className="mt-2 inline-flex items-center gap-3 font-display text-sm text-ink">
              <span className="link-underline">{viewLabel}</span>
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        );

        const image = (aspect: string, sizes: string) => (
          <ImageReveal className={`${aspect} w-full rounded-[24px] border border-line bg-surface`}>
            <Media
              src={p.thumbnail_url ?? p.hero_url}
              alt={title}
              label={title}
              sizes={sizes}
              className="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            />
          </ImageReveal>
        );

        return (
          <li key={p.id}>
            <Link
              href={`/work/${p.slug}`}
              data-cursor={viewLabel}
              className="group block focus-visible:outline-offset-8"
              aria-label={`${title}${short ? ` — ${short}` : ""}`}
            >
              {variant === 0 && (
                <div className="flex flex-col gap-10">
                  {image("aspect-[16/10] md:aspect-[16/8]", "(min-width: 1280px) 1200px, 100vw")}
                  <Reveal className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">{meta}</Reveal>
                </div>
              )}
              {variant === 1 && (
                <div className="grid items-center gap-10 md:grid-cols-12">
                  <div className="md:col-span-7">{image("aspect-[4/3]", "(min-width: 768px) 60vw, 100vw")}</div>
                  <Reveal className="md:col-span-5 md:pl-6" delay={0.1}>
                    {meta}
                  </Reveal>
                </div>
              )}
              {variant === 2 && (
                <div className="grid items-center gap-10 md:grid-cols-12">
                  <Reveal className="order-2 md:order-1 md:col-span-5 md:pr-6" delay={0.1}>
                    {meta}
                  </Reveal>
                  <div className="order-1 md:order-2 md:col-span-6 md:col-start-7 md:mt-24">
                    {image("aspect-[4/5]", "(min-width: 768px) 50vw, 100vw")}
                  </div>
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
