"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "../Logo";
import type { Lang } from "@/lib/types";

type NavItem = { href: string; section: string; label: string };

export function Nav({
  brand,
  items,
  lang,
  labels,
}: {
  brand: string;
  items: NavItem[];
  lang: Lang;
  labels: { menu: string; close: string; lang: string; skip: string };
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section indicator on the home page.
  useEffect(() => {
    if (pathname !== "/") return;
    const els = items
      .map((i) => document.getElementById(i.section))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      setActiveSection(null);
    };
  }, [pathname, items]);

  // Close the mobile menu after navigation (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Home: highlight the section in view. Other pages: only real page links (/work, /about) can be active —
  // anchor links like "/#contact" point back to home, so they never match another page.
  const isActive = (item: NavItem) =>
    pathname === "/"
      ? activeSection === item.section
      : !item.href.includes("#") && (pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {labels.skip}
      </a>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          aria-label="Primary"
          className={`relative mx-auto flex h-14 max-w-[var(--container)] items-center justify-between rounded-full border px-3 pl-5 transition-[background-color,border-color,box-shadow] duration-500 sm:h-[60px] ${
            scrolled
              ? "border-line bg-[#070b1f]/95 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.9)]"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="group flex h-10 items-center gap-2.5 font-display text-sm font-medium leading-none tracking-wide">
            <Logo size={30} className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:-rotate-6 group-hover:scale-110" />
            <span>{brand}</span>
          </Link>

          <ul className="hidden items-center gap-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
            {items.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative z-10 inline-flex h-9 items-center rounded-full px-4 font-display text-sm leading-none transition-colors duration-300 ${
                      active ? "text-ink" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {active && (
                    <m.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-line-strong bg-white/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} label={labels.lang} className="hidden sm:flex" />
            <Link
              href="/#contact"
              className="hidden h-10 items-center rounded-full bg-accent px-5 font-display text-sm font-medium leading-none text-white shadow-[0_0_30px_-6px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex"
            >
              {items.find((i) => i.section === "contact")?.label}
            </Link>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-line md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? labels.close : labels.menu}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-4" aria-hidden>
                <span
                  className={`absolute left-0 top-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-4 bg-ink transition-transform duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            className="fixed inset-0 z-40 flex flex-col bg-[#040714] px-6 pb-10 pt-28 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span aria-hidden className="stars" />
            <ul className="relative flex flex-col gap-2">
              {items.map((item, i) => (
                <m.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-line py-4 font-display text-4xl font-light"
                  >
                    <span className="font-sans text-xs text-ink-3">0{i + 1}</span>
                    {item.label}
                  </Link>
                </m.li>
              ))}
            </ul>
            <div className="relative mt-auto flex items-center justify-between">
              <LangSwitch lang={lang} label={labels.lang} />
              <span className="kicker flex items-center gap-2"><Logo size={20} />{brand}</span>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
