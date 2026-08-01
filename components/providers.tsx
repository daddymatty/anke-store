"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Глобальні клієнтські провайдери.
 * MotionConfig reducedMotion="user" — жорстке правило розділу 6:
 * усі анімації вимикаються за prefers-reduced-motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
