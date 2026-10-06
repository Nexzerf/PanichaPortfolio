"use client";
import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

const finePointer = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia("(pointer: fine)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  get: () => window.matchMedia("(pointer: fine)").matches,
  server: () => false,
};

const INTERACTIVE = "a, button, [role='button'], label, select, summary, [data-cursor]";
const TEXT_INPUT = "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']), textarea, [contenteditable='true']";

type Mode = "default" | "hover" | "text" | "hidden";

/**
 * Minimal custom cursor: a small dot that tracks the pointer exactly and a thin ring
 * that trails it with a soft spring. The ring grows over links and buttons; over text
 * fields the native caret comes back. Desktop (fine pointer) only, off with reduced motion.
 */
export function CursorFollower() {
  const reduce = useReducedMotion();
  const fine = useSyncExternalStore(finePointer.subscribe, finePointer.get, finePointer.server);
  const enabled = fine && !reduce;
  const [mode, setMode] = useState<Mode>("hidden");
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as Element | null;
      setMode(el?.closest(TEXT_INPUT) ? "text" : el?.closest(INTERACTIVE) ? "hover" : "default");
    };
    const leave = () => setMode("hidden");
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const visible = mode !== "hidden" && mode !== "text";
  const hover = mode === "hover";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {/* Trailing ring */}
      <m.div className="absolute left-0 top-0" style={{ x: ringX, y: ringY }}>
        {/* Size/opacity animate with Motion; colours use a CSS transition (Motion can't tween color-mix/var colours). */}
        <m.div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300 ${
            hover ? "border-accent bg-accent/15" : "border-ink/35 bg-transparent"
          }`}
          animate={{
            width: hover ? 52 : 34,
            height: hover ? 52 : 34,
            opacity: visible ? 1 : 0,
            scale: pressed ? 0.85 : 1,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </m.div>
      {/* Exact dot */}
      <m.div className="absolute left-0 top-0" style={{ x, y }}>
        <m.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_12px_2px_var(--accent)]"
          animate={{ width: hover ? 4 : 6, height: hover ? 4 : 6, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </m.div>
    </div>
  );
}
