"use client";
import { m } from "motion/react";

/** Page transition: each navigation re-mounts the template, fading the new page up into place. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
