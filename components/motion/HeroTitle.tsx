"use client";

import { motion } from "motion/react";
import { heroContainer, heroWord } from "@/lib/motion";

/** Hero-заголовок: плавне розкриття stagger-ом по словах (розділ 6). */
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      className={className}
      variants={heroContainer}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span variants={heroWord} className="inline-block" aria-hidden="true">
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
