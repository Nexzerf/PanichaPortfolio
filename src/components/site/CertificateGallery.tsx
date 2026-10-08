"use client";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Media } from "./Media";
import { canOptimizeImage, normalizeImageUrl } from "@/lib/site";
import { pick, pickLang } from "@/lib/i18n/pick";
import type { Certificate, Lang } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export type CertificateLabels = { view: string; pdf: string; verify: string; close: string; prev: string; next: string };

/**
 * Certificates as framed cards (the certificate sits on a dark plate so white paper doesn't glare),
 * opening a large viewer with the full description, PDF and verification links. ← / → / Esc work.
 */
export function CertificateGallery({ items, lang, labels }: { items: Certificate[]; lang: Lang; labels: CertificateLabels }) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (returnFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, items.length]);

  const c = open !== null ? items[open] : null;

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const title = pick(item, "title", lang);
          const meta = [pick(item, "issuer", lang), item.issued].filter(Boolean).join(" · ");
          return (
            <m.li
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, ease: EASE, delay: Math.min(i * 0.06, 0.3) }}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                data-cursor={labels.view}
                className="group flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-line bg-[#070b1f] text-left transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_0_1px_var(--accent),0_30px_70px_-30px_var(--accent)]"
              >
                <div className="relative aspect-[1.414/1] overflow-hidden bg-[radial-gradient(80%_80%_at_50%_30%,#16245e,#060a1c)] p-4">
                  <div className="relative h-full w-full overflow-hidden rounded-md shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)]">
                    <Media
                      src={item.image_url}
                      alt={title}
                      label="✦"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="!object-contain transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {meta && <p className="kicker !tracking-[0.14em]">{meta}</p>}
                  <h3 lang={pickLang(item, "title", lang)} className="font-display text-lg font-medium leading-snug">
                    {title}
                  </h3>
                  {pick(item, "description", lang) && (
                    <p lang={pickLang(item, "description", lang)} className="line-clamp-3 text-sm leading-relaxed text-ink-2">
                      {pick(item, "description", lang)}
                    </p>
                  )}
                </div>
              </button>
            </m.li>
          );
        })}
      </ul>

      <AnimatePresence>
        {c && open !== null && (
          <m.div
            key="cert-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={pick(c, "title", lang)}
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#02040c]/95 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(null)}
              aria-label={labels.close}
              className="fixed right-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-black/60 text-lg sm:right-6 sm:top-6"
            >
              ✕
            </button>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={labels.prev}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open - 1 + items.length) % items.length);
                  }}
                  className="fixed left-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-black/60 hover:border-accent hover:text-accent md:grid lg:left-6"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={labels.next}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + 1) % items.length);
                  }}
                  className="fixed right-2 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-black/60 hover:border-accent hover:text-accent md:grid lg:right-6"
                >
                  →
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <m.div
                key={c.id}
                onClick={(e) => e.stopPropagation()}
                className="my-auto flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="w-full lg:flex-[1.6]">
                  {c.image_url ? (
                    // Served through Next's optimiser (same as the cards); width/height are only hints — CSS keeps the real aspect.
                    <Image
                      src={normalizeImageUrl(c.image_url)}
                      alt={pick(c, "title", lang)}
                      width={1800}
                      height={1273}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      quality={90}
                      unoptimized={!canOptimizeImage(normalizeImageUrl(c.image_url))}
                      className="mx-auto h-auto max-h-[70svh] w-auto max-w-full rounded-lg shadow-[0_0_0_1px_var(--line),0_40px_120px_-40px_var(--accent)]"
                    />
                  ) : null}
                </div>
                <div className="w-full lg:flex-1">
                  {[pick(c, "issuer", lang), c.issued].filter(Boolean).length > 0 && (
                    <p className="kicker mb-3 text-accent">{[pick(c, "issuer", lang), c.issued].filter(Boolean).join(" · ")}</p>
                  )}
                  <h2 lang={pickLang(c, "title", lang)} className="font-display text-[clamp(1.4rem,3vw,2rem)] font-light leading-tight">
                    {pick(c, "title", lang)}
                  </h2>
                  {pick(c, "description", lang) && (
                    <p lang={pickLang(c, "description", lang)} className="mt-4 whitespace-pre-line leading-relaxed text-ink-2">
                      {pick(c, "description", lang)}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {c.file_url && (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 font-display text-sm font-medium leading-none text-white">
                        {labels.pdf} ↗
                      </a>
                    )}
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 font-display text-sm leading-none hover:border-ink">
                        {labels.verify} ↗
                      </a>
                    )}
                    <span className="font-display text-xs tabular-nums text-ink-3">
                      {open + 1} / {items.length}
                    </span>
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
