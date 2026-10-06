"use client";
import Link from "next/link";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Media } from "./Media";
import { RevealText } from "../motion/Reveal";

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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const planetY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-40 pt-32 sm:pb-48"
    >
      <span aria-hidden className="stars" />

      {/* Glowing horizon: a huge planet rising from the bottom edge */}
      <m.div aria-hidden style={{ y: planetY }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh]">
        <div
          className="absolute left-1/2 top-0 aspect-square w-[260vw] -translate-x-1/2 rounded-[50%] sm:w-[200vw] lg:w-[160vw]"
          style={{
            background: "radial-gradient(closest-side, #070b1d 97%, transparent 100%)",
            boxShadow:
              "0 -2px 0 0 color-mix(in oklab, var(--accent) 70%, white), 0 -20px 80px -10px var(--accent), 0 -60px 180px 0 color-mix(in oklab, var(--accent) 40%, transparent)",
          }}
        />
      </m.div>

      <m.div style={{ y: textY, opacity: fade }} className="container-x relative grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <m.p
            className="kicker mb-6 flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <span className="inline-block h-px w-10 bg-accent" aria-hidden />
            {location}
          </m.p>
          <h1 id="hero-title" className="font-display text-display font-light tracking-tight">
            <RevealText as="span" immediate text={greeting} className="block text-ink-2" delay={0.15} />
            <RevealText as="span" immediate text={name} className="block font-medium" delay={0.3} />
          </h1>
          {title && (
            <m.p
              className="mt-8 max-w-xl font-serif text-[clamp(1.5rem,3vw,2.4rem)] italic leading-tight text-ink-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            >
              {title}
            </m.p>
          )}
          {subtitle && (
            <m.p
              className="mt-5 max-w-lg text-ink-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.65 }}
            >
              {subtitle}
            </m.p>
          )}
          <m.div
            className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}
          >
            <Link
              href="/work"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-display text-sm font-medium text-white shadow-[0_0_40px_-8px_var(--accent)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              {labels.viewWork}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center rounded-full border border-line-strong px-7 py-3.5 font-display text-sm transition-colors duration-300 hover:border-ink hover:bg-white/5"
            >
              {labels.contact}
            </Link>
          </m.div>
        </div>

        <m.div
          className="relative mx-auto hidden aspect-[4/5] w-full max-w-sm lg:block"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
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

      <m.a
        href="#work"
        className="kicker absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 hover:text-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        {labels.scroll}
        <span aria-hidden className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[drift_1.6s_ease-in-out_infinite_alternate] bg-ink" />
        </span>
      </m.a>
    </section>
  );
}
