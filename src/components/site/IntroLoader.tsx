"use client";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logo } from "../Logo";
import { SEEN_KEY } from "@/lib/intro";

const EASE = [0.16, 1, 0.3, 1] as const;


/** True once the intro has finished (or was skipped), so the hero can start its own entrance. */
const IntroReady = createContext(true);
export const useIntroReady = () => useContext(IntroReady);

/**
 * Opening animation shown once per browser session: the logo glows in, the name reveals
 * letter by letter over a thin progress line, then the screen lifts away like a curtain.
 * A tiny inline script marks repeat visits before first paint so the overlay never flashes,
 * and a CSS fallback hides it even if JavaScript never runs.
 */
export function IntroProvider({ brand, children }: { brand: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    const finish = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Private mode: the intro will simply play again next time.
      }
      setShow(false);
    };
    if (seen) {
      const t = setTimeout(() => {
        setShow(false);
        setReady(true);
      }, 0);
      return () => clearTimeout(t);
    }
    // Hold for the animation, and also until fonts are in so the hero never reflows behind the curtain.
    const minTime = new Promise((r) => setTimeout(r, reduce ? 500 : 2000));
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]);
    let cancelled = false;
    Promise.all([minTime, fonts]).then(() => !cancelled && finish());
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
  }, [show]);

  const letters = Array.from(brand);

  return (
    <IntroReady.Provider value={ready}>
      {children}
      <AnimatePresence onExitComplete={() => setReady(true)}>
        {show && (
          <m.div
            key="intro"
            id="intro-loader"
            role="status"
            aria-label={brand}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            style={{
              background:
                "radial-gradient(90% 60% at 50% 0%, color-mix(in oklab, var(--accent) 22%, #0c1a4f) 0%, transparent 65%), linear-gradient(180deg, #0c1a4f 0%, #050816 60%, #020308 100%)",
            }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            initial={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: reduce ? 0.3 : 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <span aria-hidden className="stars opacity-80" />

            {/* Logo with a breathing glow */}
            <m.div
              className="relative"
              initial={{ opacity: 0, scale: 0.7, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.08, y: -24 }}
              transition={{ duration: reduce ? 0.2 : 1, ease: EASE }}
            >
              <m.span
                aria-hidden
                className="absolute inset-[-60%] rounded-full blur-2xl"
                style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
                initial={{ opacity: 0 }}
                animate={reduce ? { opacity: 0.35 } : { opacity: [0.15, 0.5, 0.3] }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
              <Logo size={88} className="relative" alt="" />
            </m.div>

            {/* Name, letter by letter */}
            <p aria-hidden className="relative mt-8 flex overflow-hidden font-display text-sm uppercase tracking-[0.42em] text-ink/90 sm:text-base">
              {letters.map((ch, i) => (
                <m.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.35 + i * 0.035 }}
                >
                  {ch === " " ? " " : ch}
                </m.span>
              ))}
            </p>

            {/* Progress hairline */}
            <div aria-hidden className="relative mt-8 h-px w-40 overflow-hidden bg-white/10 sm:w-56">
              <m.span
                className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-accent/40 via-accent to-white shadow-[0_0_12px_var(--accent)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0.4 : 1.7, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </IntroReady.Provider>
  );
}
