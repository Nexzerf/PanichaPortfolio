"use client";
import { LazyMotion, MotionConfig, domMax } from "motion/react";

/** Loads DOM animation + layout features and honours the OS reduced-motion setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
