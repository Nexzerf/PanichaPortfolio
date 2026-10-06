import Link from "next/link";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "../Logo";
import type { Lang, SocialLink } from "@/lib/types";

export function Footer({
  name,
  note,
  socials,
  lang,
  labels,
}: {
  name: string;
  note: string;
  socials: SocialLink[];
  lang: Lang;
  labels: { rights: string; top: string; lang: string };
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="container-x flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="flex items-center gap-3 font-display text-2xl font-light"><Logo size={36} />{name}</p>
          {note && <p className="max-w-sm text-sm text-ink-3">{note}</p>}
          <p className="text-xs text-ink-3">
            © {year} {name}. {labels.rights}
          </p>
        </div>
        <div className="flex flex-col gap-6 md:items-end">
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-ink">
                    {s.label || s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-6">
            <LangSwitch lang={lang} label={labels.lang} />
            <Link href="#main" className="kicker link-underline hover:text-ink">
              {labels.top} ↑
            </Link>
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[18vw] font-semibold leading-[0.8] tracking-tight text-white/[0.03]"
      >
        {name}
      </p>
    </footer>
  );
}
