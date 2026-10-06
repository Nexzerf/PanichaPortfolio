"use client";
import { useId } from "react";
import { inputCls, TranslationStatus } from "./ui";

type Values = Record<string, unknown>;

/**
 * A Thai + English pair for one field (`${name}_th` / `${name}_en`), written side by side.
 * If one language is left empty, the public site shows the other one instead.
 */
export function BilingualField({
  label,
  name,
  values,
  onChange,
  multiline = false,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  values: Values;
  onChange: (key: string, value: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const id = useId();
  const th = (values[`${name}_th`] as string | null) ?? "";
  const en = (values[`${name}_en`] as string | null) ?? "";

  const Input = multiline ? "textarea" : "input";
  const common = (lang: "th" | "en") => ({
    id: `${id}-${lang}`,
    lang,
    value: lang === "th" ? th : en,
    placeholder: lang === "th" ? "เขียนภาษาไทย" : "Write in English",
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => onChange(`${name}_${lang}`, e.target.value),
    className: `${inputCls} ${multiline ? "resize-y leading-relaxed" : ""}`,
    ...(multiline ? { rows } : {}),
  });

  return (
    <fieldset className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="text-xs font-medium uppercase tracking-wider text-ink-3">{label}</legend>
        <TranslationStatus th={th} en={en} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-th`} className="text-[11px] text-ink-3">🇹🇭 ไทย</label>
          <Input {...common("th")} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-en`} className="text-[11px] text-ink-3">🇬🇧 English</label>
          <Input {...common("en")} />
        </div>
      </div>
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </fieldset>
  );
}
