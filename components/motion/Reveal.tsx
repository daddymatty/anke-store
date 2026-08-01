"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { dur, easeUI, viewportOnce } from "@/lib/motion";

/**
 * Поява секції/елемента знизу на 16px при вході у в'юпорт (один раз).
 * Діти лишаються серверними — анімується тільки обгортка.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: dur.base, ease: easeUI, delay }}
    >
      {children}
    </motion.div>
  );
}
