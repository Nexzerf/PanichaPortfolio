import type { Metadata } from "next";
import { ContactSection } from "@/components/site/ContactSection";
import { getProfile, getSiteSettings, getSocialLinks } from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { contactLabels } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/pick";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("nav.contact"), alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const [{ lang, t }, settings, profile, socials] = await Promise.all([
    getTranslator(),
    getSiteSettings(),
    getProfile(),
    getSocialLinks(),
  ]);
  return (
    <div className="pt-24">
      <ContactSection
        heading={pick(settings, "contact_heading", lang) || t("section.contact")}
        text={pick(settings, "contact_text", lang)}
        email={profile?.email ?? null}
        phone={profile?.phone ?? null}
        socials={socials}
        labels={contactLabels(t)}
      />
    </div>
  );
}
