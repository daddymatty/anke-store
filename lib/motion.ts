import type { Transition, Variants } from "motion/react";

/**
 * Централізовані токени руху ANKE (розділ 6 ТЗ).
 * Всі анімації в проєкті беруть значення ТІЛЬКИ звідси — жодних інлайнових магічних чисел.
 * Анімуються лише transform і opacity (height — тільки через layout-анімації).
 */

/** Тривалості, с */
export const dur = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
} as const;

/** Easing інтерфейсу */
export const easeUI = [0.25, 0.1, 0.25, 1] as const;

/** Spring для drawer і модалок */
export const springDrawer: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

/** Налаштування viewport для whileInView: один раз, з відступом */
export const viewportOnce = { once: true, margin: "-10%" } as const;

/** Стандартні transition-пресети */
export const tFast: Transition = { duration: dur.fast, ease: easeUI };
export const tBase: Transition = { duration: dur.base, ease: easeUI };
export const tSlow: Transition = { duration: dur.slow, ease: easeUI };

/** Поява знизу на 16px — картки товарів, секції */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: tBase },
};

/** Контейнер сітки: stagger дочірніх елементів 0.05s */
export const staggerGrid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

/** Перехід між сторінками: fade + subtle Y */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: tBase },
  exit: { opacity: 0, y: -8, transition: tFast },
};

/** Hero: розкриття заголовка stagger по словах */
export const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
export const heroWord: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: tSlow },
};

/** Drawer кошика: slide-in справа (spring) + backdrop fade */
export const drawerPanel: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: springDrawer },
  exit: { x: "100%", transition: tFast },
};
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tFast },
  exit: { opacity: 0, transition: tFast },
};

/** Мегаменю / розкривні панелі: 0.25s */
export const menuReveal: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeUI } },
  exit: { opacity: 0, y: -6, transition: tFast },
};

/** Crossfade (зміна фото товару при hover) */
export const crossfade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tBase },
  exit: { opacity: 0, transition: tBase },
};

/** Модалка (quick view, розмірна сітка) */
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: springDrawer },
  exit: { opacity: 0, scale: 0.97, transition: tFast },
};

/** Мікровзаємодія кнопок: scale на tap */
export const tapScale = { scale: 0.98 } as const;
