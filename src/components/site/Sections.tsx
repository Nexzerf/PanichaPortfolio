import { Reveal, RevealText } from "../motion/Reveal";
import { pick, pickLang } from "@/lib/i18n/pick";
import type { Award, Experience, Lang, Skill } from "@/lib/types";

export function SectionHeader({
  index,
  kicker,
  title,
  aside,
}: {
  index?: string;
  kicker?: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="mb-16 flex flex-col gap-6 border-b border-line pb-8 md:mb-24 md:flex-row md:items-end md:justify-between">
      <div>
        {(index || kicker) && (
          <Reveal className="kicker mb-5 flex items-center gap-3">
            {index && <span className="text-accent">{index}</span>}
            {kicker && <span>{kicker}</span>}
          </Reveal>
        )}
        <RevealText as="h2" text={title} className="font-display text-h1 font-light tracking-tight" />
      </div>
      {aside && <Reveal delay={0.15}>{aside}</Reveal>}
    </header>
  );
}

/** Minimal timeline with glowing nodes on a hairline. */
export function Timeline({ items, lang }: { items: Experience[]; lang: Lang }) {
  return (
    <ol className="relative ml-1.5 border-l border-line">
      {items.map((e, i) => (
        <Reveal as="li" key={e.id} delay={Math.min(i * 0.05, 0.3)} className="relative pb-14 pl-8 last:pb-0 md:pl-14">
          <span
            aria-hidden
            className="absolute -left-[5px] top-2 size-[9px] rounded-full bg-accent shadow-[0_0_0_4px_var(--accent-soft),0_0_18px_2px_var(--accent)]"
          />
          <div className="grid gap-3 md:grid-cols-[180px_1fr] md:gap-10">
            <p className="kicker pt-1.5">{e.period}</p>
            <div>
              <h3 lang={pickLang(e, "title", lang)} className="font-display text-h3 font-light">
                {pick(e, "title", lang)}
              </h3>
              <p className="mt-1 text-ink-2">
                {[pick(e, "org", lang), pick(e, "location", lang)].filter(Boolean).join(" · ")}
              </p>
              {pick(e, "description", lang) && (
                <p lang={pickLang(e, "description", lang)} className="mt-4 max-w-2xl whitespace-pre-line text-ink-3">
                  {pick(e, "description", lang)}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

export function AwardList({ items, lang }: { items: Award[]; lang: Lang }) {
  return (
    <ul className="border-t border-line">
      {items.map((a, i) => (
        <Reveal
          as="li"
          key={a.id}
          delay={Math.min(i * 0.05, 0.3)}
          className="group grid gap-2 border-b border-line py-7 transition-colors duration-500 hover:bg-white/[0.02] md:grid-cols-[100px_1fr_1fr] md:items-baseline md:gap-8 md:px-4"
        >
          <span className="font-display text-sm text-accent">{a.year}</span>
          <h3 lang={pickLang(a, "title", lang)} className="font-display text-xl font-light transition-transform duration-500 group-hover:translate-x-1.5">
            {pick(a, "title", lang)}
          </h3>
          <div className="text-ink-3">
            <p className="text-ink-2">{pick(a, "issuer", lang)}</p>
            {pick(a, "description", lang) && <p className="mt-1 text-sm">{pick(a, "description", lang)}</p>}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/** Skills grouped by their group label, rendered as quiet text chips. */
export function SkillGroups({ items, lang }: { items: Skill[]; lang: Lang }) {
  const groups = new Map<string, Skill[]>();
  for (const s of items) {
    const g = pick(s, "group", lang) || "—";
    groups.set(g, [...(groups.get(g) ?? []), s]);
  }
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {[...groups.entries()].map(([group, skills], i) => (
        <Reveal key={group} delay={i * 0.06}>
          <h3 className="kicker mb-4">{group}</h3>
          <ul className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <li
                key={s.id}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-2 transition-colors duration-300 hover:border-accent hover:text-ink"
              >
                {pick(s, "name", lang)}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
