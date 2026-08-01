"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { pageTransition } from "@/lib/motion";

// Перший рендер (SSR/гідрація) — без анімації, щоб не чіпати LCP;
// далі кожна навігація ремонтує template → плавний fade + subtle Y.
let firstLoadDone = false;

function consumeFirstLoad(): boolean {
  const wasDone = firstLoadDone;
  firstLoadDone = true;
  return wasDone;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const [animateEntry] = useState(consumeFirstLoad);
  return (
    <motion.div
      variants={pageTransition}
      initial={animateEntry ? "hidden" : false}
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
