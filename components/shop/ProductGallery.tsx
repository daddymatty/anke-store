"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconClose } from "@/components/ui/icons";
import { backdropFade, crossfade } from "@/lib/motion";
import type { ProductImage } from "@/lib/catalog/types";

/**
 * Галерея товару:
 *  - desktop: вертикальні мініатюри зліва + велике фото (crossfade), клік = лайтбокс-зум
 *  - mobile: горизонтальний свайп зі scroll-snap і точками
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div>
      {/* Desktop */}
      <div className="hidden gap-3 lg:flex">
        <ul className="flex w-20 flex-col gap-3" aria-label="Мініатюри фото">
          {images.map((img, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1} з ${images.length}`}
                aria-current={active === i}
                className={`relative block aspect-[3/4] w-full overflow-hidden bg-beige transition-opacity ${
                  active === i ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-beige"
            aria-label="Збільшити фото"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                variants={crossfade}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={images[active].url}
                  alt={images[active].alt}
                  fill
                  priority={active === 0}
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile: свайп зі scroll-snap */}
      <div className="lg:hidden">
        <div
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth"
          aria-label={`Фото товару ${title}`}
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.88));
            if (idx !== active) setActive(Math.min(idx, images.length - 1));
          }}
        >
          {images.map((img, i) => (
            <div key={i} className="relative aspect-[3/4] w-[88%] flex-shrink-0 snap-start overflow-hidden bg-beige">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="88vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === active ? "bg-ink" : "bg-line"}`}
            />
          ))}
        </div>
      </div>

      {/* Лайтбокс-зум */}
      <AnimatePresence>
        {zoomOpen && (
          <div className="fixed inset-0" style={{ zIndex: "var(--z-modal)" }}>
            <motion.div
              variants={backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-ink/90"
              onClick={() => setZoomOpen(false)}
            />
            <motion.div
              variants={crossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-4 md:inset-10"
              role="dialog"
              aria-modal="true"
              aria-label={`Фото: ${images[active].alt}`}
            >
              <div className="relative h-full w-full">
                <Image
                  src={images[active].url}
                  alt={images[active].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Закрити"
              className="absolute right-4 top-4 rounded-full bg-paper p-2.5"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
