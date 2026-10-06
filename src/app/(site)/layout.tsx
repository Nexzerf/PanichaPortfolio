import { MotionProvider } from "@/components/motion/MotionProvider";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CursorFollower } from "@/components/site/CursorFollower";
import { getProfile, getSiteSettings, getSocialLinks } from "@/lib/data";
import { getTranslator } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/pick";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ lang, t }, settings, profile, socials] = await Promise.all([
    getTranslator(),
    getSiteSettings(),
    getProfile(),
    getSocialLinks(),
  ]);
  const name = pick(profile, "full_name", lang) || settings.site_name;
  const brand = pick(profile, "nickname", lang) || settings.site_name;

  return (
    <MotionProvider>
      <Nav
        brand={brand}
        lang={lang}
        items={[
          { href: "/work", section: "work", label: t("nav.work") },
          { href: "/about", section: "about", label: t("nav.about") },
          { href: "/#experience", section: "experience", label: t("nav.experience") },
          { href: "/#contact", section: "contact", label: t("nav.contact") },
        ]}
        labels={{ menu: t("nav.menu"), close: t("nav.close"), lang: t("lang.switch"), skip: t("nav.skip") }}
      />
      <main id="main" tabIndex={-1} className="relative outline-none">
        {children}
      </main>
      <Footer
        name={name}
        note={pick(settings, "footer_note", lang)}
        socials={socials}
        lang={lang}
        labels={{ rights: t("footer.rights"), top: t("footer.top"), lang: t("lang.switch") }}
      />
      <CursorFollower />
    </MotionProvider>
  );
}
