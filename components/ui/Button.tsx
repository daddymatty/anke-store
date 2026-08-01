import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Кнопка ANKE. Варіанти:
 *  - primary: чорна (ink), білий текст — основні дії
 *  - accent:  пудрова (rose) — CTA покупки
 *  - outline: контурна — другорядні дії
 *  - ghost:   без фону — текстові дії
 */
type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "md" | "lg" | "sm";

const styles: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  accent: "bg-rose text-paper hover:bg-rose-deep",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-rose-deep",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px]",
  md: "h-11 px-6 text-[13px]",
  lg: "h-13 px-8 text-[14px]",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 uppercase tracking-[0.14em] font-medium " +
  "transition-colors duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none " +
  "select-none whitespace-nowrap";

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${baseClass} ${styles[variant]} ${sizes[size]} ${extra}`.trim();
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
