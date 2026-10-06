"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLanguage } from "@/app/(site)/actions";
import type { Lang } from "@/lib/types";

export function LangSwitch({ lang, label, className = "" }: { lang: Lang; label: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (next: Lang) => {
    if (next === lang) return;
    start(async () => {
      await setLanguage(next);
      router.refresh();
    });
  };
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center gap-1 font-display text-xs tracking-[0.16em] ${pending ? "opacity-60" : ""} ${className}`}
    >
      {(["th", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="leading-none text-ink-3">|</span>}
          <button
            type="button"
            onClick={() => choose(l)}
            aria-pressed={lang === l}
            lang={l}
            className={`inline-flex h-7 items-center rounded px-1.5 uppercase leading-none transition-colors duration-200 ${
              lang === l ? "text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {l === "th" ? "TH" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}
