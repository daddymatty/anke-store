import type { ElementType, ReactNode } from "react";

/** Єдиний контейнер сторінки: max-w 1440 з боковими полями. */
export function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={`mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-12 ${className}`}>{children}</Tag>;
}
