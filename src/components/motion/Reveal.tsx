"use client";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "header" | "p";
};

/** Fade + slight upward movement when the element scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Staggered word-by-word reveal for headlines. Keeps the full string for screen readers. */
export function RevealText({
  text,
  className,
  delay = 0,
  as = "h2",
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = as;
  // Thai has no spaces between words, so split on spaces when present, else animate the line as one.
  const words = text.includes(" ") ? text.split(" ") : [text];
  const visible = { opacity: 1, y: "0%" };
  const hidden = { opacity: 0, y: reduce ? "0%" : "60%" };
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <m.span
            className="inline-block will-change-transform"
            initial={hidden}
            {...(immediate ? { animate: visible } : { whileInView: visible, viewport: { once: true } })}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.06 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}

/** Image reveal: a clip-path wipe plus a gentle scale-down as it enters, and subtle parallax while scrolling. */
export function ImageReveal({
  children,
  className,
  parallax = 40,
}: {
  children: React.ReactNode;
  className?: string;
  parallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-parallax / 2, parallax / 2]);
  return (
    <m.div
      ref={ref}
      className={`relative overflow-hidden ${className ?? ""}`}
      initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(12% 6% 12% 6% round 24px)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <m.div className="absolute inset-[-6%]" style={{ y }}>
        <m.div
          className="relative h-full w-full"
          initial={{ scale: reduce ? 1 : 1.12 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          {children}
        </m.div>
      </m.div>
    </m.div>
  );
}
