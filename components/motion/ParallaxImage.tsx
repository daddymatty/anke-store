"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Паралакс зображення на 8–12% (розділ 6): анімується тільки transform,
 * контейнер має зарезервовану висоту — нуль CLS.
 */
export function ParallaxImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}
