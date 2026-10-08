"use client";
import Link from "next/link";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Media } from "./Media";
import { RevealText } from "../motion/Reveal";
import { useIntroReady } from "./IntroLoader";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({
  greeting,
  name,
  title,
  subtitle,
  photo,
  location,
  labels,
}: {
  greeting: string;
  name: string;
  title: string;
  subtitle: string;
  photo: string | null;
  location: string;
  labels: { viewWork: string; contact: string; scroll: string };
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Start the entrance only once the intro curtain has lifted.
  const ready = useIntroReady();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Gentle parallax only — the text never fades, so it stays readable while scrolling.
  const planetY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -40]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <span aria-hidden className="stars" />
      {/* Soft halo behind the copy so it reads clearly over the gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[70%] w-[70%] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(5 8 22 / 0.65), transparent)" }}
      />

      {/* Content: takes the space above the horizon */}
      <m.div
        style={{ y: textY }}
        className="container-x relative z-10 grid flex-1 items-center gap-12 pb-10 pt-32 sm:pt-36 lg:grid-cols-[1.4fr_1fr] lg:pb-14"
      >
        <div>
          {location && (
            <m.p
              className="kicker mb-6 flex items-center gap-3 text-ink-2"
              initial={{ opacity: 0, y: 12 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            >
              <span className="inline-block h-px w-10 bg-accent" aria-hidden />
              {location}
            </m.p>
          )}
          <h1 id="hero-title" className="font-display text-display font-light tracking-tight">
            <RevealText as="span" immediate play={ready} text={greeting} className="block text-ink/75" delay={0.15} />
            <RevealText as="span" immediate play={ready} text={name} className="block font-medium text-ink" delay={0.3} />
          </h1>
          {title && (
            <m.p
              className="mt-7 max-w-2xl font-serif text-[clamp(1.5rem,3vw,2.4rem)] italic leading-[1.15] text-ink/90"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            >
              {title}
            </m.p>
          )}
          {subtitle && (
            <m.p
              className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ink-2"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
            >
              {subtitle}
            </m.p>
          )}
          <m.div
            className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}
          >
            <Link
              href="/work"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-accent px-7 font-display text-sm font-medium leading-none text-white shadow-[0_0_40px_-8px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              {labels.viewWork}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/#contact"
              className="inline-flex h-12 items-center rounded-full border border-line-strong bg-white/[0.03] px-7 font-display text-sm leading-none text-ink transition-colors duration-300 hover:border-ink hover:bg-white/[0.08]"
            >
              {labels.contact}
            </Link>
          </m.div>
        </div>

        <m.div
          className="relative mx-auto hidden aspect-[4/5] w-full max-w-sm lg:block"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 30 }}
          transition={{ duration: 1.4, ease: EASE, delay: 0.4 }}
        >
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }}
          />
          <div className="relative h-full overflow-hidden rounded-[28px] border border-line shadow-[var(--shadow-glow)]">
            <Media src={photo} alt={name} label={name.charAt(0)} sizes="(min-width: 1024px) 384px, 0px" preload />
          </div>
        </m.div>
      </m.div>

      {/* Horizon: its own band under the content, so the glowing arc never crosses the text */}
      {/* The band reaches 8rem up to hold the glow, and a mask fades it out at the bottom,
          so the horizon dissolves into the page instead of ending on a hard line. */}
      <div
        aria-hidden
        className="pointer-events-none relative -mt-32 h-[calc(clamp(130px,20vh,220px)+8rem)] w-full shrink-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 22%, #000 58%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 22%, #000 58%, transparent 100%)",
        }}
      >
        <m.div style={{ y: planetY }} className="absolute inset-x-0 top-32 h-[200%]">
          <div
            className="absolute left-1/2 top-0 aspect-square w-[260vw] -translate-x-1/2 rounded-[50%] sm:w-[200vw] lg:w-[160vw]"
            style={{
              background: "radial-gradient(closest-side, #070b1d 97%, transparent 100%)",
              boxShadow:
                "0 -2px 0 0 color-mix(in oklab, var(--accent) 70%, white), 0 -20px 80px -10px var(--accent), 0 -60px 180px 0 color-mix(in oklab, var(--accent) 40%, transparent)",
            }}
          />
        </m.div>
      </div>

      <m.a
        href="#work"
        className="kicker absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-ink-2 hover:text-ink"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        {labels.scroll}
        <span aria-hidden className="relative h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[drift_1.6s_ease-in-out_infinite_alternate] bg-ink" />
        </span>
      </m.a>
    </section>
  );
}
