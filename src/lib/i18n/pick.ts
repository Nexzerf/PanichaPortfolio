import type { Lang } from "../types";

type Bilingual = Record<string, unknown>;

/**
 * Reads `${field}_${lang}` with fallback to the other language,
 * so an untranslated field still shows something sensible.
 */
export function pick(row: Bilingual | null | undefined, field: string, lang: Lang): string {
  if (!row) return "";
  const other: Lang = lang === "th" ? "en" : "th";
  const primary = row[`${field}_${lang}`];
  if (typeof primary === "string" && primary.trim()) return primary;
  const fallback = row[`${field}_${other}`];
  return typeof fallback === "string" ? fallback : "";
}

/** Whether the text shown for `field` in `lang` is a fallback (used for the `lang` attribute). */
export function pickLang(row: Bilingual | null | undefined, field: string, lang: Lang): Lang {
  const primary = row?.[`${field}_${lang}`];
  if (typeof primary === "string" && primary.trim()) return lang;
  return lang === "th" ? "en" : "th";
}

/** Splits a long-form text field into paragraphs. Content is rendered as text, never as HTML. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Lines that start with "-" or "•" become list items. */
export function asList(text: string): string[] | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1 && lines.every((l) => /^[-•*]\s+/.test(l))) {
    return lines.map((l) => l.replace(/^[-•*]\s+/, ""));
  }
  return null;
}
