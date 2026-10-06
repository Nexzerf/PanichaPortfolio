import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Lang } from "../types";
import { dictionary, type DictKey, type Translator } from "./dictionary";
import { getSiteSettings, getUiOverrides } from "../data";

export const LANG_COOKIE = "lang";

export const getLang = cache(async (): Promise<Lang> => {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  if (value === "th" || value === "en") return value;
  return (await getSiteSettings()).default_lang;
});

export const getTranslator = cache(async (): Promise<{ lang: Lang; t: Translator }> => {
  const [lang, overrides] = await Promise.all([getLang(), getUiOverrides()]);
  const t: Translator = (key: DictKey) =>
    overrides[key]?.[lang] || dictionary[key]?.[lang] || dictionary[key]?.en || key;
  return { lang, t };
});
