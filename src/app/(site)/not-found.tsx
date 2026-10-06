import Link from "next/link";
import { getTranslator } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslator();
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-32">
      <span aria-hidden className="stars" />
      <div className="container-x relative">
        <p className="kicker mb-6 text-accent">404</p>
        <h1 className="font-display text-display font-light tracking-tight">{t("notFound.title")}</h1>
        <Link href="/" className="mt-10 inline-flex items-center gap-3 font-display text-sm">
          <span aria-hidden>←</span>
          <span className="link-underline">{t("notFound.back")}</span>
        </Link>
      </div>
    </section>
  );
}
