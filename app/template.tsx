import { PageTransition } from "@/components/motion/PageTransition";

/** Перехід між сторінками: fade + subtle Y (без затримки LCP на першому завантаженні). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
