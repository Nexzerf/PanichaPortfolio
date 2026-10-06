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
          {i > 0 && <span aria-hidden className="text-ink-3">|</span>}
          <button
            type="button"
            onClick={() => choose(l)}
            aria-pressed={lang === l}
            lang={l}
            className={`rounded px-1.5 py-1 uppercase transition-colors duration-200 ${
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
